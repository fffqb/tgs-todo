import type { Translations } from '../i18n/translations'

const pad = (n: number) => String(n).padStart(2, '0')

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayStr(): string {
  return toDateStr(new Date())
}

export function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(str: string, days: number): string {
  const d = parseDate(str)
  d.setDate(d.getDate() + days)
  return toDateStr(d)
}

/** Number of days from `from` to `to` */
export function diffDays(from: string, to: string): number {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000)
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function formatShort(str: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(parseDate(str))
}

export function formatWeekday(str: string, locale: string): string {
  return capitalize(new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(parseDate(str)))
}

/** "Today", "Tomorrow", "Friday", "18 Nov" ... */
export function formatRelative(str: string, today: string, t: Translations, locale: string): string {
  const diff = diffDays(today, str)
  if (diff === 0) return t.today
  if (diff === 1) return t.tomorrow
  if (diff === -1) return t.yesterday
  if (diff > 1 && diff < 7) return formatWeekday(str, locale)
  return formatShort(str, locale)
}
