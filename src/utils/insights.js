/**
 * Mock AI Insight Generator for Phase 0.
 *
 * Analyzes the last 7 days of local data and produces natural-language
 * cross-domain observations. Replaced by Claude API in Phase 2.
 */

import { getLastNDays } from './dates.js';

/**
 * Generates insights from recent daily logs.
 * @param {object} todayLog - Today's log data
 * @param {array} history - Array of past daily logs
 * @param {array} habits - Active habit definitions
 * @param {array} hobbies - Hobby definitions
 * @param {object} settings - User settings (budget, etc.)
 * @returns {string[]} Array of 2-4 insight strings
 */
export function generateInsights(todayLog, history, habits, hobbies, settings) {
  const insights = [];
  const recentDays = getLastNDays(7);

  // Build a lookup of logs by date
  const logMap = new Map();
  if (todayLog?.date) logMap.set(todayLog.date, todayLog);
  if (history) {
    for (const log of history) {
      if (log.date) logMap.set(log.date, log);
    }
  }

  // Collect recent data
  const recentLogs = recentDays
    .map((d) => logMap.get(d))
    .filter(Boolean);

  if (recentLogs.length < 2) {
    return [
      "📊 Keep logging daily! I'll need at least 2-3 days of data to start spotting patterns across your mood, sleep, habits, and spending.",
      "💡 Tip: The more consistently you log, the more personalized and accurate your insights become. Even a quick 2-minute check-in helps!",
    ];
  }

  // --- SLEEP vs MOOD correlation ---
  insights.push(...analyzeSleepMoodCorrelation(recentLogs));

  // --- HABIT CONSISTENCY ---
  insights.push(...analyzeHabitConsistency(recentLogs, habits));

  // --- SPENDING PATTERNS ---
  insights.push(...analyzeSpending(recentLogs, settings));

  // --- HOBBY TIME ---
  insights.push(...analyzeHobbyTime(recentLogs, hobbies));

  // --- CROSS-DOMAIN patterns ---
  insights.push(...analyzeCrossDomain(recentLogs, habits));

  // Return 2-4 insights, shuffled for variety
  const shuffled = insights.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(4, Math.max(2, shuffled.length)));
}

function analyzeSleepMoodCorrelation(logs) {
  const insights = [];
  const withSleep = logs.filter((l) => l.sleep?.hours > 0 && l.mood?.score > 0);

  if (withSleep.length >= 3) {
    const goodSleep = withSleep.filter((l) => l.sleep.hours >= 7);
    const poorSleep = withSleep.filter((l) => l.sleep.hours < 6);

    if (goodSleep.length > 0 && poorSleep.length > 0) {
      const avgMoodGood = avg(goodSleep.map((l) => l.mood.score));
      const avgMoodPoor = avg(poorSleep.map((l) => l.mood.score));
      const diff = avgMoodGood - avgMoodPoor;

      if (diff > 1.5) {
        insights.push(
          `😴 Sleep matters: Your mood averaged ${avgMoodGood.toFixed(1)}/10 on days you slept 7+ hours vs ${avgMoodPoor.toFixed(1)}/10 on days under 6 hours. That's a ${diff.toFixed(1)}-point swing — sleep is clearly a mood lever for you.`
        );
      } else if (diff > 0) {
        insights.push(
          `💤 On nights with 7+ hours of sleep, your mood was slightly higher (${avgMoodGood.toFixed(1)} vs ${avgMoodPoor.toFixed(1)}). The effect is subtle so far — keep logging to see if the pattern strengthens.`
        );
      }
    }

    // Average sleep report
    const avgSleep = avg(withSleep.map((l) => l.sleep.hours));
    if (avgSleep < 6.5) {
      insights.push(
        `⚠️ Your average sleep this week is ${avgSleep.toFixed(1)} hours — below the recommended 7-9 hours. Consider a consistent bedtime routine.`
      );
    } else if (avgSleep >= 7.5 && avgSleep <= 8.5) {
      insights.push(
        `✅ Great sleep consistency! You're averaging ${avgSleep.toFixed(1)} hours — right in the optimal 7.5–8.5 hour range.`
      );
    }
  }

  return insights;
}

function analyzeHabitConsistency(logs, habits) {
  const insights = [];
  const activeHabits = habits?.filter((h) => h.active !== false) || [];

  if (activeHabits.length === 0 || logs.length < 3) return insights;

  for (const habit of activeHabits) {
    const completedDays = logs.filter((l) => l.habits?.[habit.id] === true).length;
    const rate = completedDays / logs.length;

    if (rate === 1) {
      insights.push(
        `🔥 Perfect streak on "${habit.name}"! You've completed it every day this week. That's real consistency.`
      );
    } else if (rate >= 0.7) {
      insights.push(
        `💪 You're at ${Math.round(rate * 100)}% completion on "${habit.name}" — ${completedDays} out of ${logs.length} days. Strong momentum!`
      );
    } else if (rate <= 0.3 && rate > 0) {
      insights.push(
        `🌱 "${habit.name}" is at ${Math.round(rate * 100)}% this week. Try pairing it with an existing routine (like right after brushing teeth) to build the trigger.`
      );
    }
  }

  // Overall habit completion
  if (activeHabits.length > 1) {
    const totalPossible = activeHabits.length * logs.length;
    const totalDone = logs.reduce((sum, log) => {
      return sum + activeHabits.filter((h) => log.habits?.[h.id] === true).length;
    }, 0);
    const overallRate = totalDone / totalPossible;

    if (overallRate >= 0.8) {
      insights.push(
        `🏆 Across all ${activeHabits.length} habits, your completion rate is ${Math.round(overallRate * 100)}%. You're building a solid system.`
      );
    }
  }

  return insights;
}

function analyzeSpending(logs, settings) {
  const insights = [];
  const dailyBudget = settings?.dailyBudgetTarget || 1000;

  const withExpenses = logs.filter((l) => l.expenses && l.expenses.length > 0);

  if (withExpenses.length < 2) return insights;

  // Total spending
  const dailyTotals = withExpenses.map((l) => ({
    date: l.date,
    total: l.expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
  }));

  const avgDaily = avg(dailyTotals.map((d) => d.total));

  if (avgDaily > dailyBudget * 1.2) {
    insights.push(
      `💸 Your average daily spending this week is ₹${Math.round(avgDaily)} — ${Math.round((avgDaily / dailyBudget) * 100)}% of your ₹${dailyBudget} daily target. The biggest spending days: look for patterns.`
    );
  } else if (avgDaily <= dailyBudget * 0.8) {
    insights.push(
      `💰 Nice budgeting! You're averaging ₹${Math.round(avgDaily)}/day against your ₹${dailyBudget} target — ${Math.round(((dailyBudget - avgDaily) / dailyBudget) * 100)}% under budget this week.`
    );
  }

  // Category breakdown
  const categoryTotals = {};
  for (const log of withExpenses) {
    for (const exp of log.expenses) {
      const cat = exp.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (exp.amount || 0);
    }
  }

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategory && topCategory[1] > 0) {
    const total = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
    const pct = Math.round((topCategory[1] / total) * 100);
    if (pct >= 40) {
      insights.push(
        `📊 ${pct}% of your spending this week went to "${topCategory[0]}" (₹${Math.round(topCategory[1])}). That's your biggest category by far.`
      );
    }
  }

  return insights;
}

function analyzeHobbyTime(logs, hobbies) {
  const insights = [];
  const activeHobbies = hobbies || [];

  if (activeHobbies.length === 0) return insights;

  const withHobbies = logs.filter((l) => l.hobbies && Object.values(l.hobbies).some((m) => m > 0));

  if (withHobbies.length < 2) return insights;

  // Total hobby time this week
  const totalMinutes = withHobbies.reduce((sum, log) => {
    return sum + Object.values(log.hobbies || {}).reduce((s, m) => s + (m || 0), 0);
  }, 0);

  const avgMinutes = totalMinutes / logs.length;

  if (avgMinutes >= 45) {
    insights.push(
      `🎨 You're investing an average of ${Math.round(avgMinutes)} minutes/day on hobbies. That creative time is valuable for your overall well-being.`
    );
  } else if (avgMinutes > 0 && avgMinutes < 20) {
    insights.push(
      `🎯 Your hobby time is averaging ${Math.round(avgMinutes)} min/day. Even 15-30 minutes of creative time daily has been linked to better mood and lower stress.`
    );
  }

  // Most-practiced hobby
  const hobbyTotals = {};
  for (const log of withHobbies) {
    for (const [id, mins] of Object.entries(log.hobbies || {})) {
      hobbyTotals[id] = (hobbyTotals[id] || 0) + (mins || 0);
    }
  }

  const topHobby = Object.entries(hobbyTotals).sort((a, b) => b[1] - a[1])[0];
  if (topHobby) {
    const hobbyName = activeHobbies.find((h) => h.id === topHobby[0])?.name || topHobby[0];
    insights.push(
      `⭐ "${hobbyName}" leads your hobby time this week at ${topHobby[1]} total minutes. Your most practiced skill!`
    );
  }

  return insights;
}

function analyzeCrossDomain(logs, habits) {
  const insights = [];
  const activeHabits = habits?.filter((h) => h.active !== false) || [];

  if (logs.length < 3 || activeHabits.length === 0) return insights;

  // Exercise (or any physical habit) vs mood
  const exerciseHabit = activeHabits.find((h) =>
    h.name.toLowerCase().includes('exercise') ||
    h.name.toLowerCase().includes('workout') ||
    h.name.toLowerCase().includes('gym') ||
    h.name.toLowerCase().includes('run')
  );

  if (exerciseHabit) {
    const exerciseDays = logs.filter((l) => l.habits?.[exerciseHabit.id] === true && l.mood?.score > 0);
    const noExerciseDays = logs.filter((l) => l.habits?.[exerciseHabit.id] !== true && l.mood?.score > 0);

    if (exerciseDays.length >= 2 && noExerciseDays.length >= 1) {
      const moodWith = avg(exerciseDays.map((l) => l.mood.score));
      const moodWithout = avg(noExerciseDays.map((l) => l.mood.score));
      const diff = moodWith - moodWithout;

      if (diff > 1) {
        insights.push(
          `🏃 On days you exercise, your mood averages ${moodWith.toFixed(1)}/10 vs ${moodWithout.toFixed(1)}/10 on rest days. Movement clearly lifts your mood.`
        );
      }
    }
  }

  // Spending vs mood
  const withBoth = logs.filter(
    (l) => l.mood?.score > 0 && l.expenses && l.expenses.length > 0
  );

  if (withBoth.length >= 3) {
    const highMood = withBoth.filter((l) => l.mood.score >= 7);
    const lowMood = withBoth.filter((l) => l.mood.score <= 4);

    if (highMood.length > 0 && lowMood.length > 0) {
      const spendHigh = avg(highMood.map((l) => l.expenses.reduce((s, e) => s + (e.amount || 0), 0)));
      const spendLow = avg(lowMood.map((l) => l.expenses.reduce((s, e) => s + (e.amount || 0), 0)));

      if (spendLow > spendHigh * 1.3) {
        insights.push(
          `🤔 Interesting: You tend to spend more on low-mood days (₹${Math.round(spendLow)} avg) compared to high-mood days (₹${Math.round(spendHigh)} avg). Emotional spending is worth being aware of.`
        );
      }
    }
  }

  return insights;
}

/* Utility: compute average of an array of numbers */
function avg(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}
