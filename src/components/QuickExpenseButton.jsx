import { useState } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import './QuickExpenseButton.css';

export default function QuickExpenseButton() {
  const { addExpense } = useDailyLog();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [label, setLabel] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;

    const selected = EXPENSE_CATEGORIES.find((item) => item.id === category);
    addExpense({
      id: Date.now(),
      amount: numericAmount,
      category,
      label: label.trim() || selected?.label || 'Expense',
    });
    setAmount('');
    setLabel('');
    setOpen(false);
  };

  return (
    <>
      {open && (
        <form className="quick-expense" onSubmit={handleSubmit}>
          <div className="quick-expense__header">
            <strong>Quick expense</strong>
            <button type="button" className="btn-icon" onClick={() => setOpen(false)} aria-label="Close quick expense">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="quick-expense__row">
            <span>₹</span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Amount"
              autoFocus
            />
          </div>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {EXPENSE_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>{item.icon} {item.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Note (optional)"
            maxLength={80}
          />
          <button type="submit" className="quick-expense__submit">Log expense</button>
        </form>
      )}

      <button
        type="button"
        className={`quick-expense-fab ${open ? 'quick-expense-fab--active' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-label="Quick add expense"
      >
        +₹
      </button>
    </>
  );
}
