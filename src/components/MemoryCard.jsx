import { useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { formatDate } from '../utils/dates';
import './MemoryCard.css';

function getExpenseTotal(log) {
  return (log?.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

export default function MemoryCard() {
  const { history, todayLog } = useDailyLog();

  const memory = useMemo(() => {
    const logs = [...history, todayLog].filter((log) => log?.hasLog);
    if (logs.length === 0) {
      return null;
    }

    const thirtyDaysAgo = logs.find((log) => log.date === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const ninetyDaysAgo = logs.find((log) => log.date === new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const choose = (log) => {
      if (!log) return null;
      return {
        date: log.date,
        mood: log.mood?.score || 0,
        sleep: log.sleep?.hours || 0,
        note: log.mood?.note || 'A quiet day in your life archive.',
        spend: getExpenseTotal(log),
      };
    };

    return [choose(thirtyDaysAgo), choose(ninetyDaysAgo)].filter(Boolean)[0] || choose(logs[logs.length - 1]);
  }, [history, todayLog]);

  if (!memory) {
    return null;
  }

  return (
    <section className="memory-card glass-card glass-card--no-hover">
      <div className="memory-card__header">
        <span className="memory-card__eyebrow">On This Day</span>
        <h3>Memory card</h3>
      </div>
      <p className="memory-card__meta">{formatDate(memory.date)}</p>
      <ul>
        <li>Mood: {memory.mood > 0 ? `${memory.mood}/10` : 'Not logged'}</li>
        <li>Sleep: {memory.sleep > 0 ? `${memory.sleep}h` : 'Not logged'}</li>
        {memory.spend > 0 && <li>Spend: ₹{Math.round(memory.spend)}</li>}
      </ul>
      <p className="memory-card__note">“{memory.note}”</p>
    </section>
  );
}
