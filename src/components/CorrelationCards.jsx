import { useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import './CorrelationCards.css';

function avg(values) {
  const usable = values.filter((value) => Number.isFinite(value));
  if (usable.length === 0) return null;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function totalExpenses(log) {
  return (log.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function hobbyMinutes(log) {
  return Object.values(log.hobbies || {}).reduce((sum, minutes) => sum + Number(minutes || 0), 0);
}

export default function CorrelationCards() {
  const { todayLog, history, habits } = useDailyLog();

  const cards = useMemo(() => {
    const logs = [...history, todayLog].filter((log) => log?.hasLog);
    const sleepMood = avg(logs.filter((log) => log.sleep?.hours > 7).map((log) => log.mood?.score));
    const exerciseHabit = habits.find((habit) => /exercise|gym|run|walk|workout/i.test(habit.name));
    const exerciseMood = exerciseHabit
      ? avg(logs.filter((log) => log.habits?.[exerciseHabit.id]).map((log) => log.mood?.score))
      : null;
    const noExerciseMood = exerciseHabit
      ? avg(logs.filter((log) => !log.habits?.[exerciseHabit.id]).map((log) => log.mood?.score))
      : null;
    const spendingPeak = logs.map((log) => ({ date: log.date, amount: totalExpenses(log) })).sort((a, b) => b.amount - a.amount)[0];
    const hobbyMood = avg(logs.filter((log) => hobbyMinutes(log) >= 30).map((log) => log.mood?.score));

    const habitScores = habits.map((habit) => {
      const completed = logs.filter((log) => log.habits?.[habit.id]).length;
      return { habit, completed };
    }).sort((a, b) => b.completed - a.completed)[0];

    return [
      { icon: 'bedtime', title: 'Sleep > 7h', value: sleepMood == null ? '--' : `${sleepMood.toFixed(1)}/10`, detail: 'Average mood after longer sleep' },
      { icon: 'fitness_center', title: 'Exercise Days', value: exerciseMood == null ? '--' : `${exerciseMood.toFixed(1)} vs ${noExerciseMood?.toFixed(1) || '--'}`, detail: 'Mood on exercise vs rest days' },
      { icon: 'payments', title: 'Peak Spend', value: spendingPeak?.amount ? `Rs ${Math.round(spendingPeak.amount)}` : '--', detail: spendingPeak?.amount ? spendingPeak.date : 'No expense logs yet' },
      { icon: 'palette', title: 'High Hobby Days', value: hobbyMood == null ? '--' : `${hobbyMood.toFixed(1)}/10`, detail: 'Mood when hobby time is 30m+' },
      { icon: 'verified', title: 'Best Habit', value: habitScores?.completed ? habitScores.habit.name : '--', detail: habitScores?.completed ? `${habitScores.completed} completions` : 'No habit completions yet' },
    ];
  }, [history, todayLog, habits]);

  return (
    <section className="correlation-cards">
      {cards.map((card) => (
        <article key={card.title} className="glass-card correlation-card glass-card--no-hover">
          <span className="material-symbols-outlined">{card.icon}</span>
          <div>
            <p>{card.title}</p>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </div>
        </article>
      ))}
    </section>
  );
}
