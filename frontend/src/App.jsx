import React, { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import ProcurementDashboard from './components/ProcurementDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import VendorDashboard from './components/VendorDashboard'
import AdminDashboard from './components/AdminDashboard'
import FinanceDashboard from './components/FinanceDashboard'

function App() {
  const [page, setPage] = useState('login') // 'login' | 'signup'
  const [user, setUser] = useState(null)
  const [fadeState, setFadeState] = useState('none') // 'none' | 'fade-out' | 'fade-in'

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
    setFadeState('fade-out')
    setTimeout(() => {
      localStorage.setItem('vb_user', JSON.stringify(userData))
      setUser(userData)
      window.scrollTo(0, 0)
      
      setFadeState('fade-in')
      setTimeout(() => {
        setFadeState('none')
      }, 250)
    }, 250)
  }

  const handleLogout = () => {
    setFadeState('fade-out')
    setTimeout(() => {
      localStorage.removeItem('vb_user')
      setUser(null)
      setPage('login')
      window.scrollTo(0, 0)
      
      setFadeState('fade-in')
      setTimeout(() => {
        setFadeState('none')
      }, 250)
    }, 250)
  }

  const renderContent = () => {
    // ── Not logged in → show auth pages ──
    if (!user) {
      if (page === 'signup') {
        return (
          <SignupPage
            onNavigateLogin={() => {
              setFadeState('fade-out')
              setTimeout(() => {
                setPage('login')
                window.scrollTo(0, 0)
                setFadeState('fade-in')
                setTimeout(() => setFadeState('none'), 250)
              }, 250)
            }}
          />
        )
      }
      return (
        <LoginPage
          onLogin={handleLogin}
          onNavigateSignup={() => {
            setFadeState('fade-out')
            setTimeout(() => {
              setPage('signup')
              window.scrollTo(0, 0)
              setFadeState('fade-in')
              setTimeout(() => setFadeState('none'), 250)
            }, 250)
          }}
        />
      )
    }

    // ── Logged in → check if admin first ──
    if (user.is_admin) {
      return <AdminDashboard onLogout={handleLogout} currentUser={user} />
    }

    // ── Logged in → route by role ──
    const role = user.role

    if (role === 'procurement_officer') {
      return <ProcurementDashboard onLogout={handleLogout} currentUser={user} />
    }
    if (role === 'manager') {
      return <ManagerDashboard onLogout={handleLogout} currentUser={user} />
    }
    if (role === 'vendor') {
      return <VendorDashboard onLogout={handleLogout} currentUser={user} />
    }
    if (role === 'finance') {
      return <FinanceDashboard onLogout={handleLogout} currentUser={user} />
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

  return (
    <>
      {fadeState !== 'none' && (
        <div className={`fade-overlay ${fadeState}`} />
      )}
      {renderContent()}
    </>
  )
}

export default App

