// Helpers that derive the presentational bits the mockup computes on the fly
// (initials, avatar tint, study span, career-path label) from a raw profile row.

export const PATH_LABELS = {
  job: 'Industry',
  grad: 'Grad school',
  startup: 'Startup',
  other: 'Other',
}

export const CAREER_PATHS = [
  { value: 'job', label: 'Industry' },
  { value: 'grad', label: 'Grad school' },
  { value: 'startup', label: 'Startup' },
  { value: 'other', label: 'Other' },
]

export const DEFAULT_PRIVACY = {
  about: true,
  location: true,
  work: true,
  email: true,
  phone: false,
  linkedin: true,
  github: true,
  twitter: false,
}

export function initials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  )
}

// Deterministic hue from the name so avatars stay stable across reloads
// (the mockup stored a hue per grad; we derive one instead).
export function hueFor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360
  return h
}

export function avatarTint(profile) {
  const hue = profile.hue ?? hueFor(profile.full_name || profile.id || '')
  return {
    bg: `oklch(0.32 0.075 ${hue})`,
    ink: `oklch(0.85 0.13 ${hue})`,
  }
}

// Short major code, e.g. "Communications & Information Eng." -> "CIE".
export function majorShort(major = '') {
  if (!major) return ''
  const words = major.replace(/&/g, '').split(/\s+/).filter(Boolean)
  const code = words
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
  return code || major.slice(0, 3).toUpperCase()
}

export function studySpan(profile) {
  const start = profile.started_year
  const grad = profile.grad_year
  if (start && grad) return `${start} — ${grad}`
  if (grad) return `${grad - 4} — ${grad}`
  return ''
}

// Current role/company shown on cards is derived from the most recent (first)
// work-experience entry, falling back to stored values.
export function currentRole(profile) {
  const first = (profile.experiences || [])[0]
  return profile.current_title || first?.title || ''
}

export function currentCompany(profile) {
  const first = (profile.experiences || [])[0]
  return profile.current_company || first?.company || ''
}

export function decorate(profile) {
  const tint = avatarTint(profile)
  return {
    ...profile,
    initials: initials(profile.full_name),
    monoBg: tint.bg,
    monoInk: tint.ink,
    short: majorShort(profile.major),
    studied: studySpan(profile),
    role: currentRole(profile),
    company: currentCompany(profile),
    pathName: PATH_LABELS[profile.career_path] || PATH_LABELS.other,
    privacy: { ...DEFAULT_PRIVACY, ...(profile.privacy || {}) },
    experiences: profile.experiences || [],
    links: profile.links || [],
  }
}
