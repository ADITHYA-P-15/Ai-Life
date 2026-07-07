import { useEffect, useMemo, useState } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { formatDate, getLastNDays } from '../utils/dates';
import { buildMonthlySummary, buildWeeklyGoal, buildWeeklyInsight } from '../utils/aiHelpers';
import './PhaseFourPanel.css';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getExpenseTotal(log) {
  return (log?.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function getHobbyMinutes(log) {
  return Object.values(log?.hobbies || {}).reduce((sum, minutes) => sum + Number(minutes || 0), 0);
}

function avg(values) {
  const usable = values.filter((value) => Number.isFinite(value));
  if (usable.length === 0) return null;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function downloadTextFile(filename, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildReportHtml({ reportRows, metrics, lifeScore, reflection, monthly }) {
  const rowsHtml = reportRows.map((row) => `
    <tr>
      <td>${escapeHtml(formatDate(row.date))}</td>
      <td>${row.hasLog ? escapeHtml(row.mood || 'Blank') : 'Not logged'}</td>
      <td>${row.hasLog ? escapeHtml(row.sleep || 'Blank') : 'Not logged'}</td>
      <td>${row.hasLog ? escapeHtml(row.habits) : 'Not logged'}</td>
      <td>${row.hasLog ? `Rs ${escapeHtml(row.spend)}` : 'Not logged'}</td>
      <td>${row.hasLog ? `${escapeHtml(row.hobby)} min` : 'Not logged'}</td>
    </tr>
  `).join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>LVL_UP Weekly Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #17141f; margin: 32px; }
    h1 { margin: 0 0 6px; }
    .meta { color: #5f596b; margin-bottom: 24px; }
    .metrics { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 24px; }
    .reflection { margin-bottom: 24px; padding: 14px; border-radius: 10px; background: #f7f3ff; }
    .metric { border: 1px solid #ddd8ea; border-radius: 8px; padding: 12px; }
    .metric span { display: block; color: #6d6678; font-size: 11px; text-transform: uppercase; }
    .metric strong { display: block; margin-top: 6px; font-size: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd8ea; padding: 10px; text-align: left; font-size: 12px; }
    th { background: #f4f0ff; }
  </style>
</head>
<body>
  <h1>LVL_UP Weekly Report</h1>
  <p class="meta">Generated ${escapeHtml(new Date().toLocaleString())}</p>
  <div class="metrics">
    <div class="metric"><span>Life Score</span><strong>${lifeScore.total}</strong></div>
    <div class="metric"><span>Logged Days</span><strong>${metrics.loggedDays}/7</strong></div>
    <div class="metric"><span>Avg Mood</span><strong>${metrics.avgMood}</strong></div>
    <div class="metric"><span>Avg Sleep</span><strong>${metrics.avgSleep}</strong></div>
    <div class="metric"><span>Total Spend</span><strong>Rs ${metrics.totalSpend}</strong></div>
  </div>
  <div class="reflection">
    <h3>Weekly Reflection</h3>
    <p>${escapeHtml(reflection)}</p>
    <p><strong>Monthly snapshot:</strong> ${escapeHtml(monthly)}</p>
  </div>
  <table>
    <thead>
      <tr><th>Day</th><th>Mood</th><th>Sleep</th><th>Habits</th><th>Spend</th><th>Hobbies</th></tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;
}

export default function PhaseFourPanel() {
  const { todayLog, history, habits, hobbies, streaks, settings, lifeScore } = useDailyLog();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installStatus, setInstallStatus] = useState(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    return isStandalone ? 'Installed' : 'Ready';
  });

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setInstallStatus('Available');
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setInstallStatus('Installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const reportRows = useMemo(() => {
    const logMap = new Map();
    history.forEach((log) => log.date && logMap.set(log.date, log));
    if (todayLog.date) logMap.set(todayLog.date, todayLog);

    return getLastNDays(7).map((date) => {
      const log = logMap.get(date);
      const hasLog = Boolean(log?.hasLog);
      const completed = habits.filter((habit) => log?.habits?.[habit.id]).length;
      return {
        date,
        hasLog,
        mood: log?.mood?.score ? `${log.mood.score}/10` : '',
        sleep: log?.sleep?.hours ? `${log.sleep.hours}h ${log.sleep.quality || ''}`.trim() : '',
        habits: habits.length > 0 ? `${completed}/${habits.length}` : '0/0',
        spend: Math.round(getExpenseTotal(log)),
        hobby: Math.round(getHobbyMinutes(log)),
      };
    });
  }, [history, todayLog, habits]);

  const metrics = useMemo(() => {
    const loggedRows = reportRows.filter((row) => row.hasLog);
    const logMap = new Map();
    history.forEach((log) => log.date && logMap.set(log.date, log));
    if (todayLog.date) logMap.set(todayLog.date, todayLog);
    const realLogs = loggedRows.map((row) => logMap.get(row.date)).filter(Boolean);

    const avgMood = avg(realLogs.map((log) => log.mood?.score));
    const avgSleep = avg(realLogs.map((log) => log.sleep?.hours));
    const totalSpend = realLogs.reduce((sum, log) => sum + getExpenseTotal(log), 0);
    const totalHobby = realLogs.reduce((sum, log) => sum + getHobbyMinutes(log), 0);

    return {
      loggedDays: loggedRows.length,
      avgMood: avgMood == null ? '--' : `${avgMood.toFixed(1)}/10`,
      avgSleep: avgSleep == null ? '--' : `${avgSleep.toFixed(1)}h`,
      totalSpend: Math.round(totalSpend),
      totalHobby: Math.round(totalHobby),
    };
  }, [reportRows, history, todayLog]);

  const reflection = useMemo(() => {
    const loggedRows = reportRows.filter((row) => row.hasLog);
    if (loggedRows.length === 0) return 'A quiet week is still a valid week. Keep showing up and your reflections will get richer.';

    const weeklyInsight = buildWeeklyInsight({ todayLog, history, habits, settings });
    return weeklyInsight;
  }, [reportRows, todayLog, history, habits, settings]);

  const monthly = useMemo(() => {
    const summary = buildMonthlySummary({ todayLog, history, habits, settings });
    return `${summary.biggestAchievement} ${summary.mostConsistentHabit} ${summary.closing}`;
  }, [todayLog, history, habits, settings]);

  const weeklyGoal = useMemo(() => buildWeeklyGoal({ todayLog, history, habits, settings }), [todayLog, history, habits, settings]);

  const milestones = useMemo(() => {
    const topStreak = Math.max(0, ...Object.values(streaks || {}).map((streak) => streak.current || 0));
    const hasExpense = reportRows.some((row) => row.spend > 0);
    const hasHobby = reportRows.some((row) => row.hobby > 0);
    const activeHobbies = hobbies.length;

    return [
      { icon: 'flag', title: 'First Check-In', detail: 'Log one real day', unlocked: metrics.loggedDays >= 1 },
      { icon: 'calendar_month', title: '3-Day Signal', detail: 'Log 3 days this week', unlocked: metrics.loggedDays >= 3 },
      { icon: 'workspace_premium', title: 'Life 50', detail: 'Reach score 50+', unlocked: lifeScore.total >= 50 },
      { icon: 'local_fire_department', title: 'Streak 3', detail: 'Hold a 3-day habit streak', unlocked: topStreak >= 3 },
      { icon: 'savings', title: 'Money Logged', detail: 'Track one expense', unlocked: hasExpense },
      { icon: 'palette', title: 'Creative Spark', detail: activeHobbies > 0 ? 'Log hobby time' : 'Add a hobby first', unlocked: hasHobby },
    ];
  }, [streaks, reportRows, metrics.loggedDays, lifeScore.total, hobbies.length]);

  const handlePrintPdf = () => {
    const html = buildReportHtml({ reportRows, metrics, lifeScore, settings, reflection, monthly });
    const reportWindow = window.open('', '_blank', 'width=900,height=700');
    if (!reportWindow) return;
    reportWindow.document.write(html);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };

  const handleWordExport = () => {
    const html = buildReportHtml({ reportRows, metrics, lifeScore, settings, reflection, monthly });
    downloadTextFile('lvl-up-weekly-report.doc', 'application/msword;charset=utf-8', html);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallStatus(choice.outcome === 'accepted' ? 'Installed' : 'Ready');
    setInstallPrompt(null);
  };

  return (
    <section className="phase-four glass-card glass-card--no-hover">
      <div className="phase-four__header">
        <div>
          <span className="phase-four__eyebrow">Phase 4</span>
          <h3>Milestones & Exports</h3>
        </div>
        <div className="phase-four__install">
          <span className="material-symbols-outlined">install_mobile</span>
          <span>{installStatus}</span>
          <button type="button" onClick={handleInstall} disabled={!installPrompt}>
            Install
          </button>
        </div>
      </div>

      <div className="phase-four__grid">
        <div className="phase-four__badges">
          {milestones.map((badge) => (
            <div key={badge.title} className={`phase-four__badge ${badge.unlocked ? 'phase-four__badge--unlocked' : ''}`}>
              <span className="material-symbols-outlined">{badge.icon}</span>
              <div>
                <p>{badge.title}</p>
                <small>{badge.detail}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="phase-four__report">
          <div className="phase-four__report-card">
            <span className="material-symbols-outlined">description</span>
            <div>
              <h4>Weekly Report</h4>
              <p>{metrics.loggedDays}/7 days logged, mood {metrics.avgMood}, sleep {metrics.avgSleep}, hobbies {metrics.totalHobby} min.</p>
              <p className="phase-four__report-caption">{reflection}</p>
              <p className="phase-four__report-caption phase-four__report-caption--goal">Next goal: {weeklyGoal}</p>
            </div>
          </div>
          <div className="phase-four__actions">
            <button type="button" onClick={handlePrintPdf}>
              <span className="material-symbols-outlined">picture_as_pdf</span>
              PDF
            </button>
            <button type="button" onClick={handleWordExport}>
              <span className="material-symbols-outlined">article</span>
              Word
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
