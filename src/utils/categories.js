/**
 * Default categories and suggestions for the Life Dashboard.
 */

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍔', color: '#f59e0b' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#6366f1' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { id: 'bills', label: 'Bills', icon: '📄', color: '#ef4444' },
  { id: 'shopping', label: 'Shopping', icon: '🛒', color: '#8b5cf6' },
  { id: 'health', label: 'Health', icon: '💊', color: '#10b981' },
  { id: 'education', label: 'Education', icon: '📚', color: '#3b82f6' },
  { id: 'other', label: 'Other', icon: '📦', color: '#6b7280' },
];

/**
 * MOOD_EMOJIS maps mood scores (1-10) to emoji representations.
 */
export const MOOD_EMOJIS = {
  1: '😫',
  2: '😢',
  3: '😞',
  4: '😕',
  5: '😐',
  6: '🙂',
  7: '😊',
  8: '😄',
  9: '🤩',
  10: '🥳',
};

export const MOOD_LABELS = {
  1: 'Terrible',
  2: 'Very Bad',
  3: 'Bad',
  4: 'Poor',
  5: 'Okay',
  6: 'Fine',
  7: 'Good',
  8: 'Great',
  9: 'Amazing',
  10: 'Incredible',
};

export const SLEEP_QUALITIES = [
  { value: 'poor', label: 'Poor', icon: '😴', color: '#ef4444' },
  { value: 'fair', label: 'Fair', icon: '🥱', color: '#f59e0b' },
  { value: 'good', label: 'Good', icon: '😌', color: '#10b981' },
  { value: 'great', label: 'Great', icon: '🌟', color: '#6366f1' },
];

/**
 * Returns the category object for a given category ID.
 */
export function getCategoryById(categoryId) {
  return EXPENSE_CATEGORIES.find((c) => c.id === categoryId) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}
