import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import PrivacyToggle from '../components/PrivacyToggle'
import PhoneField from '../components/PhoneField'
import ExperienceEditor from '../components/ExperienceEditor'
import { Check } from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { DEFAULT_PRIVACY, initials, majorShort, avatarTint } from '../lib/profile'
import { SCHOOLS, majorsForSchool, schoolForMajor } from '../lib/zc'
import { isFuture, comparePoint, formatRange } from '../lib/dates'

const TABS = [
  { key: 'basic', label: 'Basic info' },
  { key: 'zc', label: 'ZC info' },
  { key: 'career', label: 'Career' },
  { key: 'contact', label: 'Contact' },
]

const emptyExp = () => ({
  title: '', company: '', path: 'job',
  startMonth: '', startYear: '', endMonth: '', endYear: '', present: false, desc: '',
})

// Build editable form state from a profile row (migrating any legacy experiences).
function toForm(p) {
  return {
    full_name: p.full_name || '',
    photo_url: p.photo_url || '',
    location: p.location || '',
    about: p.about || '',
    school: p.school || schoolForMajor(p.major) || SCHOOLS[0],
    major: p.major || '',
    started_year: p.started_year || '',
    grad_year: p.grad_year || '',
    experiences: (p.experiences || []).map((x) => ({ ...emptyExp(), ...x })),
    email: p.email || '',
    phone: p.phone || '',
    linkedin: p.linkedin || '',
    github: p.github || '',
    twitter: p.twitter || '',
    privacy: { ...DEFAULT_PRIVACY, ...(p.privacy || {}) },
  }
}

function completion(f) {
  const checks = [
    f.full_name, f.photo_url, f.about, f.location, f.school, f.major,
    f.started_year, f.grad_year, f.experiences.length > 0,
    f.email || f.phone || f.linkedin || f.github || f.twitter,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

// Returns an error string if any experience has invalid dates, else ''.
function validateExperiences(experiences) {
  for (const x of experiences) {
    if (isFuture(x.startMonth, x.startYear)) return 'Experience start dates can\'t be in the future.'
    if (!x.present && isFuture(x.endMonth, x.endYear)) return 'Experience end dates can\'t be in the future.'
    if (!x.present && x.startYear !== '' && x.endYear !== '' &&
      comparePoint(x.endMonth, x.endYear, x.startMonth, x.startYear) < 0) {
      return 'An experience has its end date before its start date.'
    }
  }
  return ''
}

export default function Dashboard() {
  const { profile, user, isAdmin, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('basic')
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [phoneValid, setPhoneValid] = useState(true)
  const snapshot = useRef('') // JSON of the last saved/initialized form, for dirty detection
  const loadedId = useRef(null)

  // Initialize the form ONCE per profile id — so a background token refresh
  // (which produces a new profile object) never wipes unsaved edits.
  useEffect(() => {
    if (profile && loadedId.current !== profile.id) {
      const f = toForm(profile)
      setForm(f)
      snapshot.current = JSON.stringify(f)
      loadedId.current = profile.id
    }
  }, [profile])

  const pct = useMemo(() => (form ? completion(form) : 0), [form])
  const dirty = form ? JSON.stringify(form) !== snapshot.current : false

  if (!profile || !form) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
        Loading your profile…
      </div>
    )
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleP = (k) => setForm((f) => ({ ...f, privacy: { ...f.privacy, [k]: !f.privacy[k] } }))
  const addExp = () => set('experiences', [...form.experiences, emptyExp()])
  const removeExp = (i) => set('experiences', form.experiences.filter((_, j) => j !== i))
  const changeExp = (i, next) => set('experiences', form.experiences.map((x, j) => (j === i ? next : x)))

  const tint = avatarTint({ full_name: form.full_name, id: profile.id })

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    // Folder = auth uid so the Storage RLS policy ("own folder") allows the write.
    const path = `${user.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) {
      setError(`Photo upload failed: ${upErr.message}`)
      return
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    set('photo_url', `${data.publicUrl}?t=${Date.now()}`)
  }

  const save = async () => {
    setError('')
    if (!phoneValid) { setTab('contact'); setError('Please fix the phone number before saving.'); return }
    const expErr = validateExperiences(form.experiences)
    if (expErr) { setTab('career'); setError(expErr); return }

    setSaving(true)
    // Compose each experience's display string + carry the headline/path forward.
    const experiences = form.experiences.map((x) => ({ ...x, dates: formatRange(x) || x.dates || '' }))
    const headline = experiences[0]
    const payload = {
      full_name: form.full_name,
      photo_url: form.photo_url || null,
      location: form.location || null,
      about: form.about || null,
      school: form.school || null,
      major: form.major || null,
      major_short: majorShort(form.major),
      started_year: form.started_year ? Number(form.started_year) : null,
      grad_year: form.grad_year ? Number(form.grad_year) : null,
      career_path: headline?.path || 'job',
      current_title: headline?.title || null,
      current_company: headline?.company || null,
      experiences,
      email: form.email || null,
      phone: form.phone || null,
      linkedin: form.linkedin || null,
      github: form.github || null,
      twitter: form.twitter || null,
      privacy: form.privacy,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('profiles').update(payload).eq('id', profile.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    const savedForm = { ...form, experiences }
    setForm(savedForm)
    snapshot.current = JSON.stringify(savedForm)
    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const statusBanner = {
    pending: { bg: 'var(--accent-soft)', col: 'var(--accent-ink)', text: 'Your account is pending admin approval — your profile is not visible in the directory yet.' },
    rejected: { bg: 'var(--priv-soft)', col: 'var(--ink)', text: 'Your application was not approved. Contact the ZC Network admins for details.' },
    suspended: { bg: 'var(--priv-soft)', col: 'var(--ink)', text: 'Your profile is currently suspended and hidden from the directory.' },
  }[profile.status]

  // Major options: this school's majors, plus the current value if it's legacy.
  const majorOptions = [...new Set([...majorsForSchool(form.school), form.major].filter(Boolean))]

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={29} fontSize={17} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isAdmin && (
              <Link to="/admin" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>
                Admin panel
              </Link>
            )}
            <button onClick={() => signOut().then(() => navigate('/'))} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13, color: 'var(--muted)' }}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 840, margin: '0 auto', padding: '28px 24px 80px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {statusBanner && (
          <div style={{ background: statusBanner.bg, color: statusBanner.col, borderRadius: 14, padding: '13px 18px', fontSize: 13.5, lineHeight: 1.5 }}>
            {statusBanner.text}
          </div>
        )}

        {/* profile strip with progress */}
        <div className="card anim-rise-in" style={{ padding: '20px 22px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 58, height: 58, borderRadius: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 21px var(--display)', background: tint.bg, color: tint.ink, overflow: 'hidden' }}>
            {form.photo_url ? <img src={form.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(form.full_name)}
          </div>
          <div style={{ minWidth: 150 }}>
            <div style={{ font: '700 18px var(--display)', letterSpacing: '-.01em' }}>{form.full_name || 'Your name'}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
              {majorShort(form.major) || '—'} · Class of {form.grad_year || '—'}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
              <span style={{ color: 'var(--muted)' }}>Profile completion</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-ink)' }}>{pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: 'var(--line)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width .3s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {saved && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '600 13.5px var(--body)', color: 'var(--pub)' }}>
                <Check size={15} color="var(--pub)" />Saved
              </span>
            )}
            {!saved && dirty && (
              <span style={{ font: '600 13px var(--body)', color: 'var(--faint)' }}>Unsaved changes</span>
            )}
            {profile.status === 'approved' && (
              <Link to={`/profile/${profile.id}`} className="btn btn-outline" style={{ padding: '10px 15px', fontSize: 13 }}>
                View public ↗
              </Link>
            )}
            <button onClick={save} disabled={saving} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14, borderRadius: 11 }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>

        {error && <div style={{ fontSize: 13.5, color: 'oklch(0.72 0.17 25)' }}>{error}</div>}

        {/* tabs */}
        <div style={{ display: 'flex', gap: 5, background: 'var(--line2)', border: '1px solid var(--line)', borderRadius: 14, padding: 5, flexWrap: 'wrap' }}>
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ flex: 1, minWidth: 90, border: 'none', borderRadius: 10, padding: '10px 8px', font: '600 13.5px var(--body)', cursor: 'pointer', background: active ? 'oklch(0.3 0.016 280)' : 'transparent', color: active ? 'var(--ink)' : 'var(--muted)', boxShadow: active ? '0 1px 2px rgba(0,0,0,.07)' : 'none' }}>
                {t.label}
              </button>
            )
          })}
        </div>

        {/* privacy legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, background: 'var(--accent-soft)', borderRadius: 14, padding: '13px 18px', fontSize: 13, color: 'var(--accent-ink)' }}>
          <span style={{ fontWeight: 600 }}>Each field has a visibility toggle:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--pub)' }} />Public — shows on your profile</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--priv)' }} />Private — only you can see it</span>
        </div>

        {tab === 'basic' && (
          <Section title="Basic info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 24px var(--display)', background: tint.bg, color: tint.ink, overflow: 'hidden' }}>
                {form.photo_url ? <img src={form.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(form.full_name)}
              </div>
              <label className="btn btn-outline" style={{ padding: '9px 16px', fontSize: 13.5, cursor: 'pointer' }}>
                Upload photo
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
              <Labeled label="Full name">
                <input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className="field-input compact" />
              </Labeled>
              <Labeled label="Current location" toggle={<PrivacyToggle isPublic={form.privacy.location} onToggle={() => toggleP('location')} />}>
                <input value={form.location} onChange={(e) => set('location', e.target.value)} className="field-input compact" placeholder="e.g. Cairo, EG" />
              </Labeled>
            </div>
            <div style={{ marginTop: 16 }}>
              <Labeled label="About me" toggle={<PrivacyToggle isPublic={form.privacy.about} onToggle={() => toggleP('about')} />}>
                <textarea rows={3} value={form.about} onChange={(e) => set('about', e.target.value)} className="field-input compact" style={{ resize: 'vertical', lineHeight: 1.55 }} />
              </Labeled>
            </div>
          </Section>
        )}

        {tab === 'zc' && (
          <Section title="ZC info">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
              <Labeled label="School">
                <select className="field-input compact select-caret" style={{ paddingRight: 36 }} value={form.school}
                  onChange={(e) => { const school = e.target.value; setForm((f) => ({ ...f, school, major: majorsForSchool(school).includes(f.major) ? f.major : '' })) }}>
                  {SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Labeled>
              <Labeled label="Major">
                <select className="field-input compact select-caret" style={{ paddingRight: 36 }} value={form.major} onChange={(e) => set('major', e.target.value)}>
                  <option value="">Select your major</option>
                  {majorOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Labeled>
              <Labeled label="Year started">
                <input type="number" value={form.started_year} onChange={(e) => set('started_year', e.target.value)} className="field-input compact" placeholder="2017" />
              </Labeled>
              <Labeled label="Year graduated">
                <input type="number" value={form.grad_year} onChange={(e) => set('grad_year', e.target.value)} className="field-input compact" placeholder="2021" />
              </Labeled>
            </div>
          </Section>
        )}

        {tab === 'career' && (
          <Section title="Work experience" headerRight={<PrivacyToggle isPublic={form.privacy.work} onToggle={() => toggleP('work')} padding="5px 11px" />}>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px' }}>
              Your most recent role (the first one) becomes the headline shown on your directory card.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {form.experiences.map((x, i) => (
                <ExperienceEditor key={i} exp={x} index={i} onChange={changeExp} onRemove={removeExp} />
              ))}
            </div>
            <button onClick={addExp} style={{ marginTop: 14, width: '100%', border: '1.5px dashed var(--line)', background: 'none', borderRadius: 12, padding: 12, font: '600 14px var(--body)', color: 'var(--accent-ink)', cursor: 'pointer' }}>
              + Add experience
            </button>
          </Section>
        )}

        {tab === 'contact' && (
          <Section title="Contact & socials">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ContactRow label="Email" value={form.email} onChange={(v) => set('email', v)} isPublic={form.privacy.email} onToggle={() => toggleP('email')} />
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <PhoneField value={form.phone} onChange={(v) => set('phone', v)} onValidityChange={setPhoneValid} />
                </div>
                <PrivacyToggle isPublic={form.privacy.phone} onToggle={() => toggleP('phone')} padding="8px 12px" />
              </div>
              <ContactRow label="LinkedIn" value={form.linkedin} onChange={(v) => set('linkedin', v)} isPublic={form.privacy.linkedin} onToggle={() => toggleP('linkedin')} />
              <ContactRow label="GitHub" value={form.github} onChange={(v) => set('github', v)} isPublic={form.privacy.github} onToggle={() => toggleP('github')} />
              <ContactRow label="Twitter / X" value={form.twitter} onChange={(v) => set('twitter', v)} isPublic={form.privacy.twitter} onToggle={() => toggleP('twitter')} />
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, headerRight, children }) {
  return (
    <section className="card anim-fade-up" style={{ padding: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ font: '700 17px var(--display)', margin: 0 }}>{title}</h2>
        {headerRight}
      </div>
      {children}
    </section>
  )
}

function Labeled({ label, toggle, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <label style={{ font: '600 13px var(--body)' }}>{label}</label>
        {toggle}
      </div>
      {children}
    </div>
  )
}

function ContactRow({ label, value, onChange, isPublic, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <label className="field-label">{label}</label>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="field-input compact" />
      </div>
      <PrivacyToggle isPublic={isPublic} onToggle={onToggle} padding="8px 12px" />
    </div>
  )
}
