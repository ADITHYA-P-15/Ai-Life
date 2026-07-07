import { useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import MoodSection from './MoodSection';
import SleepSection from './SleepSection';
import HabitsSection from './HabitsSection';
import ExpensesSection from './ExpensesSection';
import HobbiesSection from './HobbiesSection';
import RadarChart from './RadarChart';
import LifeScore from './LifeScore';
import AIInsights from './AIInsights';
import WeekHistory from './WeekHistory';
import './DailyCheckIn.css';

function DailyCheckIn() {
  const { lifeScore } = useDailyLog();

  const radarValues = useMemo(() => ({
    mood: lifeScore.breakdown.mood,
    sleep: lifeScore.breakdown.sleep,
    habits: lifeScore.breakdown.habits,
    money: lifeScore.breakdown.budget,
    hobbies: lifeScore.breakdown.hobbies,
  }), [lifeScore.breakdown]);

  return (
    <div className="daily-checkin stagger-children">
      {/* Top stats row — spans full width */}
      <div className="daily-checkin-stats">
        <div className="daily-checkin-card">
          <LifeScore score={lifeScore} />
        </div>
        <div className="daily-checkin-card">
          <RadarChart values={radarValues} />
        </div>
      </div>

      {/* Column 1 sections */}
      <div className="daily-checkin-card">
        <MoodSection />
      </div>
      <div className="daily-checkin-card">
        <SleepSection />
      </div>
      <div className="daily-checkin-card">
        <HabitsSection />
      </div>

      {/* Column 2 sections */}
      <div className="daily-checkin-card">
        <ExpensesSection />
      </div>
      <div className="daily-checkin-card">
        <HobbiesSection />
      </div>
      <div className="daily-checkin-card">
        <AIInsights />
      </div>
      <div className="daily-checkin-card">
        <WeekHistory />
      </div>
    </div>
  );
}

export default DailyCheckIn;
