import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Définition des packs (source de vérité côté serveur)
const PACKS: Record<string, {
  name: string
  price_eur: number
  price_xof: number
  duration_days: number
  ai_trials: number
  co_tests: number
  ce_tests: number
  simulations: number
}> = {
  bronze:   { name: 'Pack Découverte',  price_eur: 14.99, price_xof: 9800,  duration_days: 5,  ai_trials: 3,  co_tests: 40,  ce_tests: 40,  simulations: 1  },
  silver:   { name: 'Pack Préparation', price_eur: 29.99, price_xof: 19600, duration_days: 30, ai_trials: 8,  co_tests: 120, ce_tests: 120, simulations: 5  },
  gold:     { name: 'Pack Intensif',    price_eur: 49.99, price_xof: 32700, duration_days: 60, ai_trials: 15, co_tests: 300, ce_tests: 300, simulations: 12 },
  platinum: { name: 'Pack Champion',    price_eur: 79.99, price_xof: 52300, duration_days: 90, ai_trials: 30, co_tests: -1,  ce_tests: -1,  simulations: -1 },
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer l'utilisateur depuis le JWT
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { pack_id, payment_method, payment_currency, amount_paid, payment_ref } =
      await req.json()

    // Valider le pack
    const pack = PACKS[pack_id]
    if (!pack) {
      return new Response(JSON.stringify({ error: `Pack inconnu: ${pack_id}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Vérifier le montant payé (anti-fraude)
    const expected_amount = payment_currency === 'XOF' ? pack.price_xof : pack.price_eur
    if (Math.abs(amount_paid - expected_amount) > 0.5) {
      console.error(`Montant suspect: reçu ${amount_paid}, attendu ${expected_amount}`)
      return new Response(JSON.stringify({ error: 'Montant invalide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculer la date d'expiration
    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + pack.duration_days)

    // Créer l'abonnement pack
    const { data: subscription, error: subError } = await supabase
      .from('user_pack_subscriptions')
      .insert({
        user_id:               user.id,
        pack_id,
        expires_at:            expires_at.toISOString(),
        payment_method:        payment_method || 'stripe',
        payment_currency:      payment_currency || 'EUR',
        amount_paid,
        ai_trials_remaining:   pack.ai_trials,
        co_tests_remaining:    pack.co_tests,
        ce_tests_remaining:    pack.ce_tests,
        simulations_remaining: pack.simulations,
        status:                'active',
        stripe_payment_intent_id: payment_method === 'stripe' ? payment_ref : null,
        fedapay_transaction_id:   payment_method !== 'stripe' ? payment_ref : null,
      })
      .select()
      .single()

    if (subError) throw subError

    // Mettre à jour le profil utilisateur
    await supabase
      .from('users')
      .update({
        active_pack_id:  pack_id,
        pack_expires_at: expires_at.toISOString(),
        subscription_tier: pack_id, // Compatibilité avec l'existant
      })
      .eq('id', user.id)

    // Notification de confirmation (optionnel — FCM ou email)
    console.log(`Pack ${pack.name} activé pour user ${user.id}, expire le ${expires_at.toISOString()}`)

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: subscription.id,
        pack_name:        pack.name,
        expires_at:       expires_at.toISOString(),
        features: {
          ai_trials:   pack.ai_trials,
          co_tests:    pack.co_tests === -1 ? 'illimité' : pack.co_tests,
          ce_tests:    pack.ce_tests === -1 ? 'illimité' : pack.ce_tests,
          simulations: pack.simulations === -1 ? 'illimité' : pack.simulations,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('activate-pack error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
