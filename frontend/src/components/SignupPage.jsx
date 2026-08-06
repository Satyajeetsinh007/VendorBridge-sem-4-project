import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AuthPages.css';

/* ─── Role definitions ─── */
const ROLES = [
  { value: 'procurement_officer', label: 'Procurement Officer', desc: 'Raises RFQs, invites vendors, compares quotes' },
  { value: 'manager',             label: 'Manager',             desc: 'Approves & rejects RFQs and vendor selections' },
  { value: 'finance',             label: 'Finance',             desc: 'Verifies invoices and manages payments' },
  { value: 'vendor',              label: 'Vendor (Internal)',   desc: 'Internal vendor relationship manager' },
];

const VENDOR_CATEGORIES = [
  'IT Hardware','IT Software','Electronics','Furniture',
  'Office Supplies','Logistics','Construction','Catering',
  'Security Services','Consulting','Other',
];

/* ─── Inline SVG icons ─── */
const Ico = {
  User:  () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Vendor:() => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 13V6l6-4 6 4v7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><rect x="6" y="9" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Email: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M1 5.5l7 4 7-4" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Lock:  () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Check: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Phone: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1 3-2 1a10 10 0 004 4l1-2 3 1v3a1 1 0 01-1 1A13 13 0 012 3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  Star:  () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5 6.5 5 8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  Bldg:  () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 13V6l6-4 6 4v7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><rect x="6" y="9" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Pin:   () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 9 4 9s4-6 4-9c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Globe: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 2c0 0-3 2-3 6s3 6 3 6M8 2c0 0 3 2 3 6s-3 6-3 6M2 8h12" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Doc:   () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Grid:  () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>,
  Info:  () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/><path d="M8 7v5M8 5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Eye:   () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>,
  EyeOff:() => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M3 7s1.5-3 5-3c.7 0 1.4.1 2 .4M13 7s-.5 1.2-1.5 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Arrow: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Back:  () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

/* Floating dots background */
const DOTS = [
  { size:5, top:'8%',  left:'5%',  delay:'0s',   dur:'6s'   },
  { size:3, top:'15%', left:'12%', delay:'1s',   dur:'8s'   },
  { size:4, top:'4%',  left:'22%', delay:'2s',   dur:'7s'   },
  { size:6, top:'20%', left:'78%', delay:'0.5s', dur:'9s'   },
  { size:3, top:'12%', left:'88%', delay:'3s',   dur:'6.5s' },
  { size:4, top:'72%', left:'8%',  delay:'1.5s', dur:'8s'   },
  { size:5, top:'80%', left:'18%', delay:'0s',   dur:'7.5s' },
  { size:3, top:'88%', left:'80%', delay:'2.5s', dur:'6s'   },
  { size:4, top:'75%', left:'92%', delay:'1s',   dur:'8.5s' },
  { size:6, top:'60%', left:'3%',  delay:'3.5s', dur:'7s'   },
  { size:3, top:'35%', left:'96%', delay:'0.5s', dur:'9s'   },
  { size:4, top:'50%', left:'48%', delay:'4s',   dur:'6s'   },
];

/* Shared field component */
function Field({ id, label, required, optional, children }) {
  return (
    <div className="auth-input-group">
      <label className="auth-input-label" htmlFor={id}>
        {label}
        {required && <span className="auth-required"> *</span>}
        {optional && <span style={{fontWeight:400,textTransform:'none',fontSize:'0.71rem',color:'#9ca3af',letterSpacing:0}}> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

/* Shared eye-toggle input */
function PwInput({ id, name, placeholder, value, onChange, show, onToggle }) {
  return (
    <div className="auth-input-wrap">
      <span className="auth-input-icon"><Ico.Lock /></span>
      <input id={id} className="auth-input" type={show ? 'text' : 'password'}
        name={name} placeholder={placeholder} value={value} onChange={onChange} required />
      <button type="button" className="auth-toggle-pw" onClick={onToggle} aria-label={show ? 'Hide' : 'Show'}>
        {show ? <Ico.EyeOff /> : <Ico.Eye />}
      </button>
    </div>
  );
}

export default function SignupPage({ onNavigateLogin }) {
  const [accountType, setAccountType] = useState('user');
  const [departments, setDepartments]  = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [userForm, setUserForm] = useState({ name:'', email:'', password:'', confirmPassword:'', role:'', department:'' });
  const [vendorForm, setVendorForm] = useState({ name:'', contact_person:'', email:'', password:'', confirmPassword:'', phone:'', category:'', gst_number:'', address:'', website:'' });
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [showCPw, setShowCPw]   = useState(false);

  useEffect(() => {
    setLoadingDepts(true);
    api.getDepartments().then(setDepartments).catch(() => setDepartments([])).finally(() => setLoadingDepts(false));
  }, []);

  const needsDept = userForm.role && userForm.role !== 'manager';
  const selRole   = ROLES.find(r => r.value === userForm.role);

  const onUserChange   = e => { setUserForm({...userForm,   [e.target.name]: e.target.value }); if (error) setError(''); };
  const onVendorChange = e => { setVendorForm({...vendorForm,[e.target.name]: e.target.value }); if (error) setError(''); };
  const switchType = t => { setAccountType(t); setError(''); setSuccess(''); };

  const handleUserSignup = async e => {
    e.preventDefault(); setError('');
    if (!userForm.name || !userForm.email || !userForm.password || !userForm.role)
      return setError('Please fill in all required fields.');
    if (userForm.password !== userForm.confirmPassword) return setError('Passwords do not match.');
    if (userForm.password.length < 6) return setError('Password must be at least 6 characters.');
    if (needsDept && !userForm.department) return setError('Please select your department.');
    setLoading(true);
    try {
      await api.signupUser({ name: userForm.name, email: userForm.email, password: userForm.password, role: userForm.role, department: userForm.department || undefined });
      setSubmitted(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVendorSignup = async e => {
    e.preventDefault(); setError('');
    if (!vendorForm.name || !vendorForm.email || !vendorForm.password || !vendorForm.phone || !vendorForm.address)
      return setError('Company name, email, password, phone, and address are required.');
    if (vendorForm.password !== vendorForm.confirmPassword) return setError('Passwords do not match.');
    if (vendorForm.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await api.signupVendor({ name: vendorForm.name, contact_person: vendorForm.contact_person, email: vendorForm.email, password: vendorForm.password, phone: vendorForm.phone, category: vendorForm.category, gst_number: vendorForm.gst_number, address: vendorForm.address, website: vendorForm.website });
      setSubmitted(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  /* ── Pending approval screen ── */
  if (submitted) {
    return (
      <div className="auth-root">
        <div className="auth-dots" aria-hidden="true">
          {DOTS.map((d,i) => <span key={i} className="auth-dot" style={{width:d.size,height:d.size,top:d.top,left:d.left,animationDelay:d.delay,animationDuration:d.dur}} />)}
        </div>
        <div className="auth-card auth-pending-card">
          <div className="auth-pending-icon-ring">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#d97706" strokeWidth="2"/>
              <path d="M16 9v8l5 3" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="auth-header" style={{marginBottom:0}}>
            <div className="auth-brand">VendorBridge</div>
            <div className="auth-title">Application Submitted</div>
            <div className="auth-subtitle">
              Your account is <span className="auth-text-warning">pending admin verification</span>. You will be notified once your access is approved.
            </div>
          </div>

          <div className="auth-pending-steps">
            <div className="auth-pending-step auth-pending-step--done">
              <span className="auth-step-dot">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Application submitted
            </div>
            <div className="auth-pending-step auth-pending-step--active">
              <span className="auth-step-dot">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M6 4v2.5l1.5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </span>
              Admin verification in progress
            </div>
            <div className="auth-pending-step">
              <span className="auth-step-dot">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.8"/></svg>
              </span>
              Account activated
            </div>
          </div>

          <button className="auth-submit-btn" onClick={onNavigateLogin} style={{marginTop:8}}>
            Return to Sign In
          </button>

          <div className="auth-footer" style={{marginTop:12}}>
            <button className="auth-back-btn" onClick={onNavigateLogin}>
              <Ico.Back /> Return to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Banner ── */
  const Banner = () => (
    <>
      {error && (
        <div className="auth-banner auth-banner--error">
          <div className="auth-banner__icon"><Ico.Info /></div>
          <div className="auth-banner__body">{error}</div>
        </div>
      )}
      {success && (
        <div className="auth-banner auth-banner--success">
          <div className="auth-banner__icon"><Ico.Info /></div>
          <div className="auth-banner__body">{success}</div>
        </div>
      )}
    </>
  );

  return (
    <div className="auth-root">
      {/* Floating dots */}
      <div className="auth-dots" aria-hidden="true">
        {DOTS.map((d,i) => <span key={i} className="auth-dot" style={{width:d.size,height:d.size,top:d.top,left:d.left,animationDelay:d.delay,animationDuration:d.dur}} />)}
      </div>

      <div className="auth-card auth-card--wide">

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          <button id="type-internal-btn" role="tab" aria-selected={accountType==='user'}
            className={`auth-tab-btn ${accountType==='user'?'auth-tab-btn--active':''}`}
            onClick={() => switchType('user')}>
            <Ico.User /> Internal User
          </button>
          <button id="type-vendor-btn" role="tab" aria-selected={accountType==='vendor'}
            className={`auth-tab-btn ${accountType==='vendor'?'auth-tab-btn--active':''}`}
            onClick={() => switchType('vendor')}>
            <Ico.Vendor /> Vendor Company
          </button>
        </div>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-brand">VendorBridge</div>
          <div className="auth-title">Create Account</div>
          <div className="auth-subtitle">
            {accountType === 'user'
              ? 'Create a new internal user account.'
              : 'Register your vendor company for procurement access.'}
          </div>
        </div>

        <Banner />

        {/* ═══ INTERNAL USER FORM ═══ */}
        {accountType === 'user' && (
          <form className="auth-form" onSubmit={handleUserSignup} noValidate>

            <Field id="user-name" label="Full Name" required>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Ico.User /></span>
                <input id="user-name" className="auth-input" type="text" name="name"
                  placeholder="Alex Mercer" value={userForm.name} onChange={onUserChange} required />
              </div>
            </Field>

            <Field id="user-email" label="Work Email" required>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Ico.Email /></span>
                <input id="user-email" className="auth-input" type="email" name="email"
                  placeholder="you@company.com" value={userForm.email} onChange={onUserChange} required />
              </div>
            </Field>

            <Field id="user-role" label="Role" required>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Ico.Star /></span>
                <select id="user-role" className="auth-input auth-select auth-input--bare" name="role"
                  value={userForm.role} onChange={onUserChange} required
                  style={{paddingLeft:'38px'}}>
                  <option value="">Select your role…</option>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {selRole && (
                <div style={{fontSize:'0.76rem',color:'#6b7280',marginTop:'4px',display:'flex',alignItems:'center',gap:5}}>
                  <span style={{width:4,height:4,borderRadius:'50%',background:'#2563eb',flexShrink:0,display:'inline-block'}} />
                  {selRole.desc}
                </div>
              )}
            </Field>

            {needsDept && (
              <div className="auth-field-animate">
                <Field id="user-dept" label="Department" required>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Ico.Bldg /></span>
                    <select id="user-dept" className="auth-input auth-select auth-input--bare" name="department"
                      value={userForm.department} onChange={onUserChange} required style={{paddingLeft:'38px'}}>
                      <option value="">{loadingDepts ? 'Loading…' : 'Select department…'}</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                    </select>
                  </div>
                </Field>
              </div>
            )}

            {userForm.role === 'manager' && (
              <div className="auth-info-box auth-field-animate">
                <Ico.Info />
                Managers oversee all departments — no department assignment needed.
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field id="user-password" label="Password" required>
                <PwInput id="user-password" name="password" placeholder="Min. 6 chars"
                  value={userForm.password} onChange={onUserChange} show={showPw} onToggle={() => setShowPw(s=>!s)} />
              </Field>
              <Field id="user-confirm-password" label="Confirm Password" required>
                <PwInput id="user-confirm-password" name="confirmPassword" placeholder="Re-enter"
                  value={userForm.confirmPassword} onChange={onUserChange} show={showCPw} onToggle={() => setShowCPw(s=>!s)} />
              </Field>
            </div>

            <button id="user-signup-submit" type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <><span>Create Account</span><Ico.Arrow /></>}
            </button>
          </form>
        )}

        {/* ═══ VENDOR COMPANY FORM ═══ */}
        {accountType === 'vendor' && (
          <form className="auth-form" onSubmit={handleVendorSignup} noValidate>

            <Field id="vendor-name" label="Company Name" required>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Ico.Vendor /></span>
                <input id="vendor-name" className="auth-input" type="text" name="name"
                  placeholder="Acme Technologies Pvt. Ltd." value={vendorForm.name} onChange={onVendorChange} required />
              </div>
            </Field>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field id="vendor-contact" label="Contact Person">
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Ico.User /></span>
                  <input id="vendor-contact" className="auth-input" type="text" name="contact_person"
                    placeholder="Rajesh Sharma" value={vendorForm.contact_person} onChange={onVendorChange} />
                </div>
              </Field>
              <Field id="vendor-phone" label="Phone" required>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Ico.Phone /></span>
                  <input id="vendor-phone" className="auth-input" type="tel" name="phone"
                    placeholder="+91-98765-43210" value={vendorForm.phone} onChange={onVendorChange} required />
                </div>
              </Field>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field id="vendor-email" label="Business Email" required>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Ico.Email /></span>
                  <input id="vendor-email" className="auth-input" type="email" name="email"
                    placeholder="sales@company.com" value={vendorForm.email} onChange={onVendorChange} required />
                </div>
              </Field>
              <Field id="vendor-category" label="Category">
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Ico.Grid /></span>
                  <select id="vendor-category" className="auth-input auth-select auth-input--bare" name="category"
                    value={vendorForm.category} onChange={onVendorChange} style={{paddingLeft:'38px'}}>
                    <option value="">Select…</option>
                    {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </Field>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field id="vendor-gst" label="GST Number">
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Ico.Doc /></span>
                  <input id="vendor-gst" className="auth-input" type="text" name="gst_number"
                    placeholder="27AABCD1234F1Z5" value={vendorForm.gst_number} onChange={onVendorChange} />
                </div>
              </Field>
              <Field id="vendor-website" label="Website" optional>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Ico.Globe /></span>
                  <input id="vendor-website" className="auth-input" type="url" name="website"
                    placeholder="https://company.com" value={vendorForm.website} onChange={onVendorChange} />
                </div>
              </Field>
            </div>

            <Field id="vendor-address" label="Business Address" required>
              <div className="auth-input-wrap" style={{alignItems:'flex-start'}}>
                <span className="auth-input-icon" style={{top:12,position:'absolute'}}><Ico.Pin /></span>
                <textarea id="vendor-address" className="auth-input auth-textarea" name="address"
                  placeholder="Plot 42, Industrial Area, Mumbai, Maharashtra 400001"
                  value={vendorForm.address} onChange={onVendorChange} required rows={2} />
              </div>
            </Field>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field id="vendor-password" label="Password" required>
                <PwInput id="vendor-password" name="password" placeholder="Min. 6 chars"
                  value={vendorForm.password} onChange={onVendorChange} show={showPw} onToggle={() => setShowPw(s=>!s)} />
              </Field>
              <Field id="vendor-confirm-password" label="Confirm Password" required>
                <PwInput id="vendor-confirm-password" name="confirmPassword" placeholder="Re-enter"
                  value={vendorForm.confirmPassword} onChange={onVendorChange} show={showCPw} onToggle={() => setShowCPw(s=>!s)} />
              </Field>
            </div>

            <div className="auth-vendor-code-note">
              <Ico.Info />
              A unique vendor code (e.g. <strong>VND-7821</strong>) will be auto-assigned after registration.
            </div>

            <button id="vendor-signup-submit" type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <><span>Register as Vendor</span><Ico.Arrow /></>}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="auth-footer">
          Have an account?{' '}
          <button id="goto-login-btn" className="auth-toggle-link" onClick={onNavigateLogin}>Sign In</button>
        </div>

        <button className="auth-back-btn" onClick={onNavigateLogin}>
          <Ico.Back /> Return to home
        </button>

      </div>
    </div>
  );
}
