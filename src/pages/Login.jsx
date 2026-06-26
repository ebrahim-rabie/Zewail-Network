import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await signIn(form)
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    const dest = location.state?.from?.pathname || '/dashboard'
    navigate(dest, { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
        <Logo to="/browse" size={27} fontSize={16} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'riseIn .6s ease both' }}>
          <h1 style={{ font: '700 30px var(--display)', letterSpacing: '-.02em', margin: '0 0 8px' }}>Welcome back</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', margin: '0 0 28px' }}>Log in to edit your profile.</p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label">Email</label>
              <input type="email" required value={form.email} onChange={update('email')} placeholder="you@zc.edu.eg" className="field-input" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label className="field-label" style={{ marginBottom: 0 }}>Password</label>
                <button type="button" onClick={(e) => e.preventDefault()} style={{ background: 'none', border: 'none', font: '600 13px var(--body)', color: 'var(--accent-ink)', cursor: 'pointer', padding: 0 }}>
                  Forgot?
                </button>
              </div>
              <input type="password" required value={form.password} onChange={update('password')} placeholder="Your password" className="field-input" />
            </div>

            {error && <div style={{ fontSize: 13.5, color: 'oklch(0.7 0.17 25)' }}>{error}</div>}

            <button type="submit" disabled={busy} className="btn btn-primary" style={{ padding: 14, fontSize: 15, marginTop: 4 }}>
              {busy ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', marginTop: 22 }}>
            New here?{' '}
            <Link to="/signup" style={{ font: '600 14px var(--body)', color: 'var(--accent-ink)', textDecoration: 'none' }}>Apply to join</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
