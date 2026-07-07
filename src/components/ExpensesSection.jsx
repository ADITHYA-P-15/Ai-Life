import { useState } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { EXPENSE_CATEGORIES, getCategoryById } from '../utils/categories.js';
import './ExpensesSection.css';

/**
 * Format a number with commas (Indian numbering style).
 */
function formatAmount(num) {
  if (!num && num !== 0) return '';
  return Number(num).toLocaleString('en-IN');
}

/**
 * Get budget bar color based on spend percentage.
 */
function getBudgetColor(percent) {
  if (percent <= 60) return 'var(--accent-emerald)';
  if (percent <= 85) return 'var(--accent-amber)';
  return 'var(--accent-rose)';
}

export default function ExpensesSection() {
  const { todayLog, settings, todayExpenses, addExpense, removeExpense } = useDailyLog();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [label, setLabel] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');

  const expenses = todayLog.expenses;
  const dailyBudget = settings.dailyBudgetTarget;
  const budgetPercent = dailyBudget > 0 ? (todayExpenses / dailyBudget) * 100 : 0;
  const isOverBudget = todayExpenses > dailyBudget;
  const budgetColor = getBudgetColor(budgetPercent);

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    // Allow only numbers and decimals
    if (/^\d*\.?\d*$/.test(raw)) {
      setAmount(raw);
      setDisplayAmount(raw);
    }
  };

  const handleAmountBlur = () => {
    if (amount) {
      setDisplayAmount(formatAmount(Number(amount)));
    }
  };

  const handleAmountFocus = () => {
    setDisplayAmount(amount);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    const cat = getCategoryById(category);
    addExpense({
      label: label.trim() || cat.label,
      amount: numAmount,
      category,
      id: Date.now(),
    });

    setAmount('');
    setDisplayAmount('');
    setLabel('');
  };

  return (
    <section className="expenses-section glass-card">
      {/* Header */}
      <header className="expenses-header">
        <div className="expenses-header-icon">💰</div>
        <h3 className="expenses-header-title">Money</h3>
      </header>

      {/* Total display */}
      <div className="expenses-total-display">
        <span className="expenses-total-value">₹{formatAmount(todayExpenses)}</span>
        <span className="expenses-total-label">spent today</span>
      </div>

      {/* Budget bar */}
      <div className="expenses-budget-wrapper">
        <div className="expenses-budget-header">
          <span
            className={`expenses-budget-label ${
              isOverBudget ? 'expenses-budget-label--over' : 'expenses-budget-label--under'
            }`}
          >
            {isOverBudget ? 'Over budget ⚠️' : 'Under budget ✓'}
          </span>
          <span className="expenses-budget-percent">
            ₹{formatAmount(todayExpenses)} / ₹{formatAmount(dailyBudget)}
          </span>
        </div>
        <div className="expenses-budget-bar">
          <div
            className="expenses-budget-fill"
            style={{
              width: `${Math.min(budgetPercent, 100)}%`,
              background: budgetColor,
            }}
          />
        </div>
      </div>

      {/* Quick add form */}
      <form className="expenses-form" onSubmit={handleSubmit}>
        <div className="expenses-form-amount-wrapper">
          <span className="expenses-form-currency">₹</span>
          <input
            type="text"
            inputMode="decimal"
            className="expenses-form-amount"
            placeholder="0"
            value={displayAmount}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            onFocus={handleAmountFocus}
            aria-label="Expense amount"
          />
        </div>

        <select
          className="expenses-form-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Expense category"
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="expenses-form-label"
          placeholder="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          aria-label="Expense label"
          maxLength={50}
        />

        <button
          type="submit"
          className="expenses-form-submit"
          disabled={!amount || Number(amount) <= 0}
        >
          Add
        </button>
      </form>

      {/* Expense list */}
      {expenses.length > 0 ? (
        <div className="expenses-list">
          <span className="expenses-list-title">Today's Expenses</span>
          {expenses.map((expense, index) => {
            const cat = getCategoryById(expense.category);
            return (
              <div key={expense.id || index} className="expenses-row">
                <span className="expenses-row-icon">{cat.icon}</span>
                <div className="expenses-row-info">
                  <div className="expenses-row-label">{expense.label}</div>
                  <div className="expenses-row-category">{cat.label}</div>
                </div>
                <span className="expenses-row-amount">₹{formatAmount(expense.amount)}</span>
                <button
                  className="expenses-row-delete"
                  onClick={() => removeExpense(index)}
                  aria-label={`Remove ${expense.label}`}
                  title="Remove expense"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="expenses-empty">
          <p>No expenses logged today</p>
        </div>
      )}
    </section>
  );
}
