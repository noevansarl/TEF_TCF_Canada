export type NCLCLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'NCLC 4' | 'NCLC 5' | 'NCLC 6' | 'NCLC 7' | 'NCLC 8' | 'NCLC 9' | 'NCLC 10+';

export interface ScoreMapping {
  score_699: number;
  nclc: string;
}

// TEF Canada uses a 699 scale.
export function calculateTEFScoreAndNCLC(correctAnswers: number, totalQuestions: number, module: 'CO' | 'CE'): ScoreMapping {
  // Approximate conversion: raw score proportional mapping to 699.
  const scorePercent = totalQuestions > 0 ? (correctAnswers / totalQuestions) : 0;
  // Official TEF scale maps roughly to linear percentages for the higher bounds
  const score_699 = Math.round(scorePercent * 699);

  let nclc = 'A1';
  if (module === 'CO') {
    if (score_699 >= 546) nclc = 'C2';
    else if (score_699 >= 503) nclc = 'C1';
    else if (score_699 >= 462) nclc = 'B2+';
    else if (score_699 >= 434) nclc = 'B2';
    else if (score_699 >= 393) nclc = 'B1+';
    else if (score_699 >= 352) nclc = 'B1';
    else if (score_699 >= 306) nclc = 'A2';
  } else if (module === 'CE') {
    if (score_699 >= 546) nclc = 'C2';
    else if (score_699 >= 512) nclc = 'C1';
    else if (score_699 >= 472) nclc = 'B2+';
    else if (score_699 >= 428) nclc = 'B2';
    else if (score_699 >= 379) nclc = 'B1+';
    else if (score_699 >= 330) nclc = 'B1';
    else if (score_699 >= 268) nclc = 'A2';
  }

  return { score_699, nclc };
}

// TCF Canada uses a 699 scale.
export function calculateTCFScoreAndNCLC(correctAnswers: number, totalQuestions: number, module: 'CO' | 'CE'): ScoreMapping {
  const scorePercent = totalQuestions > 0 ? (correctAnswers / totalQuestions) : 0;
  const score_699 = Math.round(scorePercent * 699);

  let nclc = 'A1';
  if (module === 'CO') {
    if (score_699 >= 549) nclc = 'C2';
    else if (score_699 >= 523) nclc = 'C1';
    else if (score_699 >= 503) nclc = 'B2+';
    else if (score_699 >= 458) nclc = 'B2';
    else if (score_699 >= 398) nclc = 'B1';
    else if (score_699 >= 331) nclc = 'A2';
  } else if (module === 'CE') {
    if (score_699 >= 549) nclc = 'C2';
    else if (score_699 >= 524) nclc = 'C1';
    else if (score_699 >= 499) nclc = 'B2+';
    else if (score_699 >= 453) nclc = 'B2';
    else if (score_699 >= 406) nclc = 'B1';
    else if (score_699 >= 342) nclc = 'A2';
  }

  return { score_699, nclc };
}

export function getGlobalNCLC(scores: { module: string, nclc: string }[]): string {
  if (scores.length === 0) return 'A1';

  const nclcRank: Record<string, number> = {
    'C2': 6, 'C1': 5, 'B2+': 4, 'B2': 3, 'B1+': 2, 'B1': 2, 'A2': 1, 'A1': 0
  };

  let minRank = 999;
  let minNclc = 'C2';

  for (const s of scores) {
    // If nclc string is something like "C1", extract it. 
    // Sometimes it might come as NCLC 7, map it.
    let rankLabel = s.nclc;
    if (s.nclc.startsWith('NCLC')) {
      const num = parseInt(s.nclc.replace('NCLC ', ''));
      if (num >= 10) rankLabel = 'C2';
      else if (num === 9) rankLabel = 'C1';
      else if (num === 8) rankLabel = 'B2+';
      else if (num === 7) rankLabel = 'B2';
      else if (num === 6) rankLabel = 'B1';
      else if (num === 5) rankLabel = 'B1';
      else rankLabel = 'A2';
    }

    const rank = nclcRank[rankLabel] ?? 0;
    if (rank < minRank) {
      minRank = rank;
      minNclc = rankLabel;
    }
  }

  return minNclc;
}
