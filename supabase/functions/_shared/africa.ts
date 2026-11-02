// Pays éligibles au tarif Afrique (-40 %) — codes ISO 3166-1 alpha-2.
// Le pays du profil n'est qu'une déclaration : l'éligibilité est confirmée par
// le pays de facturation saisi chez Stripe (voir stripe-webhook).
export const AFRICA_DISCOUNT_COUNTRIES = ['BJ', 'BF', 'CM', 'CI', 'SN', 'ML', 'TG', 'GN', 'NE', 'TD', 'GA', 'CG']

export function isAfricaDiscountCountry(country: string | null | undefined): boolean {
  return AFRICA_DISCOUNT_COUNTRIES.includes(String(country ?? '').trim().toUpperCase())
}
