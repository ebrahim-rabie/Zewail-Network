import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Right-aligned header actions that adapt to auth state: guests see Log in / Join,
// signed-in members see Dashboard (+ Admin) and Log out.
export default function AuthButtons() {
  const { user, isAdmin, signOut } = useAuth()

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isAdmin && (
          <Link to="/admin" className="btn btn-outline" style={{ padding: '9px 16px', fontSize: 14 }}>
            Admin
          </Link>
        )}
        <Link to="/dashboard" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
          My profile
        </Link>
        <button
          onClick={signOut}
          className="btn btn-outline"
          style={{ padding: '9px 16px', fontSize: 14, color: 'var(--muted)' }}
        >
          Log out
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Link to="/login" className="btn btn-outline" style={{ padding: '9px 18px', fontSize: 14 }}>
        Log in
      </Link>
      <Link to="/signup" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }}>
        Join
      </Link>
    </div>
  )
}
