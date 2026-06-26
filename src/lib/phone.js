// Phone country codes + validation. `len` is the expected number of national
// digits (after the country code, leading zeros stripped). A range covers
// countries with variable-length numbers.
export const COUNTRIES = [
  { code: 'EG', name: 'Egypt', dial: '20', len: 10 },        // mobile: 1X XXXX XXXX (10 digits, no leading 0)
  { code: 'SA', name: 'Saudi Arabia', dial: '966', len: 9 },
  { code: 'AE', name: 'United Arab Emirates', dial: '971', len: 9 },
  { code: 'QA', name: 'Qatar', dial: '974', len: 8 },
  { code: 'KW', name: 'Kuwait', dial: '965', len: 8 },
  { code: 'US', name: 'United States', dial: '1', len: 10 },
  { code: 'GB', name: 'United Kingdom', dial: '44', len: 10 },
  { code: 'DE', name: 'Germany', dial: '49', len: [10, 11] },
  { code: 'FR', name: 'France', dial: '33', len: 9 },
  { code: 'CH', name: 'Switzerland', dial: '41', len: 9 },
  { code: 'IE', name: 'Ireland', dial: '353', len: 9 },
  { code: 'CA', name: 'Canada', dial: '1', len: 10 },
]

export const DEFAULT_COUNTRY = 'EG'

const byCode = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]))

export function countryByCode(code) {
  return byCode[code] || byCode[DEFAULT_COUNTRY]
}

// Keep only digits, and drop leading zeros (Egyptians often type 010… — the
// national number after +20 must not include that leading 0).
export function normalizeNational(raw) {
  return (raw || '').replace(/\D/g, '').replace(/^0+/, '')
}

function lenOk(country, digits) {
  const n = digits.length
  if (Array.isArray(country.len)) return n >= country.len[0] && n <= country.len[1]
  return n === country.len
}

// Validate the national part for a country. Returns { valid, message }.
export function validateNational(countryCode, raw) {
  const country = countryByCode(countryCode)
  const digits = normalizeNational(raw)
  if (!digits) return { valid: true, message: '' } // empty = no phone provided (allowed)
  if (!lenOk(country, digits)) {
    const want = Array.isArray(country.len) ? `${country.len[0]}–${country.len[1]}` : country.len
    return { valid: false, message: `${country.name} numbers need ${want} digits (you have ${digits.length}).` }
  }
  return { valid: true, message: '' }
}

// Compose the stored E.164 string, e.g. "+201005550142".
export function composePhone(countryCode, raw) {
  const country = countryByCode(countryCode)
  const digits = normalizeNational(raw)
  if (!digits) return ''
  return `+${country.dial}${digits}`
}

// Parse a stored "+20…" string back into { countryCode, national } for editing.
export function parsePhone(stored) {
  if (!stored) return { countryCode: DEFAULT_COUNTRY, national: '' }
  const cleaned = stored.replace(/[^\d+]/g, '')
  const digits = cleaned.replace(/^\+/, '')
  // Match the longest dial code first so "1" doesn't shadow "20"/"971".
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)
  for (const c of sorted) {
    if (digits.startsWith(c.dial)) {
      return { countryCode: c.code, national: digits.slice(c.dial.length) }
    }
  }
  return { countryCode: DEFAULT_COUNTRY, national: digits }
}
