import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div style={{ font: '700 64px var(--display)', letterSpacing: '-.03em', color: 'var(--ink)' }}>404</div>
      <p style={{ fontSize: 16, color: 'var(--muted)', margin: '8px 0 24px' }}>This page doesn't exist.</p>
      <Link to="/" className="btn btn-primary" style={{ padding: '12px 22px', borderRadius: 11 }}>
        Back home
      </Link>
    </div>
  )
}
