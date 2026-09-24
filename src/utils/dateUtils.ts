/**
 * Date and Time utilities for Campus Room Booking
 */

export interface DayOption {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Mon", "Tue", etc.
  dateNumber: string; // "17", "18", etc.
  relativeLabel: string; // "Today", "Tomorrow", "Wed"
}

export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getUpcomingDays(count = 7): DayOption[] {
  const days: DayOption[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dateStr = formatDateString(d);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateNumber = String(d.getDate());

    let relativeLabel = dayLabel;
    if (i === 0) relativeLabel = 'Today';
    else if (i === 1) relativeLabel = 'Tomorrow';

    days.push({
      date: dateStr,
      dayLabel,
      dateNumber,
      relativeLabel,
    });
  }

  return days;
}

export function formatFriendlyDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

