import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { Info, Check } from '../components/Icons'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setBusy(true)
    const { error } = await signUp(form)
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    window.scrollTo(0, 0)
    setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
        <Logo to="/browse" size={27} fontSize={16} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        {!submitted ? (
          <div style={{ width: '100%', maxWidth: 420, animation: 'riseIn .6s ease both' }}>
            <h1 style={{ font: '700 30px var(--display)', letterSpacing: '-.02em', margin: '0 0 8px' }}>Apply to join</h1>
            <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 28px' }}>Create your graduate profile on ZC Network.</p>

            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Full name">
                <input required value={form.fullName} onChange={update('fullName')} placeholder="e.g. Mariam Khaled" className="field-input" />
              </Field>
              <Field label="Email">
                <input required type="email" value={form.email} onChange={update('email')} placeholder="you@zc.edu.eg" className="field-input" />
              </Field>
              <Field label="Password">
                <input required type="password" value={form.password} onChange={update('password')} placeholder="At least 8 characters" className="field-input" />
              </Field>

              {error && (
                <div style={{ fontSize: 13.5, color: 'oklch(0.7 0.17 25)' }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--accent-soft)', borderRadius: 12, padding: '13px 15px', marginTop: 2, color: 'var(--accent-ink)' }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}><Info size={17} /></span>
                <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                  Your account is <strong>pending admin approval</strong> before going live in the directory.
                </span>
              </div>

              <button type="submit" disabled={busy} className="btn btn-primary" style={{ padding: 14, fontSize: 15, marginTop: 4 }}>
                {busy ? 'Submitting…' : 'Submit application'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 22 }}>
              Already approved?{' '}
              <Link to="/login" style={{ font: '600 14px var(--body)', color: 'var(--accent-ink)', textDecoration: 'none' }}>Log in</Link>
            </p>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 440, textAlign: 'center', animation: 'riseIn .6s ease both' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--pub-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--pub)' }}>
              <Check size={34} strokeWidth={2.5} />
            </div>
            <h1 style={{ font: '700 28px var(--display)', letterSpacing: '-.02em', margin: '0 0 12px' }}>We received your application!</h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 28px' }}>
              We'll review it shortly and notify you by email once your profile is approved. This usually takes a day or two.
            </p>
            <button onClick={() => navigate('/browse')} className="btn btn-outline" style={{ padding: '13px 24px', fontSize: 15 }}>
              Back to directory
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}
