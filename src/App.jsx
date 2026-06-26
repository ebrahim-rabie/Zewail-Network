import { Routes, Route } from 'react-router-dom'
import Backdrop from './components/Backdrop'
import { RequireAuth, RequireAdmin } from './components/RouteGuards'
import Welcome from './pages/Welcome'
import Browse from './pages/Browse'
import Profile from './pages/Profile'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <Backdrop />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  )
}
