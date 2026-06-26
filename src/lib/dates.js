// Month/year helpers for the work-experience date pickers.

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() // 0-based

// Years offered in the dropdowns: a sensible span up to the current year.
export const YEARS = Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => CURRENT_YEAR - i)

// Is the given (monthIndex, year) in the future relative to today?
export function isFuture(monthIndex, year) {
  if (year == null || year === '' ) return false
  const y = Number(year)
  if (y > CURRENT_YEAR) return true
  if (y === CURRENT_YEAR && monthIndex != null && monthIndex !== '' && Number(monthIndex) > CURRENT_MONTH)
    return true
  return false
}

// Compare two year/month points; returns -1, 0, 1.
export function comparePoint(aMonth, aYear, bMonth, bYear) {
  const ay = Number(aYear), by = Number(bYear)
  if (ay !== by) return ay < by ? -1 : 1
  const am = Number(aMonth ?? 0), bm = Number(bMonth ?? 0)
  if (am !== bm) return am < bm ? -1 : 1
  return 0
}

// Build the human-readable "Mar 2021 — Present" string the profile renders.
export function formatRange(exp) {
  const start =
    exp.startYear != null && exp.startYear !== ''
      ? `${exp.startMonth != null && exp.startMonth !== '' ? MONTHS[Number(exp.startMonth)] + ' ' : ''}${exp.startYear}`
      : ''
  const end = exp.present
    ? 'Present'
    : exp.endYear != null && exp.endYear !== ''
      ? `${exp.endMonth != null && exp.endMonth !== '' ? MONTHS[Number(exp.endMonth)] + ' ' : ''}${exp.endYear}`
      : ''
  if (start && end) return `${start} — ${end}`
  return start || end || ''
}
