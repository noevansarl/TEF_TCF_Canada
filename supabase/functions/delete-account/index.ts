import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = ['https://ayeprep.com', 'https://www.ayeprep.com', 'http://localhost:5173']

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    // Anonymiser les sessions pour les métriques globales
    await supabase.from('sessions')
      .update({ user_id: '00000000-0000-0000-0000-000000000000' })
      .eq('user_id', user.id)

    // Supprimer les enregistrements audio EO
    try {
      const { data: files } = await supabase.storage.from('audio-responses').list(`eo/${user.id}`)
      if (files && files.length > 0) {
        await supabase.storage.from('audio-responses').remove(files.map((f: { name: string }) => `eo/${user.id}/${f.name}`))
      }
    } catch (_storageErr) { /* non-bloquant */ }

    await supabase.from('answers').delete().eq('user_id', user.id)
    await supabase.from('users').delete().eq('id', user.id)

    const { error: authErr } = await supabase.auth.admin.deleteUser(user.id)
    if (authErr) throw authErr

    return new Response(JSON.stringify({ deleted: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
