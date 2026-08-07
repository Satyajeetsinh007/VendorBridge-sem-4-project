import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import RFQReviewPage from './RFQReviewPage';
import ApprovalHistory from './ApprovalHistory';
import ManagerProfile from './ManagerProfile';

/* ── SVG Icons ── */
const Icons = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
  ),
  Inbox: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
  ),
  CheckCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
  ),
  Database: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
  ),
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
  History: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="16" y2="14"/></svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )
};

export default function ManagerDashboard({ onLogout, currentUser }) {
  const [rfqs, setRfqs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [approvals, setApprovals] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation / Views: 'dashboard', 'pending', 'history', 'notifications', 'profile', 'review'
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedRfqForReview, setSelectedRfqForReview] = useState(null);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  const [managerUser, setManagerUser] = useState(currentUser || null);

  useEffect(() => {
    if (currentUser) {
      setManagerUser(currentUser);
    }
  }, [currentUser]);

  const mockNotifications = [
    { id: 1, text: 'New RFQ awaiting approval: RFQ-2026-9041', time: '10m ago', priority: 'high' },
    { id: 2, text: 'High priority RFQ submitted for Logistics department', time: '45m ago', priority: 'high' },
    { id: 3, text: 'Officer Alex Mercer resubmitted a rejected RFQ proposal', time: '2h ago', priority: 'medium' },
    { id: 4, text: 'Approval cycle completed for Engineering switches', time: '5h ago', priority: 'low' }
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let [deptsData, usersData, rfqsData, approvalsData] = await Promise.all([
        api.getDepartments().catch(() => []),
        api.getUsers().catch(() => []),
        api.getRFQs().catch(() => []),
        api.getApprovals().catch(() => []),
      ]);

      if (deptsData.length === 0 || usersData.length === 0) {
        await api.seedData().catch(() => {});
        deptsData = await api.getDepartments().catch(() => []);
        usersData = await api.getUsers().catch(() => []);
      }

      setDepartments(deptsData);
      setUsers(usersData);
      
      // Fallback if currentUser is somehow missing
      if (!managerUser) {
        const mgr = usersData.find(u => u.role === 'manager');
        setManagerUser(mgr);
      }

      // Create enriched approvals mapping (resolving RFQ and User info)
      const enrichedApprovals = approvalsData.map(app => {
        const matchingRfq = rfqsData.find(r => r.id === app.reference_id);
        const officerName = usersData.find(u => u.id === matchingRfq?.created_by)?.name;
        const deptCode = deptsData.find(d => d.id === matchingRfq?.department)?.code;

        return {
          ...app,
          rfq_details: matchingRfq ? {
            ...matchingRfq,
            created_by_name: officerName,
            department_code: deptCode,
            department_details: deptsData.find(d => d.id === matchingRfq.department)
          } : null
        };
      });

      setApprovals(enrichedApprovals);

      // Enrich RFQs
      const enrichedRfqs = rfqsData.map(rfq => ({
        ...rfq,
        department_details: deptsData.find(d => d.id === rfq.department),
        created_by_details: usersData.find(u => u.id === rfq.created_by)
      }));
      setRfqs(enrichedRfqs);

    } catch (err) {
      setError(err.message || 'Failed to fetch manager data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView, selectedRfqForReview]);

  const handleDecision = async (rfqId, status, remarks) => {
    // 1. Update RFQ Status and remarks in backend
    const updatedStatus = status === 'approved' ? 'open' : 'rejected';
    await api.patchRFQ(rfqId, {
      status: updatedStatus,
      manager_remarks: remarks
    });

    // 2. Log entry in Approvals table
    await api.createApproval({
      approval_type: 'rfq',
      reference_id: rfqId,
      reference_type: 'rfq',
      approver: managerUser?.id || users.find(u => u.role === 'manager')?.id || users[0]?.id,
      status: status,
      remarks: remarks
    });

    // 3. Refresh and return
    setSelectedRfqForReview(null);
    setCurrentView('dashboard');
    await fetchData();
  };

  const handleSeedClick = async () => {
    setLoading(true);
    try {
      await api.seedData();
      await fetchData();
    } catch (err) {
      alert(`Seed failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Metrics
  const pendingRfqs = rfqs.filter(r => r.status === 'pending_approval');
  const totalReviewed = approvals.length;
  const approvedToday = approvals.filter(a => a.status === 'approved').length;
  const rejectedToday = approvals.filter(a => a.status === 'rejected').length;

  const filteredPending = pendingRfqs.filter(r => 
    !searchQuery || r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.rfq_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openReviewPage = (rfq) => {
    setSelectedRfqForReview(rfq);
    setCurrentView('review');
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'badge badge-priority-high';
      case 'medium': return 'badge badge-priority-medium';
      case 'low': return 'badge badge-priority-low';
      default: return 'badge';
    }
  };

  const sidebarLinks = [
    { icon: <Icons.Home />, label: 'Dashboard', view: 'dashboard' },
    { icon: <Icons.Clock />, label: 'Pending RFQ Approvals', view: 'pending', count: pendingRfqs.length },
    { icon: <Icons.History />, label: 'Approval History', view: 'history' },
    { icon: <Icons.Bell />, label: 'Notifications', view: 'notifications' },
    { icon: <Icons.User />, label: 'Profile', view: 'profile' },
  ];

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
          <div className="brand-logo" style={{ display: 'none' }}>VB</div>
          <div className="brand-text">
            <span className="brand-name">VendorBridge</span>
            <span className="brand-sub">Management Console</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Manager Controls</span>
          {sidebarLinks.map((link) => (
            <a 
              key={link.label} 
              href="#" 
              className={`nav-link ${currentView === link.view ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setCurrentView(link.view); }}
            >
              {link.icon}
              <span>{link.label}</span>
              {link.count > 0 && <span className="pill-count" style={{ marginLeft: 'auto', background: 'var(--accent)' }}>{link.count}</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="seed-btn" onClick={handleSeedClick}>
            <Icons.Database /> Sync Core Data
          </button>

          {/* Usage limit bar matching between.indevs.in */}
          <div className="sidebar-usage">
            <div className="usage-label">Pending: {pendingRfqs.length} / 50</div>
            <div className="usage-progress-bar">
              <div className="usage-progress-fill" style={{ width: `${Math.min((pendingRfqs.length / 50) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Profile widget matching between.indevs.in */}
          <div className="sidebar-profile">
            <div className="profile-avatar" style={{ background: '#111827' }}>
              {(managerUser?.name || 'J')[0]}
            </div>
            <div className="profile-meta">
              <span className="profile-name">{managerUser?.name || 'Jane Doe'}</span>
              <span className="profile-email">{managerUser?.email || 'manager@vendorbridge.com'}</span>
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

      {/* ── Main Panel ── */}
      <div className="main-area">
        {/* Header */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {currentView === 'dashboard' && 'Manager Overview'}
              {currentView === 'pending' && 'Awaiting Reviews'}
              {currentView === 'history' && 'Audit Log & History'}
              {currentView === 'notifications' && 'Operational Notifications'}
              {currentView === 'profile' && 'Manager Profile'}
              {currentView === 'review' && 'Detailed Review Portal'}
            </h1>
            <span className="breadcrumb">System &nbsp;/&nbsp; Manager Space</span>
          </div>
          
          <div className="topbar-right">
            <button className="icon-btn" title="Notifications">
              <Icons.Bell />
              <span className="notif-dot" style={{ display: pendingRfqs.length > 0 ? 'block' : 'none' }} />
            </button>
          </div>
        </header>

        {/* Content Router */}
        <main key={selectedRfqForReview ? `review-${selectedRfqForReview.id}` : currentView} className="content">
          {loading && (
            <div className="state-banner info">
              <div className="spinner" /> Loading ERP core data…
            </div>
          )}

          {error && (
            <div className="state-banner error">
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:'middle'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>{error}</span>
              <button className="btn-ghost" onClick={fetchData}>Refresh</button>
            </div>
          )}

          {!loading && (
            <>
              {/* VIEW: Dashboard */}
              {currentView === 'dashboard' && (
                <div>
                  {/* Summary Cards */}
                  <section className="stats-row">
                    <div className="stat-card stat-amber">
                      <div className="stat-header">
                        <span className="stat-label">Pending RFQs</span>
                        <div className="stat-icon-wrap"><Icons.Clock /></div>
                      </div>
                      <div className="stat-value">{pendingRfqs.length}</div>
                      <span className="stat-sub">Requiring review</span>
                    </div>

                    <div className="stat-card stat-green">
                      <div className="stat-header">
                        <span className="stat-label">Approved Today</span>
                        <div className="stat-icon-wrap"><Icons.CheckCircle /></div>
                      </div>
                      <div className="stat-value">{approvedToday}</div>
                      <span className="stat-sub">Released to market</span>
                    </div>

                    <div className="stat-card stat-zinc">
                      <div className="stat-header">
                        <span className="stat-label">Rejected Today</span>
                        <div className="stat-icon-wrap"><Icons.Inbox /></div>
                      </div>
                      <div className="stat-value">{rejectedToday}</div>
                      <span className="stat-sub">Returned for rewrite</span>
                    </div>

                    <div className="stat-card stat-blue">
                      <div className="stat-header">
                        <span className="stat-label">Total Reviewed</span>
                        <div className="stat-icon-wrap"><Icons.FileText /></div>
                      </div>
                      <div className="stat-value">{totalReviewed}</div>
                      <span className="stat-sub">Historical evaluations</span>
                    </div>
                  </section>

                  {/* Split Panel */}
                  <div className="dashboard-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    {/* Left: Pending Table */}
                    <div className="table-card">
                      <div className="table-header-bar">
                        <span className="table-title">Pending RFQ Approvals</span>
                        <span className="table-count">{pendingRfqs.length} awaiting review</span>
                      </div>
                      <div className="table-scroll">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>RFQ #</th>
                              <th>Title</th>
                              <th>Dept</th>
                              <th>Officer</th>
                              <th>Priority</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingRfqs.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="empty-state">
                                  <p>All clear! There are no RFQs pending your approval.</p>
                                </td>
                              </tr>
                            ) : (
                              pendingRfqs.map(rfq => (
                                <tr key={rfq.id}>
                                  <td><span className="mono-text">{rfq.rfq_number}</span></td>
                                  <td>
                                    <span className="cell-primary">{rfq.title}</span>
                                    <span className="cell-sub">{new Date(rfq.created_at).toLocaleDateString()}</span>
                                  </td>
                                  <td><span className="dept-chip">{rfq.department_details?.code || 'ENG'}</span></td>
                                  <td><span className="cell-sub">{rfq.created_by_details?.name || 'Alex Mercer'}</span></td>
                                  <td><span className={getPriorityBadgeClass(rfq.priority)}>{rfq.priority}</span></td>
                                  <td>
                                    <button className="btn-primary" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => openReviewPage(rfq)}>
                                      Review
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Notifications & Recent Decisions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Notifications */}
                      <div className="table-card">
                        <div className="table-header-bar">
                          <span className="table-title">Notifications Hub</span>
                        </div>
                        <div className="notifications-list" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {mockNotifications.map(n => (
                            <div key={n.id} className={`notification-item ${n.priority}`} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
                              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{n.text}</p>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Decisions */}
                      <div className="table-card">
                        <div className="table-header-bar">
                          <span className="table-title">Recent Decisions</span>
                        </div>
                        <div className="table-scroll">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>RFQ</th>
                                <th>Dept</th>
                                <th>Decision</th>
                              </tr>
                            </thead>
                            <tbody>
                              {approvals.slice(0, 4).length === 0 ? (
                                <tr>
                                  <td colSpan="3" className="empty-state" style={{ padding: '20px 10px' }}>
                                    No decisions recorded yet.
                                  </td>
                                </tr>
                              ) : (
                                approvals.slice(0, 4).map(app => (
                                  <tr key={app.id}>
                                    <td><span className="mono-text" style={{ fontSize: '11px' }}>{app.rfq_details?.rfq_number || 'RFQ'}</span></td>
                                    <td><span className="dept-chip" style={{ fontSize: '10px', padding: '2px 6px' }}>{app.rfq_details?.department_code || 'ENG'}</span></td>
                                    <td>
                                      <span className={`badge ${app.status === 'approved' ? 'badge-status-open' : 'badge-status-rejected'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                        {app.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: Pending Page */}
              {currentView === 'pending' && (
                <div className="table-card">
                  <div className="table-header-bar">
                    <span className="table-title">Awaiting Approval Review</span>
                    <span className="table-count">{pendingRfqs.length} pending total</span>
                  </div>

                  <div className="toolbar" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 0 }}>
                    <div className="search-input" style={{ width: '100%', maxWidth: '340px' }}>
                      <Icons.Search />
                      <input 
                        type="text" 
                        placeholder="Search pending RFQs..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>RFQ Number</th>
                          <th>Title</th>
                          <th>Department</th>
                          <th>Procurement Officer</th>
                          <th>Priority</th>
                          <th>Created Date</th>
                          <th>Status</th>
                          <th className="th-actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPending.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="empty-state">
                              <p>No matching pending RFQs found.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredPending.map(rfq => (
                            <tr key={rfq.id}>
                              <td><span className="mono-text">{rfq.rfq_number}</span></td>
                              <td>
                                <span className="cell-primary">{rfq.title}</span>
                                <span className="cell-sub cell-desc">{rfq.description}</span>
                              </td>
                              <td><span className="dept-chip">{rfq.department_details?.code || 'ENG'}</span></td>
                              <td><span className="cell-sub">{rfq.created_by_details?.name || 'Alex Mercer'}</span></td>
                              <td><span className={getPriorityBadgeClass(rfq.priority)}>{rfq.priority}</span></td>
                              <td className="date-cell">{new Date(rfq.created_at).toLocaleDateString()}</td>
                              <td><span className="badge badge-status-pending_approval">Pending Approval</span></td>
                              <td className="actions-cell">
                                <button className="btn-primary" style={{ padding: '6px 14px' }} onClick={() => openReviewPage(rfq)}>
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW: History */}
              {currentView === 'history' && (
                <ApprovalHistory 
                  approvals={approvals}
                  departments={departments}
                  users={users}
                  onViewDetails={openReviewPage}
                />
              )}

              {/* VIEW: Notifications */}
              {currentView === 'notifications' && (
                <div className="table-card">
                  <div className="table-header-bar">
                    <span className="table-title">System & Flow Notifications</span>
                  </div>
                  <div className="notifications-list" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {mockNotifications.map(n => (
                      <div key={n.id} className={`notification-item ${n.priority}`} style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '13.5px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>{n.text}</p>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Posted: {n.time}</span>
                        </div>
                        <span className={`badge badge-priority-${n.priority}`} style={{ textTransform: 'uppercase' }}>
                          {n.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: Profile */}
              {currentView === 'profile' && (
                <ManagerProfile manager={managerUser} />
              )}

              {/* VIEW: Review Single RFQ */}
              {currentView === 'review' && selectedRfqForReview && (
                <RFQReviewPage 
                  rfq={selectedRfqForReview} 
                  onBack={() => { setSelectedRfqForReview(null); setCurrentView('dashboard'); }}
                  onDecision={handleDecision}
                  manager={managerUser}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
