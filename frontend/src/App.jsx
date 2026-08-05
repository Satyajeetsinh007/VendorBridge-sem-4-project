import React, { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import ProcurementDashboard from './components/ProcurementDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import VendorDashboard from './components/VendorDashboard'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [page, setPage] = useState('login') // 'login' | 'signup'
  const [user, setUser] = useState(null)

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
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('vb_user')
    setUser(null)
    setPage('login')
  }

  // ── Not logged in → show auth pages ──
  if (!user) {
    if (page === 'signup') {
      return (
        <SignupPage
          onNavigateLogin={() => setPage('login')}
        />
      )
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateSignup={() => setPage('signup')}
      />
    )
  }

  // ── Logged in → check if admin first ──
  if (user.is_admin) {
    return <AdminDashboard onLogout={handleLogout} currentUser={user} />
  }

  // ── Logged in → route by role ──
  const role = user.role


  if (role === 'procurement_officer' || role === 'finance') {
    return <ProcurementDashboard onLogout={handleLogout} currentUser={user} />
  }
  if (role === 'manager') {
    return <ManagerDashboard onLogout={handleLogout} currentUser={user} />
  }
  if (role === 'vendor') {
    return <VendorDashboard onLogout={handleLogout} currentUser={user} />
  }

  // Fallback — unknown role
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'var(--text-secondary)' }}>Unknown role: <strong>{role}</strong></p>
      <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', cursor: 'pointer' }}>
        Sign out
      </button>
    </div>
  )
}

export default App

