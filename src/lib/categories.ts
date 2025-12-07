export const CATEGORIES = [
  { name: 'Work', color: 'hsl(220, 80%, 55%)', icon: '💼' },
  { name: 'Study', color: 'hsl(280, 70%, 55%)', icon: '📚' },
  { name: 'Sleep', color: 'hsl(240, 50%, 45%)', icon: '😴' },
  { name: 'Exercise', color: 'hsl(150, 70%, 45%)', icon: '🏃' },
  { name: 'Entertainment', color: 'hsl(340, 75%, 55%)', icon: '🎮' },
  { name: 'Food', color: 'hsl(30, 85%, 50%)', icon: '🍽️' },
  { name: 'Travel', color: 'hsl(190, 70%, 50%)', icon: '🚗' },
  { name: 'Other', color: 'hsl(220, 10%, 55%)', icon: '📌' },
] as const;

export type CategoryName = typeof CATEGORIES[number]['name'];

export const getCategoryColor = (categoryName: string): string => {
  const category = CATEGORIES.find(c => c.name === categoryName);
  return category?.color || CATEGORIES[7].color;
};

export const getCategoryIcon = (categoryName: string): string => {
  const category = CATEGORIES.find(c => c.name === categoryName);
  return category?.icon || CATEGORIES[7].icon;
};

export const MINUTES_IN_DAY = 1440;

export const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};
