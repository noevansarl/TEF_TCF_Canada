const fs = require('fs');
const path = require('path');

// 1. Read .env file
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('✖ Error: .env file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    // remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const anonKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !anonKey) {
  console.error('✖ Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in .env');
  process.exit(1);
}

console.log('🔍 Testing Supabase Database connection...');
console.log('Host URL:', supabaseUrl);

const queryUrl = `${supabaseUrl}/rest/v1/questions?select=id&limit=1`;

// 2. Perform Fetch Request
fetch(queryUrl, {
  method: 'GET',
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json'
  }
})
.then(async res => {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return res.json();
})
.then(data => {
  console.log('\n✔ Connection verified successfully!');
  console.log('✔ REST API is active and responding.');
  console.log('✔ Database connection works correctly.');
  if (data && data.length > 0) {
    console.log('✔ Retrieved sample question ID:', data[0].id);
  } else {
    console.log('⚠ Database connected, but the questions table is empty.');
  }
  process.exit(0);
})
.catch(err => {
  console.error('\n✖ Connection failed!');
  console.error('Error Details:', err.message);
  process.exit(1);
});
