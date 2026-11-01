import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import ProcurementDashboard from './components/ProcurementDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import VendorDashboard from './components/VendorDashboard'
import AdminDashboard from './components/AdminDashboard'
import FinanceDashboard from './components/FinanceDashboard'

/* ── Helper: redirect to the correct dashboard based on user role ── */
function getDashboardPath(user) {
  if (!user) return '/login'
  if (user.is_admin) return '/admin'
  switch (user.role) {
    case 'procurement_officer': return '/procurement'
    case 'manager': return '/manager'
    case 'vendor': return '/vendor'
    case 'finance': return '/finance'
    default: return '/login'
  }
}

/* ── Protected Route wrapper ── */
function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role) && !user.is_admin) {
    return <Navigate to={getDashboardPath(user)} replace />
  }
  return children
}

function App() {
  const [user, setUser] = useState(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Restore session from localStorage on app load
  useEffect(() => {
    const stored = localStorage.getItem('vb_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('vb_user')
      }
    }
    setIsRestoring(false)
  }, [])

  const handleLogin = (userData) => {
    localStorage.setItem('vb_user', JSON.stringify(userData))
    setUser(userData)
    window.scrollTo(0, 0)
    const dashPath = getDashboardPath(userData)
    navigate(dashPath, { replace: true })
  }

  const handleLogout = () => {
    localStorage.removeItem('vb_user')
    setUser(null)
    window.scrollTo(0, 0)
    navigate('/login', { replace: true })
  }

  // Wait for session restore before rendering routes
  if (isRestoring) return null

  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={getDashboardPath(user)} replace />
            : <LoginPage onLogin={handleLogin} />
        }
      />
      <Route
        path="/signup"
        element={
          user
            ? <Navigate to={getDashboardPath(user)} replace />
            : <SignupPage />
        }
      />

      {/* Admin dashboard */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute user={user} allowedRoles={['manager']}>
            <AdminDashboard onLogout={handleLogout} currentUser={user} />
          </ProtectedRoute>
        }
      />

      {/* Procurement dashboard */}
      <Route
        path="/procurement/*"
        element={
          <ProtectedRoute user={user} allowedRoles={['procurement_officer']}>
            <ProcurementDashboard onLogout={handleLogout} currentUser={user} />
          </ProtectedRoute>
        }
      />

      {/* Manager dashboard */}
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute user={user} allowedRoles={['manager']}>
            <ManagerDashboard onLogout={handleLogout} currentUser={user} />
          </ProtectedRoute>
        }
      />

      {/* Vendor dashboard */}
      <Route
        path="/vendor/*"
        element={
          <ProtectedRoute user={user} allowedRoles={['vendor']}>
            <VendorDashboard onLogout={handleLogout} currentUser={user} />
          </ProtectedRoute>
        }
      />

      {/* Finance dashboard */}
      <Route
        path="/finance/*"
        element={
          <ProtectedRoute user={user} allowedRoles={['finance']}>
            <FinanceDashboard onLogout={handleLogout} currentUser={user} />
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to={getDashboardPath(user)} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Catch-all: redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
