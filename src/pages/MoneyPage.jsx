/**
 * MoneyPage — Capital Hub with expense tracking, budget progress, insights.
 */
import { useState } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { EXPENSE_CATEGORIES, getCategoryById } from '../utils/categories';
import MascotHero from '../components/MascotHero';
import LogFlowActions from '../components/LogFlowActions';
import './MoneyPage.css';

export default function MoneyPage() {
  const { todayLog, todayExpenses, settings, addExpense, removeExpense, lifeScore } = useDailyLog();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [label, setLabel] = useState('');
  const [pendingExpense, setPendingExpense] = useState(null);
  const budgetPct = Math.round(lifeScore.breakdown.budget || 0);
  const remaining = Math.max(0, settings.dailyBudgetTarget - todayExpenses);
  const spentPct = Math.min(100, (todayExpenses / settings.dailyBudgetTarget) * 100);

  const handleAdd = () => {
    if (!amount || Number(amount) <= 0) return;
    setPendingExpense({ label: label || getCategoryById(category).label, amount: Number(amount), category, id: Date.now() });
  };

  const confirmExpense = () => {
    if (!pendingExpense) return;
    addExpense(pendingExpense);
    setPendingExpense(null);
    setAmount(''); setLabel('');
  };

  return (
    <div className="money stagger-children">
      {/* Hero Stats */}
      <div className="money__hero">
        <div className="glass-card money__wealth-card domain-glow-money">
          <div className="money__wealth-bg" />
          <MascotHero domain="money" size="lg" />
          <p className="text-label-sm money__wealth-label">Today&apos;s Spending</p>
          <div className="money__wealth-amount">₹{todayExpenses.toLocaleString('en-IN')}</div>
          <p className="money__wealth-sub">Budget utilization: {spentPct.toFixed(0)}% • {budgetPct}% health</p>
        </div>

        <div className="glass-card money__velocity-card">
          <div className="money__velocity-header">
            <div><h3 className="money__velocity-title">Capital Velocity</h3><p className="money__velocity-sub">Daily Budget vs. Reality</p></div>
            <div className="money__velocity-remaining"><span className="money__remaining-amount">₹{remaining.toLocaleString('en-IN')}</span><p className="money__remaining-label">Remaining</p></div>
          </div>
          <div className="money__budget-bar-outer">
            <div className="money__budget-labels"><span>SPENT: ₹{todayExpenses.toLocaleString('en-IN')}</span><span>LIMIT: ₹{settings.dailyBudgetTarget.toLocaleString('en-IN')}</span></div>
            <div className="money__budget-bar-track">
              <div className="money__budget-bar-fill" style={{ width: `${Math.min(100, spentPct)}%`, background: spentPct > 90 ? 'var(--error)' : spentPct > 70 ? 'var(--tertiary)' : 'var(--domain-money)' }} />
            </div>
            <p className="money__budget-status">{spentPct <= 100 ? `Under budget ✓ — ${budgetPct}% health` : 'Over budget ⚠️'}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="money__bottom">
        {/* Data Leaks (Expenses) */}
        <div className="glass-card money__leaks">
          <div className="money__leaks-header">
            <div className="money__leaks-title"><span className="material-symbols-outlined" style={{ color: 'var(--error)' }}>warning</span> Top Data Leaks</div>
          </div>

          {/* Quick Add */}
          <div className="money__add-form">
            <div className="money__amount-wrap">
              <span className="money__currency">₹</span>
              <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} className="money__amount-input" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="money__category-select">
              {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
            <input type="text" placeholder="Label (optional)" value={label} onChange={e => setLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} className="money__label-input" />
            <button className="btn-primary money__add-btn" onClick={handleAdd}>Add</button>
          </div>

          {pendingExpense && (
            <div className="money__confirm">
              <div>
                <p>Confirm expense</p>
                <span>{getCategoryById(pendingExpense.category).icon} {pendingExpense.label} • ₹{pendingExpense.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="money__confirm-actions">
                <button onClick={() => setPendingExpense(null)}>Edit</button>
                <button onClick={confirmExpense}>Log it</button>
              </div>
            </div>
          )}

          <div className="money__leak-list">
            {todayLog.expenses.length === 0 ? (
              <div className="money__empty">
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)', marginBottom: '12px' }}>account_balance_wallet</span>
                <p>No expenses logged today. Add your first transaction above.</p>
              </div>
            ) : (
              todayLog.expenses.map((exp, i) => {
                const cat = getCategoryById(exp.category);
                return (
                  <div key={exp.id || i} className="money__leak-item">
                    <div className="money__leak-icon"><span>{cat.icon}</span></div>
                    <div className="money__leak-info">
                      <p className="money__leak-name">{exp.label || cat.label}</p>
                      <p className="money__leak-cat">{cat.label}</p>
                    </div>
                    <div className="money__leak-right">
                      <p className="money__leak-amount">-₹{exp.amount.toLocaleString('en-IN')}</p>
                      <button className="money__leak-delete" onClick={() => removeExpense(i)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="money__insights">
          <div className="glass-card money__insight-card money__insight-card--primary">
            <div className="money__insight-header"><h4>Yield Strategy</h4><span className="chip chip-money">Optimized</span></div>
            <p className="money__insight-desc">Budget discipline at {budgetPct}%. Maintain current spending patterns for positive growth.</p>
          </div>
          <div className="glass-card money__insight-card" style={{ borderTop: '2px solid var(--primary)', boxShadow: 'inset 0 2px 10px rgba(207,188,255,0.1)' }}>
            <div className="money__insight-header"><h4>Saving Velocity</h4><span className="chip chip-primary">Steady</span></div>
            <p className="money__insight-desc">Daily savings: ₹{remaining.toLocaleString('en-IN')}. Keep optimizing variable expenses.</p>
          </div>
          <div className="glass-card money__cta-card">
            <div className="money__cta-left">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--domain-money)' }}>rocket_launch</span>
              <span className="money__cta-text">Level Up Savings?</span>
            </div>
            <button className="money__cta-go" onClick={() => document.querySelector('.money__add-form')?.scrollIntoView({ behavior: 'smooth' })}>GO</button>
          </div>
        </div>
      </div>
      <LogFlowActions
        domain="money"
        nextPath="/hobbies"
        nextLabel="Hobbies"
        summary={{
          title: 'Money check-in',
          items: [
            { label: 'Spent today', value: `₹${todayExpenses.toLocaleString('en-IN')}` },
            { label: 'Budget remaining', value: `₹${remaining.toLocaleString('en-IN')}` },
            { label: 'Transactions', value: todayLog.expenses.length },
          ],
        }}
      />
    </div>
  );
}
