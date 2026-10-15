-- ================================================================
-- Migration 020 — Idempotence des paiements
-- Empêche qu'un même paiement (webhook rejoué ou reçu en parallèle)
-- crédite deux fois un pack. grantPack() s'appuie sur ces index
-- (erreur 23505 = paiement déjà traité).
-- ================================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_packs_fedapay_tx
  ON public.user_pack_subscriptions(fedapay_transaction_id)
  WHERE fedapay_transaction_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_packs_stripe_pi
  ON public.user_pack_subscriptions(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_attempts_fedapay_tx
  ON public.payment_attempts(fedapay_transaction_id)
  WHERE fedapay_transaction_id IS NOT NULL;
