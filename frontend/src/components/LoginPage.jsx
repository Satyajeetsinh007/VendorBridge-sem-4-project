import React, { useState } from 'react';
import { api } from '../services/api';
import './AuthPages.css';

export default function LoginPage({ onLogin, onNavigateSignup }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState(''); // 'pending' | 'rejected' | ''
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) { setError(''); setErrorCode(''); setRejectionReason(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setRejectionReason('');
    setLoading(true);
    try {
      const userData = await api.login(form.email, form.password);
      localStorage.setItem('vb_user', JSON.stringify(userData));
      onLogin(userData);
    } catch (err) {
      if (err.code === 'pending' || err.code === 'rejected') {
        setErrorCode(err.code);
        setError(err.message);
        if (err.reason) setRejectionReason(err.reason);
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left panel – branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 8L14 3L24 8V20L14 25L4 20V8Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M14 3V25M4 8L24 20M24 8L4 20" stroke="white" strokeWidth="1.5" opacity="0.5"/>
              </svg>
            </div>
            <span className="auth-logo-text">VendorBridge</span>
          </div>

          <div className="auth-left-hero">
            <h1 className="auth-hero-title">Procurement, <br />reimagined.</h1>
            <p className="auth-hero-sub">
              A unified platform for RFQs, vendor selection, and purchase orders —
              built for modern procurement teams.
            </p>
          </div>

          <div className="auth-stats-row">
            <div className="auth-stat">
              <span className="auth-stat-num">4</span>
              <span className="auth-stat-label">Roles</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-num">360°</span>
              <span className="auth-stat-label">Vendor Visibility</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-num">Real-time</span>
              <span className="auth-stat-label">Approvals</span>
            </div>
          </div>
        </div>

        <div className="auth-left-glow" />
        <div className="auth-left-grid" />
      </div>

      {/* Right panel – login form */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-sub">Sign in to your VendorBridge account</p>
          </div>

          {/* Pending approval banner */}
          {errorCode === 'pending' && (
            <div className="auth-pending-banner">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
                <circle cx="8" cy="8" r="7" stroke="#f59e0b" strokeWidth="1.5"/>
                <path d="M8 5v3.5l2 1.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <div className="auth-banner-title">Pending Admin Approval</div>
                <div className="auth-banner-sub">{error}</div>
              </div>
            </div>
          )}

          {/* Rejected banner */}
          {errorCode === 'rejected' && (
            <div className="auth-rejected-banner">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
                <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5"/>
                <path d="M5 5l6 6M11 5l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <div className="auth-banner-title">Account Rejected</div>
                {rejectionReason && (
                  <div className="auth-banner-reason">Reason: {rejectionReason}</div>
                )}
                <button className="auth-reapply-link" type="button" onClick={onNavigateSignup}>
                  Re-apply with updated information →
                </button>
              </div>
            </div>
          )}

          {/* Generic error */}
          {error && !errorCode && (
            <div className="auth-error-banner">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5"/>
                <path d="M8 5v3M8 11v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field-group" style={{marginBottom: '14px'}}>
              <label className="auth-label" htmlFor="login-email">Email address</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M1 5.5l7 4 7-4" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field-group" style={{marginBottom: '20px'}}>
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M3 7s1.5-3 5-3c.7 0 1.4.1 2 .4M13 7s-.5 1.2-1.5 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Don't have an account?</span>
          </div>

          <button
            id="goto-signup-btn"
            className="auth-btn-secondary"
            onClick={onNavigateSignup}
          >
            Create an account
          </button>

          <button
            type="button"
            className="auth-btn-secondary"
            onClick={async () => {
              try {
                await api.seedData();
                alert('Database seeded successfully! Try logging in now:\n- Admin: admin@vendorbridge.com / admin123\n- Officer: officer@vendorbridge.com / changeme\n- Manager: manager@vendorbridge.com / changeme');
              } catch (err) {
                alert('Failed to seed database: ' + err.message);
              }
            }}
            style={{ marginTop: '8px', borderStyle: 'dashed', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#c7d2fe' }}
          >
            🌱 Seed Test Database
          </button>
        </div>
      </div>
    </div>
  );
}

