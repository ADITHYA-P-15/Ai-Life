import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDailyLog } from '../hooks/useDailyLog';
import './LogFlowActions.css';

export default function LogFlowActions({ domain, summary, nextPath, nextLabel, onConfirm }) {
  const navigate = useNavigate();
  const { clearTodayLog } = useDailyLog();
  const [reviewing, setReviewing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    const confirmed = window.confirm('Clear all of today’s logged data across every domain?');
    if (!confirmed) return;
    setClearing(true);
    try {
      await clearTodayLog();
    } finally {
      setClearing(false);
    }
  };

  const handleContinue = async () => {
    if (onConfirm) await onConfirm();
    navigate(nextPath);
  };

  return (
    <section className={`log-flow log-flow--${domain}`}>
      <div className="log-flow__copy">
        <span className="log-flow__eyebrow">Daily flow</span>
        <p>Review this section before moving on.</p>
      </div>
      <div className="log-flow__actions">
        <button type="button" className="log-flow__secondary" onClick={handleClear} disabled={clearing}>
          <span className="material-symbols-outlined">restart_alt</span>
          {clearing ? 'Clearing...' : 'Clear today'}
        </button>
        <button type="button" className="log-flow__primary" onClick={() => setReviewing(true)}>
          <span className="material-symbols-outlined">fact_check</span>
          Review & Continue
        </button>
      </div>

      {reviewing && (
        <div className="log-flow__overlay" role="dialog" aria-modal="true" aria-label="Review logged data">
          <div className="log-flow__modal">
            <div className="log-flow__modal-header">
              <div>
                <span className="log-flow__eyebrow">Confirm section</span>
                <h3>{summary.title}</h3>
              </div>
              <button type="button" className="btn-icon" onClick={() => setReviewing(false)} aria-label="Close review">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="log-flow__summary-list">
              {summary.items.map((item) => (
                <div key={item.label} className="log-flow__summary-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="log-flow__modal-actions">
              <button type="button" className="log-flow__secondary" onClick={() => setReviewing(false)}>Edit</button>
              <button type="button" className="log-flow__primary" onClick={handleContinue}>
                Continue to {nextLabel}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
