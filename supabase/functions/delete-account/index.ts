import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }
    
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // 1. Anonymize user analytical sessions for global metrics (set to system uuid or null)
    const { error: sessionErr } = await supabase
      .from('sessions')
      .update({ user_id: '00000000-0000-0000-0000-000000000000' })
      .eq('user_id', user.id)

    if (sessionErr) {
      console.error("Error anonymizing sessions:", sessionErr)
    }

    // 2. Remove audio EO recordings from storage
    try {
      const { data: files } = await supabase.storage.from('audio-responses').list(`eo/${user.id}`)
      if (files && files.length > 0) {
        const paths = files.map(f => `eo/${user.id}/${f.name}`)
        await supabase.storage.from('audio-responses').remove(paths)
      }
    } catch (storageErr) {
      console.error("Error clearing audio storage:", storageErr)
    }

    // 3. Delete answers records
    const { error: ansErr } = await supabase
      .from('answers')
      .delete()
      .eq('user_id', user.id)

    if (ansErr) {
      console.error("Error deleting answers:", ansErr)
    }

    // 4. Delete user profile record
    const { error: userErr } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    if (userErr) {
      console.error("Error deleting user profile:", userErr)
    }

    // 5. Delete authentication user record from auth schema (requires service role auth context)
    const { error: authErr } = await supabase.auth.admin.deleteUser(user.id)
    if (authErr) {
      throw authErr
    }

    return new Response(
      JSON.stringify({ deleted: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
