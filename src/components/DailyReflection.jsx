import { useMemo, useState } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { buildDailyReflection, parseBulletList } from '../utils/aiHelpers';
import { sendAuraChat } from '../services/dataService';
import './DailyReflection.css';

export default function DailyReflection() {
  const { todayLog, history, habits, hobbies, settings, lifeScore } = useDailyLog();
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(false);

  const reflection = useMemo(() => buildDailyReflection({
    todayLog,
    history,
    habits,
    hobbies,
    settings,
    lifeScore,
  }), [todayLog, history, habits, hobbies, settings, lifeScore]);

  const askAura = async () => {
    setLoading(true);
    try {
      const result = await sendAuraChat({
        message: 'Generate a concise end-of-day reflection with 4-6 bullet points, including one positive observation, one growth point, and one suggestion for tomorrow.',
        messages: [],
        todayLog,
        history,
        habits,
        hobbies,
        settings,
      });
      setAiText(result.reply);
    } finally {
      setLoading(false);
    }
  };

  const bullets = aiText ? parseBulletList(aiText) : reflection.bullets;

  return (
    <section className="daily-reflection glass-card glass-card--no-hover">
      <div className="daily-reflection__header">
        <div>
          <span className="daily-reflection__eyebrow">Daily AI Reflection</span>
          <h3>Today’s Read</h3>
        </div>
        <button type="button" onClick={askAura} disabled={loading}>
          <span className="material-symbols-outlined">auto_awesome</span>
          {loading ? 'Reflecting...' : 'Ask Aura'}
        </button>
      </div>

      {bullets.length > 0 ? (
        <>
          <ul className="daily-reflection__list">
            {bullets.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="daily-reflection__pair">
            <div><span>Highlight</span><p>{reflection.highlight}</p></div>
            <div><span>Tomorrow</span><p>{reflection.suggestion}</p></div>
          </div>
        </>
      ) : (
        <p className="daily-reflection__ai">No reflection yet.</p>
      )}
    </section>
  );
}
