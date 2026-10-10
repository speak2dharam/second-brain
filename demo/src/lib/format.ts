/** The demo's "today", matching the mock data. */
export const TODAY = '2026-10-10';
const YESTERDAY = '2026-10-09';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [d, t] = iso.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const time = t ? t.slice(0, 5) : '';
  if (d === TODAY) return time ? `Today ${time}` : 'Today';
  if (d === YESTERDAY) return time ? `Yesterday ${time}` : 'Yesterday';
  return `${day} ${MONTHS[m - 1]}${y !== 2026 ? ` ${y}` : ''}`;
}

export function nowIso(): string {
  const n = new Date();
  return `${TODAY}T${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
}

export const isToday = (iso: string) => iso.startsWith(TODAY);
