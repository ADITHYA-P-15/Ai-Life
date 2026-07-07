function toIsoDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function getRecentLogs(history = [], todayLog = {}) {
  const logMap = new Map();
  for (const log of history || []) {
    if (log?.date) logMap.set(toIsoDate(log.date), log);
  }
  if (todayLog?.date) logMap.set(toIsoDate(todayLog.date), todayLog);

  return Array.from(logMap.values())
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .filter((log) => log?.date);
}

function average(values) {
  const usable = values.filter((value) => Number.isFinite(value));
  if (usable.length === 0) return null;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function totalExpenses(log) {
  return (log?.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function hobbyMinutes(log) {
  return Object.values(log?.hobbies || {}).reduce((sum, minutes) => sum + Number(minutes || 0), 0);
}

function completedHabitsCount(log, habits = []) {
  return habits.filter((habit) => Boolean(log?.habits?.[habit.id])).length;
}

function describeMood(score) {
  if (!score) return 'unclear';
  if (score >= 8) return 'bright';
  if (score >= 6) return 'steady';
  if (score >= 4) return 'mixed';
  return 'heavy';
}

export function buildDailyReflection({ todayLog, history, habits, hobbies, settings, lifeScore }) {
  if (!todayLog?.hasLog) {
    return {
      bullets: [
        'No check-in has been logged yet today.',
        'Positive: a blank slate still counts as a clean starting point.',
        'Growth: one small mood or sleep signal will give the dashboard something meaningful to learn from.',
        'Tomorrow: start with one tiny action before the day gets crowded.',
      ],
      highlight: 'A blank slate still counts as a clean starting point.',
      suggestion: 'Start with one mood score or one short note.',
    };
  }

  const completed = habits.filter((habit) => Boolean(todayLog?.habits?.[habit.id])).length;
  const spend = totalExpenses(todayLog);
  const hobbyMins = hobbyMinutes(todayLog);
  const moodScore = Number(todayLog?.mood?.score || 0);
  const sleepHours = Number(todayLog?.sleep?.hours || 0);
  const quality = todayLog?.sleep?.quality || 'not rated';
  const summary = `Today felt ${describeMood(moodScore)} overall, with a mood score of ${moodScore}/10.`;
  const positive = todayLog?.microWin
    ? 'Positive: you marked a micro win, which is a strong sign of momentum.'
    : completed > 0
      ? `Positive: you completed ${completed} ${completed === 1 ? 'habit' : 'habits'} today.`
      : 'Positive: you still showed up and logged the day, which matters.';
  const growth = sleepHours && sleepHours < 7
    ? 'Growth: a bit more recovery would make tomorrow feel lighter.'
    : spend > 0 && settings?.dailyBudgetTarget && spend > settings.dailyBudgetTarget
      ? `Growth: spending reached Rs ${Math.round(spend)}, so a tighter cap next time could help.`
      : 'Growth: one small ritual or recovery point could make tomorrow smoother.';
  const tomorrow = moodScore < 6
    ? 'Tomorrow: keep the first step tiny and protect one calm ritual early.'
    : completed > 0
      ? 'Tomorrow: repeat the strongest part of today before the day gets crowded.'
      : 'Tomorrow: choose one small action and do it before noon.';
  const snapshot = `Snapshot: ${completed}/${habits.length || 0} habits, ${spend > 0 ? `Rs ${Math.round(spend)} spent` : 'no spend logged'}, and ${hobbyMins > 0 ? `${Math.round(hobbyMins)} minutes of hobbies` : 'no hobby time logged'}.`;

  return {
    bullets: [summary, positive, growth, tomorrow, snapshot].filter(Boolean).slice(0, 5),
    highlight: positive.replace('Positive: ', ''),
    suggestion: tomorrow.replace('Tomorrow: ', ''),
  };
}

export function buildWeeklyInsight({ todayLog, history, habits, settings }) {
  const logs = getRecentLogs(history, todayLog).slice(0, 7);
  if (logs.length < 3) {
    return 'Not enough data yet to spot a weekly pattern — keep logging and I can point to a real rhythm.';
  }

  const moodScores = logs.map((log) => Number(log?.mood?.score || 0)).filter((value) => Number.isFinite(value));
  const sleepHours = logs.map((log) => Number(log?.sleep?.hours || 0)).filter((value) => Number.isFinite(value));
  const avgMood = average(moodScores);
  const avgSleep = average(sleepHours);
  const habitDays = logs.filter((log) => completedHabitsCount(log, habits) > 0);
  const noHabitDays = logs.filter((log) => completedHabitsCount(log, habits) === 0);
  const moodOnHabitDays = average(habitDays.map((log) => Number(log?.mood?.score || 0))); 
  const moodOnNoHabitDays = average(noHabitDays.map((log) => Number(log?.mood?.score || 0)));
  const spending = logs.reduce((sum, log) => sum + totalExpenses(log), 0);
  const dailySpend = logs.length > 0 ? spending / logs.length : 0;

  if (moodOnHabitDays != null && moodOnNoHabitDays != null && moodOnHabitDays > moodOnNoHabitDays + 0.5) {
    return 'Your mood was steadier on days you completed habits, so those small rituals are carrying real weight.';
  }

  if (avgSleep != null && avgSleep >= 7 && avgMood != null && avgMood >= 6.5) {
    return 'Sleep looks like a meaningful lever this week: your stronger days lined up with better recovery.';
  }

  if (settings?.dailyBudgetTarget && dailySpend > settings.dailyBudgetTarget) {
    return 'Spending was highest on the days when your energy felt lower, so a lighter plan could make the week feel easier.';
  }

  return 'The clearest signal this week was your consistency in showing up, which is already building a solid rhythm.';
}

export function buildWeeklyGoal({ todayLog, history, habits, settings }) {
  const logs = getRecentLogs(history, todayLog).slice(0, 7);
  if (logs.length < 3) {
    return 'Keep logging for a few more days so I can suggest a goal that matches your pattern.';
  }

  const sleepHours = logs.map((log) => Number(log?.sleep?.hours || 0)).filter((value) => Number.isFinite(value));
  const avgSleep = average(sleepHours);
  const spending = logs.reduce((sum, log) => sum + totalExpenses(log), 0);
  const avgSpend = logs.length > 0 ? spending / logs.length : 0;
  const completionRate = habits.length > 0
    ? logs.reduce((sum, log) => sum + completedHabitsCount(log, habits), 0) / (logs.length * habits.length)
    : 0;
  const hobbyMinutesTotal = logs.reduce((sum, log) => sum + hobbyMinutes(log), 0);
  const avgHobby = logs.length > 0 ? hobbyMinutesTotal / logs.length : 0;

  if (avgSleep != null && avgSleep < 7) {
    return 'Aim for three nights this week with sleep before 11 PM.';
  }

  if (settings?.dailyBudgetTarget && avgSpend > settings.dailyBudgetTarget) {
    return `Stay under your daily budget target of Rs ${settings.dailyBudgetTarget} for the next week.`;
  }

  if (habits.length > 0 && completionRate < 0.6) {
    return 'Complete all habits for three straight days this week.';
  }

  if (settings?.hobbyTarget && avgHobby < settings.hobbyTarget) {
    return `Spend at least ${Math.max(60, settings.hobbyTarget)} minutes on hobbies this week.`;
  }

  return 'Keep one small ritual alive every day this week.';
}

export function buildMonthlySummary({ todayLog, history, habits, settings }) {
  const logs = getRecentLogs(history, todayLog).slice(0, 30);
  if (logs.length < 3) {
    return {
      biggestAchievement: 'A few steady check-ins.',
      mostConsistentHabit: 'No strong habit pattern yet.',
      moodTrend: 'Still forming.',
      sleepTrend: 'Still forming.',
      improvement: 'Add a few more days of logging to reveal a clearer rhythm.',
      closing: 'Your month is just beginning to speak — keep showing up and it will get clearer.',
    };
  }

  const moodScores = logs.map((log) => Number(log?.mood?.score || 0)).filter((value) => Number.isFinite(value));
  const sleepHours = logs.map((log) => Number(log?.sleep?.hours || 0)).filter((value) => Number.isFinite(value));
  const avgMood = average(moodScores);
  const avgSleep = average(sleepHours);
  const firstHalf = logs.slice(0, Math.ceil(logs.length / 2));
  const secondHalf = logs.slice(Math.ceil(logs.length / 2));
  const firstMood = average(firstHalf.map((log) => Number(log?.mood?.score || 0)).filter((value) => Number.isFinite(value)));
  const secondMood = average(secondHalf.map((log) => Number(log?.mood?.score || 0)).filter((value) => Number.isFinite(value)));
  const firstSleep = average(firstHalf.map((log) => Number(log?.sleep?.hours || 0)).filter((value) => Number.isFinite(value)));
  const secondSleep = average(secondHalf.map((log) => Number(log?.sleep?.hours || 0)).filter((value) => Number.isFinite(value)));
  const habitCounts = habits.map((habit) => ({
    habit,
    count: logs.filter((log) => Boolean(log?.habits?.[habit.id])).length,
  })).sort((a, b) => b.count - a.count);
  const topHabit = habitCounts[0];
  const moodTrend = secondMood != null && firstMood != null && secondMood > firstMood
    ? 'improving steadily'
    : avgMood != null && avgMood >= 6.5
      ? 'mostly steady and calm'
      : 'mixed but real';
  const sleepTrend = secondSleep != null && firstSleep != null && secondSleep > firstSleep
    ? 'improving a bit'
    : avgSleep != null && avgSleep >= 7
      ? 'healthy and consistent'
      : 'needs a little more recovery';
  const biggestAchievement = avgMood != null && avgMood >= 6.5
    ? 'A steady mood average and strong check-in consistency.'
    : 'Showing up consistently even on the harder days.';
  const improvement = settings?.dailyBudgetTarget && logs.some((log) => totalExpenses(log) > settings.dailyBudgetTarget)
    ? 'Keep a tighter spending cap on the days that feel busiest.'
    : 'Protect one recovery habit a little more consistently.';

  return {
    biggestAchievement,
    mostConsistentHabit: topHabit?.count ? `${topHabit.habit.name} (${topHabit.count} times)` : 'No strong habit pattern yet.',
    moodTrend,
    sleepTrend,
    improvement,
    closing: 'You are building a calmer, more aware rhythm one day at a time.',
  };
}

export function buildDataAnswer(question, { todayLog, history, habits, hobbies, settings, lifeScore }) {
  const text = String(question || '').toLowerCase();
  const logs = getRecentLogs(history, todayLog).slice(0, 14);
  if (logs.length < 2) {
    return 'I do not have enough history yet to answer that confidently. Add a few more check-ins and I can look for patterns.';
  }

  const moodScores = logs.map((log) => Number(log?.mood?.score || 0)).filter((value) => Number.isFinite(value));
  const avgMood = average(moodScores);
  const sleepHours = logs.map((log) => Number(log?.sleep?.hours || 0)).filter((value) => Number.isFinite(value));
  const avgSleep = average(sleepHours);
  const spend = logs.reduce((sum, log) => sum + totalExpenses(log), 0);
  const habitDays = logs.filter((log) => completedHabitsCount(log, habits) > 0).length;
  const hobbyMinutesTotal = logs.reduce((sum, log) => sum + hobbyMinutes(log), 0);

  if ((text.includes('life score') || text.includes('score')) && (text.includes('why') || text.includes('reason') || text.includes('because'))) {
    if (!lifeScore?.total) {
      return 'Your score is still at zero because there is not enough logged context yet. Add one mood note, sleep entry, or habit completion and I can explain it more clearly.';
    }

    const breakdown = lifeScore.breakdown || {};
    const entries = Object.entries(breakdown).filter(([, value]) => Number(value) > 0);
    const top = entries.sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    const driver = top?.[0] || 'mood';
    const driverValue = Math.round(Number(top?.[1] || 0));
    const driverLabel = driver === 'mood'
      ? 'mood'
      : driver === 'sleep'
        ? 'sleep'
        : driver === 'habits'
          ? 'habit consistency'
          : driver === 'hobbies'
            ? 'hobby time'
            : 'spending balance';

    return `Your life score is ${lifeScore.total}/100 because ${driverLabel} is at ${driverValue}/100 right now. The clearest lever is to improve ${driverLabel} a bit more so the score feels more balanced.`;
  }

  if (text.includes('mood') && (text.includes('low') || text.includes('down'))) {
    const lowDays = moodScores.filter((score) => score <= 4).length;
    return `Your recent average mood is ${avgMood?.toFixed(1) || '--'}/10 across ${logs.length} logged days. You had ${lowDays} low-mood day${lowDays === 1 ? '' : 's'} in that window, so the pattern looks more like a signal than a one-off.`;
  }

  if (text.includes('sleep') && (text.includes('best') || text.includes('better'))) {
    const bestSleep = logs.slice().sort((a, b) => Number(b?.sleep?.hours || 0) - Number(a?.sleep?.hours || 0))[0];
    return `The strongest sleep in your recent history was ${bestSleep?.sleep?.hours || '--'}h on ${bestSleep?.date || 'a recent day'}, with ${bestSleep?.sleep?.quality || 'no quality note'} quality.`;
  }

  if (text.includes('spend') || text.includes('money')) {
    return `Your recent spend averages about Rs ${Math.round(spend / Math.max(logs.length, 1))} per logged day, based on your stored history.`;
  }

  if (text.includes('habit') || text.includes('consistent')) {
    return `You completed habits on ${habitDays} of your last ${logs.length} logged days, so consistency is building but there is still room to tighten it up.`;
  }

  if (text.includes('improve') || text.includes('next')) {
    return avgSleep != null && avgSleep < 7
      ? 'The next best lever looks like recovery, especially sleep timing and consistency.'
      : 'The next best lever looks like keeping one habit small and repeatable rather than trying to overhaul everything.';
  }

  return `Your recent average mood is ${avgMood?.toFixed(1) || '--'}/10 and average sleep is ${avgSleep?.toFixed(1) || '--'}h. I can go deeper if you ask about a specific pattern.`;
}

export function parseBulletList(text) {
  if (!text) return [];
  return String(text)
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 6);
}
