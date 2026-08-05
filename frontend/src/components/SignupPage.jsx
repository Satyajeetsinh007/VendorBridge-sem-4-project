import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AuthPages.css';

const ROLES = [
  { value: 'procurement_officer', label: 'Procurement Officer', icon: '📋', desc: 'Raises RFQs, invites vendors, compares quotes' },
  { value: 'manager', label: 'Manager', icon: '✅', desc: 'Approves & rejects RFQs and vendor selections' },
  { value: 'finance', label: 'Finance', icon: '💳', desc: 'Verifies invoices and manages payments' },
  { value: 'vendor', label: 'Vendor (Internal)', icon: '🤝', desc: 'Internal vendor relationship manager' },
];

const VENDOR_CATEGORIES = [
  'IT Hardware', 'IT Software', 'Electronics', 'Furniture',
  'Office Supplies', 'Logistics', 'Construction', 'Catering',
  'Security Services', 'Consulting', 'Other'
];

export default function SignupPage({ onNavigateLogin }) {
  const [accountType, setAccountType] = useState('user'); // 'user' | 'vendor'
  const [step, setStep] = useState(1); // Step 1: type select (for user: role + dept), Step 2: credentials
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // User form state
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: '', department: ''
  });

  // Vendor form state
  const [vendorForm, setVendorForm] = useState({
    name: '', contact_person: '', email: '', password: '',
    confirmPassword: '', phone: '', category: '', gst_number: '',
    address: '', website: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false); // show pending approval screen
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    setLoadingDepts(true);
    api.getDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepts(false));
  }, []);

  const needsDepartment = userForm.role && userForm.role !== 'manager';

  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleVendorChange = (e) => {
    setVendorForm({ ...vendorForm, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const switchAccountType = (type) => {
    setAccountType(type);
    setStep(1);
    setError('');
    setSuccess('');
  };

  // ── User Signup ──────────────────────────────────────────────────────────────
  const handleUserSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!userForm.name || !userForm.email || !userForm.password || !userForm.role) {
      return setError('Please fill in all required fields.');
    }
    if (userForm.password !== userForm.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (userForm.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (needsDepartment && !userForm.department) {
      return setError('Please select your department.');
    }

    setLoading(true);
    try {
      await api.signupUser({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        department: userForm.department || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Vendor Signup ────────────────────────────────────────────────────────────
  const handleVendorSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!vendorForm.name || !vendorForm.email || !vendorForm.password || !vendorForm.phone || !vendorForm.address) {
      return setError('Company name, email, password, phone, and address are required.');
    }
    if (vendorForm.password !== vendorForm.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (vendorForm.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await api.signupVendor({
        name: vendorForm.name,
        contact_person: vendorForm.contact_person,
        email: vendorForm.email,
        password: vendorForm.password,
        phone: vendorForm.phone,
        category: vendorForm.category,
        gst_number: vendorForm.gst_number,
        address: vendorForm.address,
        website: vendorForm.website,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleData = ROLES.find(r => r.value === userForm.role);

  // ── Pending Approval Screen ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="auth-root">
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
              <h1 className="auth-hero-title">Almost there!</h1>
              <p className="auth-hero-sub">Your application is under review. Our admin team typically processes requests within 24 hours.</p>
            </div>
          </div>
          <div className="auth-left-glow" />
          <div className="auth-left-grid" />
        </div>
        <div className="auth-right">
          <div className="auth-form-card" style={{textAlign:'center', gap: 24}}>
            <div className="auth-pending-icon">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="27" stroke="#f59e0b" strokeWidth="2"/>
                <path d="M28 16v14l8 5" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="auth-form-title" style={{textAlign:'center'}}>Application Submitted!</h2>
              <p className="auth-form-sub" style={{textAlign:'center', marginTop:8}}>
                Your account is <strong style={{color:'#f59e0b'}}>pending admin verification</strong>.
                You will be able to log in once approved.
              </p>
            </div>
            <div className="auth-pending-steps">
              <div className="auth-pending-step auth-pending-step--done">
                <span className="auth-step-dot">✓</span>
                <span>Application submitted</span>
              </div>
              <div className="auth-pending-step auth-pending-step--active">
                <span className="auth-step-dot">⏳</span>
                <span>Admin verification (in progress)</span>
              </div>
              <div className="auth-pending-step">
                <span className="auth-step-dot">○</span>
                <span>Account activated</span>
              </div>
            </div>
            <button
              className="auth-btn-primary"
              onClick={onNavigateLogin}
              style={{marginTop: 8}}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      {/* Left panel */}
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
            <h1 className="auth-hero-title">Join the <br />procurement <br />ecosystem.</h1>
            <p className="auth-hero-sub">
              Whether you're an internal team member or a vendor, 
              VendorBridge connects everyone in one seamless workflow.
            </p>
          </div>

          <div className="auth-role-pills">
            <div className="auth-role-pill">
              <span>📋</span> Procurement Officer
            </div>
            <div className="auth-role-pill">
              <span>✅</span> Manager
            </div>
            <div className="auth-role-pill">
              <span>💳</span> Finance
            </div>
            <div className="auth-role-pill">
              <span>🏭</span> Vendor
            </div>
          </div>
        </div>
        <div className="auth-left-glow" />
        <div className="auth-left-grid" />
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-card auth-form-card--signup">

          <div className="auth-form-header">
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-sub">Choose your account type to get started</p>
          </div>

          {/* Account type toggle */}
          <div className="auth-type-toggle">
            <button
              id="type-internal-btn"
              className={`auth-type-btn ${accountType === 'user' ? 'auth-type-btn--active' : ''}`}
              onClick={() => switchAccountType('user')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Internal User
            </button>
            <button
              id="type-vendor-btn"
              className={`auth-type-btn ${accountType === 'vendor' ? 'auth-type-btn--active' : ''}`}
              onClick={() => switchAccountType('vendor')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="6" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M8 10v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Vendor Company
            </button>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div className="auth-error-banner">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5"/>
                <path d="M8 5v3M8 11v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="auth-success-banner">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {success}
            </div>
          )}

          {/* ─── INTERNAL USER FORM ─── */}
          {accountType === 'user' && (
            <form className="auth-form" onSubmit={handleUserSignup} noValidate>
              <div className="auth-form-grid">
                {/* Full Name */}
                <div className="auth-field-group auth-field-full">
                  <label className="auth-label" htmlFor="user-name">Full Name <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input id="user-name" className="auth-input" type="text" name="name"
                      placeholder="Alex Mercer" value={userForm.name} onChange={handleUserChange} required />
                  </div>
                </div>

                {/* Email */}
                <div className="auth-field-group auth-field-full">
                  <label className="auth-label" htmlFor="user-email">Work Email <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M1 5.5l7 4 7-4" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <input id="user-email" className="auth-input" type="email" name="email"
                      placeholder="you@company.com" value={userForm.email} onChange={handleUserChange} required />
                  </div>
                </div>

                {/* Role */}
                <div className="auth-field-group auth-field-full">
                  <label className="auth-label" htmlFor="user-role">Role <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5 6.5 5 8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    </svg>
                    <select id="user-role" className="auth-input auth-select" name="role"
                      value={userForm.role} onChange={handleUserChange} required>
                      <option value="">Select your role…</option>
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.icon} {r.label}</option>
                      ))}
                    </select>
                  </div>
                  {selectedRoleData && (
                    <p className="auth-field-hint">
                      <span className="auth-hint-dot" /> {selectedRoleData.desc}
                    </p>
                  )}
                </div>

                {/* Department — hidden for manager */}
                {needsDepartment && (
                  <div className="auth-field-group auth-field-full auth-field-animate">
                    <label className="auth-label" htmlFor="user-dept">
                      Department <span className="auth-required">*</span>
                    </label>
                    <div className="auth-input-wrap">
                      <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 13V6l6-4 6 4v7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                        <rect x="6" y="9" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
                      </svg>
                      <select id="user-dept" className="auth-input auth-select" name="department"
                        value={userForm.department} onChange={handleUserChange} required>
                        <option value="">
                          {loadingDepts ? 'Loading departments…' : 'Select department…'}
                        </option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Manager notice */}
                {userForm.role === 'manager' && (
                  <div className="auth-info-box auth-field-full auth-field-animate">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#3b82f6" strokeWidth="1.5"/>
                      <path d="M8 7v5M8 5v.5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Managers oversee all departments — no department assignment needed.
                  </div>
                )}

                {/* Password */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="user-password">Password <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <input id="user-password" className="auth-input" type={showPassword ? 'text' : 'password'}
                      name="password" placeholder="Min. 6 characters" value={userForm.password}
                      onChange={handleUserChange} required />
                    <button type="button" className="auth-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M3 7s1.5-3 5-3c.7 0 1.4.1 2 .4M13 7s-.5 1.2-1.5 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="user-confirm-password">Confirm Password <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <input id="user-confirm-password" className="auth-input" type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword" placeholder="Re-enter password" value={userForm.confirmPassword}
                      onChange={handleUserChange} required />
                    <button type="button" className="auth-toggle-pw" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M3 7s1.5-3 5-3c.7 0 1.4.1 2 .4M13 7s-.5 1.2-1.5 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button id="user-signup-submit" type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : (
                  <>
                    Create Account
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ─── VENDOR COMPANY FORM ─── */}
          {accountType === 'vendor' && (
            <form className="auth-form" onSubmit={handleVendorSignup} noValidate>
              <div className="auth-form-grid">
                {/* Company Name */}
                <div className="auth-field-group auth-field-full">
                  <label className="auth-label" htmlFor="vendor-name">Company Name <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="6" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <input id="vendor-name" className="auth-input" type="text" name="name"
                      placeholder="Acme Technologies Pvt. Ltd." value={vendorForm.name} onChange={handleVendorChange} required />
                  </div>
                </div>

                {/* Contact Person */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="vendor-contact">Contact Person</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input id="vendor-contact" className="auth-input" type="text" name="contact_person"
                      placeholder="Rajesh Sharma" value={vendorForm.contact_person} onChange={handleVendorChange} />
                  </div>
                </div>

                {/* Phone */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="vendor-phone">Phone <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 2h3l1 3-2 1a10 10 0 004 4l1-2 3 1v3a1 1 0 01-1 1A13 13 0 012 3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                    <input id="vendor-phone" className="auth-input" type="tel" name="phone"
                      placeholder="+91-98765-43210" value={vendorForm.phone} onChange={handleVendorChange} required />
                  </div>
                </div>

                {/* Email */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="vendor-email">Business Email <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M1 5.5l7 4 7-4" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <input id="vendor-email" className="auth-input" type="email" name="email"
                      placeholder="sales@company.com" value={vendorForm.email} onChange={handleVendorChange} required />
                  </div>
                </div>

                {/* Category */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="vendor-category">Category</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <select id="vendor-category" className="auth-input auth-select" name="category"
                      value={vendorForm.category} onChange={handleVendorChange}>
                      <option value="">Select category…</option>
                      {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* GST Number */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="vendor-gst">GST Number</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input id="vendor-gst" className="auth-input" type="text" name="gst_number"
                      placeholder="27AABCD1234F1Z5" value={vendorForm.gst_number} onChange={handleVendorChange} />
                  </div>
                </div>

                {/* Address */}
                <div className="auth-field-group auth-field-full">
                  <label className="auth-label" htmlFor="vendor-address">Business Address <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap auth-textarea-wrap">
                    <svg className="auth-input-icon auth-textarea-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 9 4 9s4-6 4-9c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.4"/>
                      <circle cx="8" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <textarea id="vendor-address" className="auth-input auth-textarea" name="address"
                      placeholder="Plot 42, Industrial Area, Mumbai, Maharashtra 400001"
                      value={vendorForm.address} onChange={handleVendorChange} required rows={2} />
                  </div>
                </div>

                {/* Website */}
                <div className="auth-field-group auth-field-full">
                  <label className="auth-label" htmlFor="vendor-website">Website <span className="auth-optional">(optional)</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M8 2c0 0-3 2-3 6s3 6 3 6" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M8 2c0 0 3 2 3 6s-3 6-3 6M2 8h12" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <input id="vendor-website" className="auth-input" type="url" name="website"
                      placeholder="https://www.company.com" value={vendorForm.website} onChange={handleVendorChange} />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="vendor-password">Password <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <input id="vendor-password" className="auth-input" type={showPassword ? 'text' : 'password'}
                      name="password" placeholder="Min. 6 characters" value={vendorForm.password}
                      onChange={handleVendorChange} required />
                    <button type="button" className="auth-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M3 7s1.5-3 5-3c.7 0 1.4.1 2 .4M13 7s-.5 1.2-1.5 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="auth-field-group">
                  <label className="auth-label" htmlFor="vendor-confirm-password">Confirm Password <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    <input id="vendor-confirm-password" className="auth-input" type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword" placeholder="Re-enter password" value={vendorForm.confirmPassword}
                      onChange={handleVendorChange} required />
                    <button type="button" className="auth-toggle-pw" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M3 7s1.5-3 5-3c.7 0 1.4.1 2 .4M13 7s-.5 1.2-1.5 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="auth-vendor-code-note">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#a78bfa" strokeWidth="1.5"/>
                  <path d="M8 7v5M8 5v.5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                A unique vendor code (e.g. <strong>VND-7821</strong>) will be auto-assigned after registration.
              </div>

              <button id="vendor-signup-submit" type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : (
                  <>
                    Register as Vendor
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <button id="goto-login-btn" className="auth-btn-secondary" onClick={onNavigateLogin}>
            Sign in instead
          </button>
        </div>
      </div>
    </div>
  );
}
