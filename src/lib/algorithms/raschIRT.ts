import { CATQuestion, DifficultyTier } from "@/types";

export const DEFAULT_INITIAL_THETA = 0.50; // Initial ability parameter (Intermediate tier)
export const IRT_LEARNING_RATE_ALPHA = 0.20; // Stochastic step rate
export const IRT_DISCRIMINATION_SCALING = 3.0; // Steepness scaling factor

/**
 * 1-Parameter Logistic (1-PL / Rasch) IRT Probability Function
 * Calculates the theoretical probability that a learner with ability θ
 * correctly answers a question of calibrated difficulty D.
 *
 * P(correct | θ, D) = 1 / (1 + exp(-3.0 * (θ - D)))
 */
export function calculateProbabilityOfSuccess(theta: number, difficulty: number): number {
  const logit = -IRT_DISCRIMINATION_SCALING * (theta - difficulty);
  return 1 / (1 + Math.exp(logit));
}

/**
 * Updates the learner's latent ability parameter (θ) after an answer is submitted.
 *
 * θ_{k+1} = θ_k + α * (y - P(correct | θ_k, D))
 * Clamped strictly to [0.10, 0.98] to prevent unbounded divergence.
 */
export function updateLatentAbility(
  currentTheta: number,
  isCorrect: boolean,
  questionDifficulty: number
): number {
  const y = isCorrect ? 1.0 : 0.0;
  const p = calculateProbabilityOfSuccess(currentTheta, questionDifficulty);
  const delta = IRT_LEARNING_RATE_ALPHA * (y - p);
  const newTheta = currentTheta + delta;

  // Clamp within psychometric scale
  return Math.min(0.98, Math.max(0.10, Number(newTheta.toFixed(3))));
}

/**
 * Maps a discrete difficulty tier (1-5) to a continuous calibrated difficulty D in [0.10, 0.95]
 */
export function tierToCalibratedDifficulty(tier: DifficultyTier): number {
  switch (tier) {
    case 1: return 0.20; // Beginner
    case 2: return 0.38; // Elementary
    case 3: return 0.55; // Intermediate
    case 4: return 0.72; // Advanced
    case 5: return 0.90; // Principal / Expert
    default: return 0.50;
  }
}

/**
 * Converts continuous latent ability θ into human-readable proficiency tier and label
 */
export function thetaToProficiencyDescription(theta: number): {
  tier: DifficultyTier;
  label: string;
  percentage: number;
  badge: string;
} {
  const percentage = Math.round(theta * 100);
  if (theta >= 0.85) {
    return { tier: 5, label: "Principal / Expert", percentage, badge: "🌟 Master of Skill" };
  } else if (theta >= 0.68) {
    return { tier: 4, label: "Advanced Practitioner", percentage, badge: "💎 Advanced Verified" };
  } else if (theta >= 0.48) {
    return { tier: 3, label: "Intermediate Competent", percentage, badge: "⚡ Solid Competence" };
  } else if (theta >= 0.30) {
    return { tier: 2, label: "Developing Learner", percentage, badge: "🌱 Foundations In-Progress" };
  } else {
    return { tier: 1, label: "Beginner", percentage, badge: "📘 Novice" };
  }
}

/**
 * Selects the optimal next question from available pool to maximize Fisher Information
 * (i.e. Selects item whose calibrated difficulty D is closest to current ability θ).
 */
export function selectNextCalibratedQuestion(
  questionPool: CATQuestion[],
  currentTheta: number,
  answeredQuestionIds: string[]
): CATQuestion | null {
  const unAnswered = questionPool.filter((q) => !answeredQuestionIds.includes(q.id));
  if (unAnswered.length === 0) return null;

  // Find question with minimal distance |D - θ|
  let bestQuestion = unAnswered[0];
  let minDistance = Math.abs(bestQuestion.calibratedDifficulty - currentTheta);

  for (let i = 1; i < unAnswered.length; i++) {
    const distance = Math.abs(unAnswered[i].calibratedDifficulty - currentTheta);
    if (distance < minDistance) {
      minDistance = distance;
      bestQuestion = unAnswered[i];
    }
  }

  return bestQuestion;
}
