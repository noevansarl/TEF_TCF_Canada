class EnvConfig {
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://ifbbwbyxdjxsbuilzzig.supabase.co',
  );

  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYmJ3Ynl4ZGp4c2J1aWx6emlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTAyMjgsImV4cCI6MjA5NTM4NjIyOH0.e1bFFwA5manLRKmftPrau9MbwoVTHIMng__4-s3Qkwo',
  );

  static const String revenueCatApiKeyAndroid = String.fromEnvironment(
    'REVENUECAT_API_KEY_ANDROID',
    defaultValue: 'goog_placeholder_api_key',
  );

  static const String revenueCatApiKeyiOS = String.fromEnvironment(
    'REVENUECAT_API_KEY_IOS',
    defaultValue: 'appl_placeholder_api_key',
  );
}
