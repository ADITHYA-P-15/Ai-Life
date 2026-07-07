import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchCachedInsights, generateInsightsAPI } from '../services/dataService.js';
import './AIInsights.css';

function AIInsights() {
  const { state } = useApp();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const date = state.todayLog?.date;
    if (!date) return;

    let cancelled = false;

    fetchCachedInsights(date)
      .then((result) => {
        if (cancelled || !result.insights?.length) return;
        setInsights(result.insights);
        setHasGenerated(true);
      })
      .catch((err) => {
        console.error('Failed to load cached insights:', err);
      });

    return () => { cancelled = true; };
  }, [state.todayLog?.date]);

  const handleGenerate = useCallback(async (regenerate = false) => {
    setLoading(true);
    setError('');

    try {
      const result = await generateInsightsAPI({
        date: state.todayLog?.date,
        todayLog: state.todayLog,
        history: state.history,
        habits: state.habits,
        hobbies: state.hobbies,
        settings: state.settings,
        regenerate,
      });

      setInsights(result.insights || []);
      setHasGenerated(true);
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError(err.message || 'Unable to generate insights right now.');
    } finally {
      setLoading(false);
    }
  }, [state.todayLog, state.history, state.habits, state.hobbies, state.settings]);

  return (
    <section className="ai-insights glass-card" aria-label="AI Insights">
      <header className="ai-insights-header">
        <span className="ai-insights-icon" aria-hidden="true">✨</span>
        <h3 className="ai-insights-title">AI Insights</h3>
      </header>

      <div className="ai-insights-actions">
        {!hasGenerated ? (
          <button
            className="btn btn-primary ai-insights-btn"
            onClick={() => handleGenerate(false)}
            disabled={loading}
            type="button"
          >
            ✨ Generate Insight
          </button>
        ) : (
          <button
            className="btn ai-insights-btn"
            onClick={() => handleGenerate(true)}
            disabled={loading}
            type="button"
          >
            🔄 Regenerate
          </button>
        )}
      </div>

      {loading && (
        <div className="ai-insights-loading" aria-live="polite" aria-busy="true">
          <div className="ai-insights-shimmer-line" />
          <div className="ai-insights-shimmer-line" />
          <div className="ai-insights-shimmer-line" />
          <div className="ai-insights-shimmer-line" />
          <p className="ai-insights-loading-text">Analyzing your patterns…</p>
        </div>
      )}

      {!loading && insights.length > 0 && (
        <div className="ai-insights-container stagger-children" aria-live="polite">
          {insights.map((insight, index) => (
            <p className="ai-insight-item" key={index}>
              {insight}
            </p>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="ai-insights-empty" role="alert">
          <div className="ai-insights-empty-icon" aria-hidden="true">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && !hasGenerated && insights.length === 0 && (
        <div className="ai-insights-empty">
          <div className="ai-insights-empty-icon" aria-hidden="true">🧠</div>
          <p>Generate insights to discover patterns across your mood, sleep, habits, spending, and hobbies.</p>
        </div>
      )}
    </section>
  );
}

export default AIInsights;
