import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AdminDashboard.css';

/* ── SVG Icons ── */
const Icons = {
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
  ),
  Database: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
};

export default function AdminDashboard({ onLogout, currentUser }) {
  const [tab, setTab] = useState('pending'); // 'pending' | 'all'
  const [subTab, setSubTab] = useState('users'); // 'users' | 'vendors'
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [stats, setStats] = useState({
    pending_users: 0,
    pending_vendors: 0,
    approved_users: 0,
    approved_vendors: 0,
    rejected_users: 0,
    rejected_vendors: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Rejection modal/state
  const [actionTarget, setActionTarget] = useState(null); // { type: 'user'|'vendor', item: any }
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch pending
      const pUsers = await api.adminGetPendingUsers();
      const pVendors = await api.adminGetPendingVendors();
      
      // Fetch all + stats
      const allData = await api.adminGetAllAccounts();

      setPendingUsers(pUsers);
      setPendingVendors(pVendors);
      setAllUsers(allData.users || []);
      setAllVendors(allData.vendors || []);
      if (allData.stats) {
        setStats(allData.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (item, type) => {
    if (!window.confirm(`Are you sure you want to approve ${item.name}?`)) return;
    try {
      setActionLoading(true);
      if (type === 'user') {
        await api.adminVerifyUser(item.id, 'approve');
      } else {
        await api.adminVerifyVendor(item.id, 'approve');
      }
      setActionTarget(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to approve account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    try {
      setActionLoading(true);
      if (actionTarget.type === 'user') {
        await api.adminVerifyUser(actionTarget.item.id, 'reject', rejectReason);
      } else {
        await api.adminVerifyVendor(actionTarget.item.id, 'reject', rejectReason);
      }
      setActionTarget(null);
      setRejectReason('');
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to reject account');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPending = stats.pending_users + stats.pending_vendors;
  const totalApproved = stats.approved_users + stats.approved_vendors;
  const totalRejected = stats.rejected_users + stats.rejected_vendors;

  return (
    <div className="layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img 
            src="/logo.png" 
            className="brand-logo" 
            alt="VB" 
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            style={{ objectFit: 'contain', padding: '2px', background: 'transparent' }} 
          />
          <div className="brand-logo" style={{ display: 'none', background: '#111827' }}>VB</div>
          <div className="brand-text">
            <span className="brand-name">VendorBridge</span>
            <span className="brand-sub">Control Center</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Admin Controls</span>
          <a
            href="#"
            className={`nav-link ${tab === 'pending' ? 'active' : ''}`}
            onClick={e => { e.preventDefault(); setTab('pending'); }}
          >
            <Icons.Clock />
            <span>Pending Requests</span>
            {totalPending > 0 && (
              <span className="pill-count" style={{ marginLeft: 'auto', background: 'var(--accent)' }}>{totalPending}</span>
            )}
          </a>
          <a
            href="#"
            className={`nav-link ${tab === 'all' ? 'active' : ''}`}
            onClick={e => { e.preventDefault(); setTab('all'); }}
          >
            <Icons.Users />
            <span>All Accounts</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="seed-btn" onClick={fetchDashboardData}>
            <Icons.Database /> Sync Accounts Database
          </button>

          {/* Usage limit bar matching between.indevs.in */}
          <div className="sidebar-usage">
            <div className="usage-label">Verifications: {totalApproved} approved</div>
            <div className="usage-progress-bar">
              <div className="usage-progress-fill" style={{ width: `${Math.min((totalApproved / (totalApproved + totalPending || 1)) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Profile widget matching between.indevs.in */}
          <div className="sidebar-profile">
            <div className="profile-avatar">A</div>
            <div className="profile-meta">
              <span className="profile-name">{currentUser?.name || 'Administrator'}</span>
              <span className="profile-email">admin@vendorbridge.com</span>
            </div>
            {onLogout && (
              <button className="profile-logout-btn" onClick={onLogout} title="Logout">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="main-area">
        {/* Header */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {tab === 'pending' ? 'Pending Verifications' : 'Accounts Management'}
            </h1>
            <span className="breadcrumb">System &nbsp;/&nbsp; Admin Workspace</span>
          </div>
        </header>

      {/* Main Body */}
      <main className="admin-main">
        {/* Stats Grid */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="stat-label">Pending Verification</span>
            <span className="stat-number text-amber">{totalPending}</span>
            <span className="stat-desc">{stats.pending_users} internal • {stats.pending_vendors} vendors</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Verified & Active</span>
            <span className="stat-number text-green">{totalApproved}</span>
            <span className="stat-desc">Approved platform accounts</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Rejected Applications</span>
            <span className="stat-number text-red">{totalRejected}</span>
            <span className="stat-desc">Rejected from system access</span>
          </div>
        </section>

        {error && (
          <div className="admin-error-box">
            <span>⚠️ {error}</span>
            <button onClick={fetchDashboardData}>Retry</button>
          </div>
        )}

        {/* Tab Content */}
        {loading ? (
          <div className="admin-loader-container">
            <div className="admin-loader"></div>
            <p>Loading accounts database...</p>
          </div>
        ) : (
          <div className="admin-panel-card">
            {tab === 'pending' ? (
              <>
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">Pending Verifications</h3>
                    <p className="panel-subtitle">Review signup requests before granting system access.</p>
                  </div>
                  <div className="subtabs-wrap">
                    <button 
                      className={`subtab-btn ${subTab === 'users' ? 'active' : ''}`}
                      onClick={() => setSubTab('users')}
                    >
                      Organization Users ({pendingUsers.length})
                    </button>
                    <button 
                      className={`subtab-btn ${subTab === 'vendors' ? 'active' : ''}`}
                      onClick={() => setSubTab('vendors')}
                    >
                      Vendor Companies ({pendingVendors.length})
                    </button>
                  </div>
                </div>

                <div className="panel-body">
                  {subTab === 'users' ? (
                    pendingUsers.length === 0 ? (
                      <div className="empty-panel">
                        <span>🎉</span>
                        <h4>No Pending Users</h4>
                        <p>All internal user signups have been verified.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Full Name</th>
                              <th>Email Address</th>
                              <th>Requested Role</th>
                              <th>Department</th>
                              <th>Applied Date</th>
                              <th style={{textAlign: 'right'}}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingUsers.map(u => (
                              <tr key={u.id}>
                                <td><strong>{u.name}</strong></td>
                                <td>{u.email}</td>
                                <td><span className={`badge-role ${u.role}`}>{u.role.replace('_', ' ')}</span></td>
                                <td>{u.department || <span className="text-muted">—</span>}</td>
                                <td>{new Date(u.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</td>
                                <td style={{textAlign: 'right'}}>
                                  <div className="action-btns-wrap">
                                    <button 
                                      className="btn-approve" 
                                      onClick={() => handleApprove(u, 'user')}
                                      disabled={actionLoading}
                                    >
                                      Verify
                                    </button>
                                    <button 
                                      className="btn-reject"
                                      onClick={() => setActionTarget({ type: 'user', item: u })}
                                      disabled={actionLoading}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    pendingVendors.length === 0 ? (
                      <div className="empty-panel">
                        <span>🎉</span>
                        <h4>No Pending Vendors</h4>
                        <p>All external vendor applications have been verified.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Company Name</th>
                              <th>Code (Auto)</th>
                              <th>Category</th>
                              <th>Email</th>
                              <th>GST Number</th>
                              <th>Phone & Address</th>
                              <th style={{textAlign: 'right'}}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingVendors.map(v => (
                              <tr key={v.id}>
                                <td><strong>{v.name}</strong></td>
                                <td><code>{v.vendor_code}</code></td>
                                <td><span className="badge-category">{v.category || 'General'}</span></td>
                                <td>{v.email}</td>
                                <td><code>{v.gst_number || 'N/A'}</code></td>
                                <td>
                                  <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                                    <div>{v.phone}</div>
                                    <div style={{maxWidth: 240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={v.address}>
                                      {v.address}
                                    </div>
                                  </div>
                                </td>
                                <td style={{textAlign: 'right'}}>
                                  <div className="action-btns-wrap">
                                    <button 
                                      className="btn-approve"
                                      onClick={() => handleApprove(v, 'vendor')}
                                      disabled={actionLoading}
                                    >
                                      Verify Vendor
                                    </button>
                                    <button 
                                      className="btn-reject"
                                      onClick={() => setActionTarget({ type: 'vendor', item: v })}
                                      disabled={actionLoading}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">All Registered Accounts</h3>
                    <p className="panel-subtitle">Overview of all platform accounts and verification logs.</p>
                  </div>
                  <div className="subtabs-wrap">
                    <button 
                      className={`subtab-btn ${subTab === 'users' ? 'active' : ''}`}
                      onClick={() => setSubTab('users')}
                    >
                      Users database ({allUsers.length})
                    </button>
                    <button 
                      className={`subtab-btn ${subTab === 'vendors' ? 'active' : ''}`}
                      onClick={() => setSubTab('vendors')}
                    >
                      Vendors database ({allVendors.length})
                    </button>
                  </div>
                </div>

                <div className="panel-body">
                  {subTab === 'users' ? (
                    allUsers.length === 0 ? (
                      <div className="empty-panel">
                        <p>No user database records found.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>User Name</th>
                              <th>Email</th>
                              <th>Role</th>
                              <th>Department</th>
                              <th>Verification Status</th>
                              <th>Rejection Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allUsers.map(u => (
                              <tr key={u.id}>
                                <td><strong>{u.name}</strong></td>
                                <td>{u.email}</td>
                                <td><span className={`badge-role ${u.role}`}>{u.role.replace('_', ' ')}</span></td>
                                <td>{u.department || '—'}</td>
                                <td>
                                  <span className={`badge-status ${u.verification_status}`}>
                                    {u.verification_status}
                                  </span>
                                </td>
                                <td style={{maxWidth: 200, fontSize:'0.82rem', color:'var(--text-secondary)'}}>
                                  {u.rejection_reason || <span className="text-muted">—</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    allVendors.length === 0 ? (
                      <div className="empty-panel">
                        <p>No vendor database records found.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Company</th>
                              <th>Code</th>
                              <th>Category</th>
                              <th>Email</th>
                              <th>Verification Status</th>
                              <th>Rejection Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allVendors.map(v => (
                              <tr key={v.id}>
                                <td><strong>{v.name}</strong></td>
                                <td><code>{v.vendor_code}</code></td>
                                <td>{v.category || 'General'}</td>
                                <td>{v.email}</td>
                                <td>
                                  <span className={`badge-status ${v.verification_status}`}>
                                    {v.verification_status}
                                  </span>
                                </td>
                                <td style={{maxWidth: 200, fontSize:'0.82rem', color:'var(--text-secondary)'}}>
                                  {v.rejection_reason || <span className="text-muted">—</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Rejection Modal Overlay */}
      {actionTarget && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <h3 className="modal-title">Reject Signup Application</h3>
            <p className="modal-subtitle">
              Provide a clear reason why <strong>{actionTarget.item.name}</strong> is being rejected. 
              The applicant will see this explanation on their next login attempt.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label className="modal-label">Rejection Reason</label>
                <textarea
                  className="modal-textarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Invalid GST registration details, incorrect department assigned, or unauthorized domain..."
                  required
                  rows={4}
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => { setActionTarget(null); setRejectReason(''); }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit-reject"
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
