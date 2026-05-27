import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Pas d'auth requise (visiteur non connecté peut cliquer un lien affilié)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { code, page_url, referrer_url } = await req.json()

    if (!code || typeof code !== 'string' || code.length > 20) {
      return new Response(JSON.stringify({ error: 'Code invalide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '')

    // Récupérer l'IP depuis les headers (Cloudflare / Deno Deploy)
    const ip = req.headers.get('CF-Connecting-IP')
              ?? req.headers.get('X-Real-IP')
              ?? req.headers.get('X-Forwarded-For')?.split(',')[0].trim()
              ?? null

    const userAgent = req.headers.get('User-Agent') ?? null

    // Appeler la fonction SQL track_affiliate_click
    const { data, error } = await supabase.rpc('track_affiliate_click', {
      p_code:       cleanCode,
      p_page_url:   page_url   ?? null,
      p_referrer:   referrer_url ?? null,
      p_ip:         ip,
      p_user_agent: userAgent,
    })

    if (error) {
      console.error('track_affiliate_click error:', error)
      return new Response(JSON.stringify({ error: 'Erreur tracking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(
      JSON.stringify({ success: true, click_id: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('track-affiliate error:', err)
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
