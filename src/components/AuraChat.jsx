/**
 * AuraChat — AI companion panel that can behave as a sidebar card or floating assistant.
 */
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sendAuraChat } from '../services/dataService';
import { buildDataAnswer } from '../utils/aiHelpers';
import { computeLifeScore } from '../utils/scoring';
import './AuraChat.css';

const SUGGESTIONS = ['Why was my mood low this week?', 'When did I sleep the best?', 'What should I improve next?', 'Give me a weekly goal'];

function AuraLogo({ compact = false }) {
  return (
    <div className={`aura-logo ${compact ? 'aura-logo--compact' : ''}`} aria-hidden="true">
      <span className="material-symbols-outlined">auto_awesome</span>
    </div>
  );
}

export default function AuraChat({ placement = 'floating' }) {
  const { state } = useApp();
  const isSidebar = placement === 'sidebar';
  const [isOpen, setIsOpen] = useState(!isSidebar);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey, I’m Aura. I can help you make sense of your day with the notes, habits, sleep, and spending you’ve already logged. Tiny updates count." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const lifeScore = computeLifeScore({
    hasLog: state.todayLog?.hasLog,
    moodScore: state.todayLog?.mood?.score,
    sleepHours: state.todayLog?.sleep?.hours,
    sleepQuality: state.todayLog?.sleep?.quality,
    habitCompletions: state.todayLog?.habits,
    activeHabits: state.habits,
    hobbyTimes: state.todayLog?.hobbies,
    hobbyTarget: state.settings?.hobbyTarget,
    totalSpent: state.todayLog?.expenses?.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) || 0,
    dailyBudget: state.settings?.dailyBudgetTarget,
  });

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const nextMessages = [...messages, { role: 'user', text }];
    setMessages(nextMessages);
    setInputValue('');
    setIsThinking(true);

    try {
      const payload = {
        message: text,
        messages: nextMessages,
        todayLog: state.todayLog,
        history: state.history,
        habits: state.habits,
        hobbies: state.hobbies,
        settings: state.settings,
        lifeScore,
      };

      const localAnswer = /mood|sleep|spend|habit|improve|goal|week|score|life/.test(text.toLowerCase())
        ? buildDataAnswer(text, payload)
        : null;

      if (localAnswer) {
        setMessages(prev => [...prev, { role: 'ai', text: localAnswer }]);
        return;
      }

      const result = await sendAuraChat(payload);
      setMessages(prev => [...prev, { role: 'ai', text: result.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "I lost the signal for a second. Tell me one thing about today and I’ll keep it simple and useful." }]);
    } finally {
      setIsThinking(false);
    }
  };

  if (isSidebar) {
    return (
      <div className="aura-chat aura-chat--sidebar">
        <div className="aura-chat__header">
          <div className="aura-chat__header-left">
            <div className="aura-chat__avatar">
              <AuraLogo compact />
            </div>
            <div>
              <h4 className="aura-chat__name">Aura AI</h4>
              <div className="aura-chat__status"><span className="aura-chat__status-dot" />Ask your data</div>
            </div>
          </div>
          <button className="btn-icon aura-chat__toggle" onClick={() => setIsOpen(v => !v)}>
            <span className="material-symbols-outlined">{isOpen ? 'close' : 'chat'}</span>
          </button>
        </div>

        {!isOpen ? (
          <div className="aura-chat__sidebar-preview">
            Ask Aura about your mood, sleep, spending, or why your life score looks the way it does.
          </div>
        ) : (
          <>
            <div className="aura-chat__messages">
              {messages.map((msg, i) => (
                <div key={i} className={`aura-chat__bubble aura-chat__bubble--${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {isThinking && (
                <div className="aura-chat__bubble aura-chat__bubble--ai">
                  <div className="aura-chat__thinking">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="aura-chat__suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="aura-chat__suggestion" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>

            <div className="aura-chat__input-row">
              <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(inputValue)}
                placeholder="Ask Aura anything..." className="aura-chat__input" />
              <button className="aura-chat__send" onClick={() => sendMessage(inputValue)} disabled={isThinking}>
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div className="aura-chat animate-slide-up">
          <div className="aura-chat__header">
            <div className="aura-chat__header-left">
              <div className="aura-chat__avatar">
                <AuraLogo compact />
              </div>
              <div>
                <h4 className="aura-chat__name">Aura AI</h4>
                <div className="aura-chat__status"><span className="aura-chat__status-dot" />Ask your data</div>
              </div>
            </div>
            <button className="btn-icon" onClick={() => setIsOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="aura-chat__messages">
            {messages.map((msg, i) => (
              <div key={i} className={`aura-chat__bubble aura-chat__bubble--${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isThinking && (
              <div className="aura-chat__bubble aura-chat__bubble--ai">
                <div className="aura-chat__thinking">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="aura-chat__suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="aura-chat__suggestion" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>

          <div className="aura-chat__input-row">
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(inputValue)}
              placeholder="Ask Aura anything..." className="aura-chat__input" />
            <button className="aura-chat__send" onClick={() => sendMessage(inputValue)} disabled={isThinking}>
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      )}

      <button className={`aura-fab ${isOpen ? 'aura-fab--active' : ''}`} onClick={() => setIsOpen(v => !v)} aria-label="Open Aura AI Chat">
        {isOpen ? (
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '28px' }}>close</span>
        ) : (
          <AuraLogo />
        )}
      </button>
    </>
  );
}
