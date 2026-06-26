// Email checks that DON'T require sending a message.
//
// Important: you cannot 100% confirm an address is real/owned without sending
// something. What we CAN do client-side:
//   1. Validate syntax.
//   2. Catch common provider typos (gmial.com → gmail.com).
//   3. Verify the domain can actually receive mail by looking up its MX records
//      over DNS-over-HTTPS. This rejects fake/mistyped domains (the most common
//      cause of bad signups) without emailing the user.
// Mailbox-level existence (does "john@gmail.com" exist?) genuinely requires
// SMTP probing, which is unreliable and widely blocked — so we don't attempt it.

const SYNTAX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmailSyntaxValid(email) {
  return SYNTAX.test((email || '').trim())
}

const COMMON_TYPOS = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'iclod.com': 'icloud.com',
}

// Returns a corrected address string if the domain looks like a common typo.
export function suggestEmailFix(email) {
  const [user, domain] = (email || '').trim().split('@')
  if (!user || !domain) return null
  const fix = COMMON_TYPOS[domain.toLowerCase()]
  return fix ? `${user}@${fix}` : null
}

async function resolve(domain, type) {
  const res = await fetch(
    `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`
  )
  return res.json()
}

// { ok: boolean, reason } — does the email's domain accept mail?
// Fails OPEN (ok:true) on network/DNS errors so a flaky lookup never blocks a
// legitimate signup.
export async function checkEmailDomainDeliverable(email) {
  const domain = (email || '').trim().split('@')[1]
  if (!domain) return { ok: false, reason: 'invalid' }
  try {
    const mx = await resolve(domain, 'MX')
    if (mx.Status === 3) return { ok: false, reason: 'no-domain' } // NXDOMAIN
    if (Array.isArray(mx.Answer) && mx.Answer.some((a) => a.type === 15)) return { ok: true }
    // No MX record — a domain with an A record can still receive mail (implicit MX).
    const a = await resolve(domain, 'A')
    if (Array.isArray(a.Answer) && a.Answer.length > 0) return { ok: true }
    return { ok: false, reason: 'no-mx' }
  } catch {
    return { ok: true, reason: 'check-skipped' }
  }
}
