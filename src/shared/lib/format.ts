const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ja-JP').format(Math.round(value));
}

export function formatPercent(value: number, digits = 2): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatHour(hour: number | null): string {
  return hour === null ? '—' : `${hour}時台`;
}

export function formatDayOfWeek(day: number | null): string {
  return day === null ? '—' : `${DAY_LABELS[day]}曜日`;
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start || !end) return '—';
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('ja-JP');
  return `${fmt(start)} 〜 ${fmt(end)}`;
}
