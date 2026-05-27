export interface Badge {
  slug: string
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xp_reward: number
}

export const BADGES_DEFINITION: Badge[] = [
  {
    slug: 'first-step',
    name: 'Premier Pas',
    description: 'Compléter le test diagnostique',
    rarity: 'common',
    xp_reward: 50,
  },
  {
    slug: 'week-warrior',
    name: 'Guerrier Hebdomadaire',
    description: '7 jours de streak consécutifs',
    rarity: 'common',
    xp_reward: 100,
  },
  {
    slug: 'month-master',
    name: 'Maître du Mois',
    description: '30 jours de streak consécutifs',
    rarity: 'rare',
    xp_reward: 500,
  },
  {
    slug: 'perfectionist',
    name: 'Perfectionniste',
    description: 'Score 100% sur un module (5 fois)',
    rarity: 'rare',
    xp_reward: 300,
  },
  {
    slug: 'marathon',
    name: 'Marathonien',
    description: '10 simulations complètes',
    rarity: 'epic',
    xp_reward: 500,
  },
  {
    slug: 'speed-runner',
    name: 'Speed Runner',
    description: 'Terminer un module en moins de 50% du temps alloué',
    rarity: 'rare',
    xp_reward: 200,
  },
  {
    slug: 'co-expert',
    name: 'Expert CO',
    description: "Taux de maîtrise >= 85% en Compréhension de l'Oral",
    rarity: 'epic',
    xp_reward: 400,
  },
  {
    slug: 'ce-expert',
    name: 'Expert CE',
    description: 'Taux de maîtrise >= 85% en Compréhension des Écrits',
    rarity: 'epic',
    xp_reward: 400,
  },
  {
    slug: 'ee-expert',
    name: 'Expert EE',
    description: 'Score moyen >= 85% en Expression Écrite',
    rarity: 'epic',
    xp_reward: 400,
  },
  {
    slug: 'eo-expert',
    name: 'Expert EO',
    description: 'Score moyen >= 85% en Expression Orale',
    rarity: 'epic',
    xp_reward: 400,
  },
  {
    slug: 'master',
    name: 'Maître C2',
    description: 'Maîtrise >= 85% sur les 4 modules',
    rarity: 'legendary',
    xp_reward: 2000,
  },
  {
    slug: 'ambassador',
    name: 'Ambassadeur',
    description: '5 parrainages convertis',
    rarity: 'rare',
    xp_reward: 750,
  }
]
