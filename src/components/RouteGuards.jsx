import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function FullPageLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--muted)',
        font: '600 15px var(--body)',
      }}
    >
      Loading…
    </div>
  )
}

// Requires an authenticated session; otherwise bounces to /login.
export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

// Requires an authenticated admin; otherwise bounces to the directory.
export function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/browse" replace />
  return children
}
