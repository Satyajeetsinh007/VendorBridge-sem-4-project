import React, { useState } from 'react';
import { api } from '../services/api';
import './AuthPages.css';

/* ── SVG Icons ── */
const IconEmail = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 5.5l7 4 7-4" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M3 7s1.5-3 5-3c.7 0 1.4.1 2 .4M13 7s-.5 1.2-1.5 2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconArrow = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Tab icons ── */
const TabIconUser = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TabIconVendor = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M2 13V6l6-4 6 4v7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="6" y="9" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

/* Dot scatter background */
const DOTS = [
  { size: 5, top: '8%',  left: '5%',  delay: '0s',   dur: '6s'  },
  { size: 3, top: '15%', left: '12%', delay: '1s',   dur: '8s'  },
  { size: 4, top: '4%',  left: '22%', delay: '2s',   dur: '7s'  },
  { size: 6, top: '20%', left: '78%', delay: '0.5s', dur: '9s'  },
  { size: 3, top: '12%', left: '88%', delay: '3s',   dur: '6.5s'},
  { size: 4, top: '72%', left: '8%',  delay: '1.5s', dur: '8s'  },
  { size: 5, top: '80%', left: '18%', delay: '0s',   dur: '7.5s'},
  { size: 3, top: '88%', left: '80%', delay: '2.5s', dur: '6s'  },
  { size: 4, top: '75%', left: '92%', delay: '1s',   dur: '8.5s'},
  { size: 6, top: '60%', left: '3%',  delay: '3.5s', dur: '7s'  },
  { size: 3, top: '35%', left: '96%', delay: '0.5s', dur: '9s'  },
  { size: 4, top: '50%', left: '48%', delay: '4s',   dur: '6s'  },
];

export default function LoginPage({ onLogin, onNavigateSignup }) {
  const [accountType, setAccountType] = useState('user'); // 'user' | 'vendor'
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) { setError(''); setErrorCode(''); setRejectionReason(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setErrorCode(''); setRejectionReason('');
    setLoading(true);
    try {
      // 600ms processing delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 600));
      const userData = await api.login(form.email, form.password, accountType);

      // Strict portal isolation verification
      if (accountType === 'user' && userData.type !== 'user') {
        throw new Error('Invalid email or password.');
      }
      if (accountType === 'vendor' && userData.type !== 'vendor') {
        throw new Error('Invalid email or password.');
      }

      localStorage.setItem('vb_user', JSON.stringify(userData));
      onLogin(userData);
    } catch (err) {
      if (err.code === 'pending' || err.code === 'rejected') {
        setErrorCode(err.code);
        setError(err.message);
        if (err.reason) setRejectionReason(err.reason);
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = accountType === 'user' ? 'account' : 'vendor account';

  return (
    <div className="auth-root">
      {/* Floating dots */}
      <div className="auth-dots" aria-hidden="true">
        {DOTS.map((d, i) => (
          <span
            key={i}
            className="auth-dot"
            style={{
              width: d.size, height: d.size,
              top: d.top, left: d.left,
              animationDelay: d.delay,
              animationDuration: d.dur,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="auth-card">

        {/* Tab selector — account type */}
        <div className="auth-tabs" role="tablist">
          <button
            id="tab-user"
            role="tab"
            aria-selected={accountType === 'user'}
            className={`auth-tab-btn ${accountType === 'user' ? 'auth-tab-btn--active' : ''}`}
            onClick={() => { setAccountType('user'); setError(''); }}
          >
            <TabIconUser /> Internal User
          </button>
          <button
            id="tab-vendor"
            role="tab"
            aria-selected={accountType === 'vendor'}
            className={`auth-tab-btn ${accountType === 'vendor' ? 'auth-tab-btn--active' : ''}`}
            onClick={() => { setAccountType('vendor'); setError(''); }}
          >
            <TabIconVendor /> Vendor
          </button>
        </div>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand">VendorBridge</div>
          <div className="auth-title">Sign In</div>
          <div className="auth-subtitle">
            Sign in to access your {roleLabel}.
          </div>
        </div>

        {/* Banners */}
        {errorCode === 'pending' && (
          <div className="auth-banner auth-banner--warning" style={{ marginBottom: 12 }}>
            <div className="auth-banner__icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#92400e" strokeWidth="1.5"/>
                <path d="M8 5v3.5l2 1.5" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="auth-banner__title">Pending Admin Approval</div>
              <div className="auth-banner__body">{error}</div>
            </div>
          </div>
        )}

        {errorCode === 'rejected' && (
          <div className="auth-banner auth-banner--error" style={{ marginBottom: 12 }}>
            <div className="auth-banner__icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#991b1b" strokeWidth="1.5"/>
                <path d="M5 5l6 6M11 5l-6 6" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="auth-banner__title">Account Rejected</div>
              {rejectionReason && <div className="auth-banner__reason">Reason: {rejectionReason}</div>}
              <button className="auth-reapply-link" type="button" onClick={onNavigateSignup}>
                Re-apply with updated information →
              </button>
            </div>
          </div>
        )}

        {error && !errorCode && (
          <div className="auth-banner auth-banner--error" style={{ marginBottom: 12 }}>
            <div className="auth-banner__icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#991b1b" strokeWidth="1.5"/>
                <path d="M8 5v3M8 11v.5" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="auth-banner__body">{error}</div>
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="auth-input-group">
            <label className="auth-input-label" htmlFor="login-email">Work Email</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><IconEmail /></span>
              <input
                id="login-email"
                className="auth-input"
                type="email"
                name="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <div className="auth-input-label-row">
              <label className="auth-input-label" htmlFor="login-password">Password</label>
            </div>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><IconLock /></span>
              <input
                id="login-password"
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-toggle-pw"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button id="login-submit-btn" type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : <><span>Continue</span><IconArrow /></>}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          New to VendorBridge?{' '}
          <button id="goto-signup-btn" className="auth-toggle-link" onClick={onNavigateSignup}>
            Sign Up
          </button>
        </div>

        <button
          type="button"
          className="auth-back-btn"
          onClick={async () => {
            try {
              await api.seedData();
              alert('Seeded!\n- admin@vendorbridge.com / admin123\n- officer@vendorbridge.com / changeme\n- manager@vendorbridge.com / changeme');
            } catch (err) {
              alert('Seed failed: ' + err.message);
            }
          }}
        >
          <span style={{opacity:0.5, fontSize:'0.72rem', letterSpacing:'0.03em'}}>DEV: Seed Test Database</span>
        </button>

      </div>
    </div>
  );
}
