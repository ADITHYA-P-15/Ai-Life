/**
 * Life Score computation for the Personal AI Life Dashboard.
 *
 * Formula: 0.25 × moodNorm + 0.20 × sleepNorm + 0.25 × habitsNorm + 0.15 × hobbiesNorm + 0.15 × budgetNorm
 * Each domain value is normalized to 0–100.
 */

const WEIGHTS = {
  mood: 0.25,
  sleep: 0.20,
  habits: 0.25,
  hobbies: 0.15,
  budget: 0.15,
};

/**
 * Normalizes mood score (1-10) to 0-100.
 */
export function normalizeMood(moodScore) {
  if (!moodScore || moodScore < 1) return 0;
  return Math.min(100, Math.max(0, ((moodScore - 1) / 9) * 100));
}

/**
 * Normalizes sleep hours to 0-100 using a bell curve centered on 8 hours.
 * 7-9 hours = 90-100, drops off sharply outside that range.
 */
export function normalizeSleep(hours, quality) {
  if (!hours && hours !== 0) return 0;

  // Bell curve: optimal is 7.5-8.5h
  let hourScore;
  if (hours >= 7 && hours <= 9) {
    hourScore = 90 + (1 - Math.abs(hours - 8)) * 10;
  } else if (hours >= 6 && hours < 7) {
    hourScore = 60 + (hours - 6) * 30;
  } else if (hours > 9 && hours <= 10) {
    hourScore = 90 - (hours - 9) * 20;
  } else if (hours >= 5 && hours < 6) {
    hourScore = 35 + (hours - 5) * 25;
  } else if (hours > 10 && hours <= 11) {
    hourScore = 70 - (hours - 10) * 30;
  } else if (hours < 5) {
    hourScore = Math.max(5, hours * 7);
  } else {
    hourScore = Math.max(20, 40 - (hours - 11) * 10);
  }

  // Quality bonus/penalty
  const qualityMultiplier = {
    poor: 0.7,
    fair: 0.85,
    good: 1.0,
    great: 1.1,
  };

  const multiplier = qualityMultiplier[quality] || 1.0;
  return Math.min(100, Math.max(0, Math.round(hourScore * multiplier)));
}

/**
 * Normalizes habit completion to 0-100.
 * @param {object} habitCompletions - { habitId: boolean }
 * @param {array} activeHabits - Array of active habit objects
 */
export function normalizeHabits(habitCompletions, activeHabits) {
  if (!activeHabits || activeHabits.length === 0) return 0;
  const completed = activeHabits.filter((h) => habitCompletions[h.id]).length;
  return Math.round((completed / activeHabits.length) * 100);
}

/**
 * Normalizes hobby time to 0-100.
 * @param {object} hobbyTimes - { hobbyId: minutes }
 * @param {number} targetMinutes - Daily hobby time target (default: 60)
 */
export function normalizeHobbies(hobbyTimes, targetMinutes = 60) {
  if (!hobbyTimes) return 0;
  const totalMinutes = Object.values(hobbyTimes).reduce((sum, m) => sum + (m || 0), 0);
  if (targetMinutes <= 0) return totalMinutes > 0 ? 100 : 0;
  return Math.min(100, Math.round((totalMinutes / targetMinutes) * 100));
}

/**
 * Normalizes budget adherence to 0-100.
 * @param {number} totalSpent - Today's total spending
 * @param {number} dailyBudget - Daily budget target
 */
export function normalizeBudget(totalSpent, dailyBudget) {
  if (!dailyBudget || dailyBudget <= 0) return 0;
  if (totalSpent <= 0) return 0;
  const ratio = totalSpent / dailyBudget;
  if (ratio <= 0.8) return 100;
  if (ratio <= 1.0) return 100 - (ratio - 0.8) * 50; // 80-100% budget = 90-100 score
  if (ratio <= 1.5) return Math.max(20, 90 - (ratio - 1.0) * 140); // Over budget drops fast
  return Math.max(0, 20 - (ratio - 1.5) * 40);
}

/**
 * Computes the overall Life Score (0-100).
 * @param {object} params
 * @returns {{ total: number, breakdown: object }}
 */
export function computeLifeScore({
  hasLog = true,
  moodScore,
  sleepHours,
  sleepQuality,
  habitCompletions,
  activeHabits,
  hobbyTimes,
  hobbyTarget,
  totalSpent,
  dailyBudget,
}) {
  if (!hasLog) {
    return {
      total: 0,
      breakdown: { mood: 0, sleep: 0, habits: 0, hobbies: 0, budget: 0 },
      weights: WEIGHTS,
    };
  }

  const breakdown = {
    mood: normalizeMood(moodScore),
    sleep: normalizeSleep(sleepHours, sleepQuality),
    habits: normalizeHabits(habitCompletions, activeHabits),
    hobbies: normalizeHobbies(hobbyTimes, hobbyTarget),
    budget: normalizeBudget(totalSpent, dailyBudget),
  };

  const total = Math.round(
    WEIGHTS.mood * breakdown.mood +
    WEIGHTS.sleep * breakdown.sleep +
    WEIGHTS.habits * breakdown.habits +
    WEIGHTS.hobbies * breakdown.hobbies +
    WEIGHTS.budget * breakdown.budget
  );

  return { total: Math.min(100, Math.max(0, total)), breakdown, weights: WEIGHTS };
}

/**
 * Returns a color for a given score value (0-100).
 * Red → Amber → Green gradient.
 */
export function getScoreColor(score) {
  if (score >= 75) return '#10b981'; // emerald
  if (score >= 50) return '#f59e0b'; // amber
  if (score >= 25) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * Returns a label for a given score value.
 */
export function getScoreLabel(score) {
  if (score >= 90) return 'Outstanding';
  if (score >= 75) return 'Great';
  if (score >= 60) return 'Good';
  if (score >= 45) return 'Okay';
  if (score >= 30) return 'Needs Work';
  return 'Rough Day';
}
