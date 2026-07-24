export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const fromDateKey = (key: string): Date => {
  const [year = 1970, month = 1, day = 1] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatShortDate = (key: string): string =>
  fromDateKey(key).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

export const formatFullDate = (key: string): string =>
  fromDateKey(key).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const monthTitle = (date: Date): string =>
  date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

export const shiftMonth = (date: Date, delta: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);
