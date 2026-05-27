/**
 * AffiliateTracker — composant "invisible" monté globalement dans App.tsx.
 *
 * Rôle unique : appeler useAffiliateTracking() pour détecter ?ref=CODE
 * dans l'URL et enregistrer le clic affilié. Ne rend rien dans le DOM.
 */

import { useAffiliateTracking } from '../hooks/useAffiliateTracking'

export function AffiliateTracker(): null {
  useAffiliateTracking()
  return null
}
