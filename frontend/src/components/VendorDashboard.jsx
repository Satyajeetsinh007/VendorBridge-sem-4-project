import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import VendorRFQDetail from './VendorRFQDetail';
import VendorQuotations from './VendorQuotations';
import VendorHistory from './VendorHistory';
import VendorProfile from './VendorProfile';
import VendorPurchaseOrders from './VendorPurchaseOrders';
import '../components/ProcurementDashboard.css';

/* ── SVG Icons ── */
const Icons = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
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
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
  History: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="16" y2="14"/></svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
  ),
};

export default function VendorDashboard({ onLogout, currentUser }) {
  const [rfqs, setRfqs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentVendor, setCurrentVendor] = useState(null);

  const [notificationsList, setNotificationsList] = useState([
    { id: 1, text: 'New Purchase Order received (PO-2026-0042)', time: '10m ago', priority: 'high' },
    { id: 2, text: 'Purchase Order PO-2026-0039 acknowledged successfully', time: '1d ago', priority: 'low' },
    { id: 3, text: 'Purchase Order PO-2026-0031 rejected', time: '2d ago', priority: 'high' },
    { id: 4, text: 'Procurement Officer cancelled Purchase Order PO-2026-0028', time: '3d ago', priority: 'medium' },
    { id: 5, text: 'New RFQ invitation received — High-Performance Laptops', time: '4d ago', priority: 'medium' },
  ]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let [vendorsData, rfqsData, quotationsData] = await Promise.all([
        api.getVendors().catch(() => []),
        api.getRFQs().catch(() => []),
        api.getQuotations().catch(() => []),
      ]);

      if (vendorsData.length < 6) {
        await api.seedData().catch(() => {});
        vendorsData = await api.getVendors().catch(() => []);
        rfqsData = await api.getRFQs().catch(() => []);
      }

      setVendors(vendorsData);
      
      const loggedInVendor = currentUser 
        ? vendorsData.find(v => v.email.toLowerCase() === currentUser.email.toLowerCase() || v.id === currentUser.id)
        : null;

      setCurrentVendor(loggedInVendor || vendorsData[0] || null);
      setRfqs(rfqsData);

      setQuotations(quotationsData);
    } catch (err) {
      setError(err.message || 'Failed to load vendor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSeedClick = async () => {
    setLoading(true);
    try { await api.seedData(); await fetchData(); }
    catch (err) { alert(`Seed failed: ${err.message}`); setLoading(false); }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isPastDeadline = (d) => d && d < todayStr;

  const vendorQuotations = quotations.filter(q => q.vendor === currentVendor?.id);
  const quotedRfqIds = new Set(vendorQuotations.map(q => q.rfq));

  // Open RFQs tab: available for bidding (excluding closed, past-deadline, or already quoted RFQs)
  const openRfqs = rfqs.filter(r => 
    (r.status === 'open' || r.status === 'under_review') && 
    !isPastDeadline(r.deadline) && 
    r.status !== 'closed' &&
    !quotedRfqIds.has(r.id)
  );

  // Dashboard table: show ALL relevant RFQs for this vendor (Open, Quoted, Closed, Completed)
  const allDashboardRfqs = rfqs.filter(r => 
    r.status === 'open' || r.status === 'under_review' || r.status === 'closed' || r.status === 'completed' || quotedRfqIds.has(r.id)
  );

  const submittedCount = vendorQuotations.filter(q => q.status === 'submitted').length;
  const selectedCount = vendorQuotations.filter(q => q.status === 'selected').length;
  const rejectedCount = vendorQuotations.filter(q => q.status === 'rejected').length;

  const filteredOpenRfqs = openRfqs.filter(r =>
    !searchQuery || r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.rfq_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openRfqDetail = (rfq) => {
    setSelectedRfq(rfq);
    setCurrentView('rfq-detail');
  };

  const handleQuotationSubmitted = async () => {
    setSelectedRfq(null);
    setCurrentView('quotations');
    await fetchData();
  };

  const handleEditQuotation = (quotation) => {
    const rfq = rfqs.find(r => r.id === quotation.rfq);
    if (rfq) {
      setSelectedRfq(rfq);
      setCurrentView('rfq-detail');
    }
  };

  const getExistingQuotation = (rfqId) => {
    return vendorQuotations.find(q => q.rfq === rfqId);
  };

  const sidebarLinks = [
    { icon: <Icons.Home />, label: 'Dashboard', view: 'dashboard' },
    { icon: <Icons.FileText />, label: 'Open RFQs', view: 'open-rfqs', count: openRfqs.length },
    { icon: <Icons.Send />, label: 'My Quotations', view: 'quotations' },
    { icon: <Icons.FileText />, label: 'Purchase Orders', view: 'purchase-orders' },
    { icon: <Icons.History />, label: 'Quotation History', view: 'history' },
    { icon: <Icons.Bell />, label: 'Notifications', view: 'notifications' },
    { icon: <Icons.User />, label: 'Profile', view: 'profile' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>VB</div>
          <div className="brand-text">
            <span className="brand-name">VendorBridge</span>
            <span className="brand-sub">Vendor Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Vendor Menu</span>
          {sidebarLinks.map(link => (
            <a key={link.label} href="#" className={`nav-link ${currentView === link.view ? 'active' : ''}`}
              onClick={e => { e.preventDefault(); setCurrentView(link.view); setSelectedRfq(null); }}>
              {link.icon}
              <span>{link.label}</span>
              {link.count > 0 && <span className="pill-count" style={{ marginLeft: 'auto', background: 'var(--accent)' }}>{link.count}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="seed-btn" onClick={handleSeedClick}>
            <Icons.Database /> Sync Data
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {currentView === 'dashboard' && 'Vendor Dashboard'}
              {currentView === 'open-rfqs' && 'Open RFQ Invitations'}
              {currentView === 'quotations' && 'My Quotations'}
              {currentView === 'history' && 'Quotation History'}
              {currentView === 'notifications' && 'Notifications'}
              {currentView === 'profile' && 'Company Profile'}
              {currentView === 'rfq-detail' && 'RFQ Details & Quotation'}
            </h1>
            <span className="breadcrumb">Vendor &nbsp;/&nbsp; {currentVendor?.name || 'Dell Technologies'}</span>
          </div>

          <div className="topbar-right">
            {/* Vendor Switcher Dropdown */}
            {vendors.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Vendor:</span>
                <select
                  value={currentVendor?.id || ''}
                  onChange={e => {
                    const found = vendors.find(v => v.id === e.target.value);
                    if (found) setCurrentVendor(found);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id} style={{ background: '#1e293b', color: '#fff' }}>
                      {v.name} ({v.category || 'Vendor'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sign Out Button */}
            <button className="btn-secondary" onClick={onLogout} style={{ color: 'var(--text-secondary)' }}>
              Sign Out
            </button>

            <div className="topbar-divider" />
            <div className="user-chip">
              <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
                {(currentVendor?.name || 'D')[0]}
              </div>
              <div className="user-meta">
                <span className="user-name">{currentVendor?.name || 'Dell Technologies'}</span>
                <span className="user-role">{currentVendor?.vendor_code || 'VND-DELL'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          {loading && (
            <div className="state-banner info"><div className="spinner" /> Loading vendor data…</div>
          )}
          {error && (
            <div className="state-banner error">
              <span>⚠ {error}</span>
              <button className="btn-ghost" onClick={fetchData}>Retry</button>
            </div>
          )}

          {!loading && (
            <>
              {/* Dashboard */}
              {currentView === 'dashboard' && (
                <div>
                  {/* Vendor Switcher Bar */}
                  {vendors.length > 0 && (
                    <div className="vendor-switcher" style={{ marginBottom: '20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center', padding: '0 8px' }}>
                        Active Vendor:
                      </span>
                      {vendors.map(v => (
                        <button
                          key={v.id}
                          className={`vendor-switch-btn ${v.id === currentVendor?.id ? 'active' : ''}`}
                          onClick={() => setCurrentVendor(v)}
                        >
                          <div className="vsw-logo" style={{ background: v.vendor_code === 'VND-DELL' ? '#0076CE' : v.vendor_code === 'VND-HP' ? '#0096D6' : v.vendor_code === 'VND-LNV' ? '#E2231A' : v.vendor_code === 'VND-GDJ' ? '#7C3AED' : v.vendor_code === 'VND-DRN' ? '#D97706' : '#10B981' }}>
                            {v.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{v.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <section className="stats-row">
                    <div className="stat-card stat-blue">
                      <div className="stat-header">
                        <span className="stat-label">Open RFQs</span>
                        <div className="stat-icon-wrap"><Icons.FileText /></div>
                      </div>
                      <div className="stat-value">{openRfqs.length}</div>
                      <span className="stat-sub">Available for bidding</span>
                    </div>
                    <div className="stat-card stat-amber">
                      <div className="stat-header">
                        <span className="stat-label">Submitted</span>
                        <div className="stat-icon-wrap"><Icons.Send /></div>
                      </div>
                      <div className="stat-value">{submittedCount}</div>
                      <span className="stat-sub">Under review</span>
                    </div>
                    <div className="stat-card stat-green">
                      <div className="stat-header">
                        <span className="stat-label">Selected</span>
                        <div className="stat-icon-wrap"><Icons.CheckCircle /></div>
                      </div>
                      <div className="stat-value">{selectedCount}</div>
                      <span className="stat-sub">Won bids</span>
                    </div>
                    <div className="stat-card stat-zinc">
                      <div className="stat-header">
                        <span className="stat-label">Rejected</span>
                        <div className="stat-icon-wrap"><Icons.Inbox /></div>
                      </div>
                      <div className="stat-value">{rejectedCount}</div>
                      <span className="stat-sub">Not selected</span>
                    </div>
                  </section>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    {/* Recent RFQ Invitations */}
                    <div className="table-card">
                      <div className="table-header-bar">
                        <span className="table-title">Recent RFQ Invitations</span>
                        <span className="table-count">{allDashboardRfqs.length} total</span>
                      </div>
                      <div className="table-scroll">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>RFQ #</th>
                              <th>Title</th>
                              <th>Deadline</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allDashboardRfqs.slice(0, 6).length === 0 ? (
                              <tr><td colSpan="5" className="empty-state"><p>No RFQs available yet.</p></td></tr>
                            ) : (
                              allDashboardRfqs.slice(0, 6).map(rfq => {
                                const isClosed = rfq.status === 'closed' || isPastDeadline(rfq.deadline);
                                const isQuoted = quotedRfqIds.has(rfq.id);
                                return (
                                  <tr key={rfq.id}>
                                    <td><span className="mono-text">{rfq.rfq_number}</span></td>
                                    <td><span className="cell-primary">{rfq.title}</span></td>
                                    <td className="date-cell">{rfq.deadline}</td>
                                    <td>
                                      {isClosed ? (
                                        <span className="badge badge-status-closed">Closed</span>
                                      ) : rfq.status === 'completed' ? (
                                        <span className="badge badge-status-completed">Completed</span>
                                      ) : isQuoted ? (
                                        <span className="badge badge-status-pending_approval">Quoted</span>
                                      ) : (
                                        <span className="badge badge-status-open">Open</span>
                                      )}
                                    </td>
                                    <td>
                                      <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => openRfqDetail(rfq)}>
                                        View
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="table-card">
                      <div className="table-header-bar">
                        <span className="table-title">Recent Notifications</span>
                      </div>
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {notificationsList.slice(0, 4).map(n => (
                          <div key={n.id} className={`notification-item ${n.priority}`} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>{n.text}</p>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Open RFQs */}
              {currentView === 'open-rfqs' && (
                <div>
                  <section className="toolbar" style={{ marginBottom: '20px' }}>
                    <div className="search-input" style={{ maxWidth: '340px' }}>
                      <Icons.Search />
                      <input type="text" placeholder="Search RFQs…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                  </section>

                  <section className="table-card">
                    <div className="table-header-bar">
                      <span className="table-title">Open RFQs Available for Quotation</span>
                      <span className="table-count">{filteredOpenRfqs.length} results</span>
                    </div>
                    <div className="table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>RFQ #</th>
                            <th>Title</th>
                            <th>Department</th>
                            <th>Deadline</th>
                            <th>Priority</th>
                            <th className="th-actions">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOpenRfqs.length === 0 ? (
                            <tr><td colSpan="6" className="empty-state"><p>No open RFQs match your search.</p></td></tr>
                          ) : (
                            filteredOpenRfqs.map(rfq => (
                              <tr key={rfq.id} style={{ cursor: 'pointer' }} onClick={() => openRfqDetail(rfq)}>
                                <td><span className="mono-text">{rfq.rfq_number}</span></td>
                                <td>
                                  <span className="cell-primary">{rfq.title}</span>
                                  <span className="cell-sub cell-desc">{rfq.description}</span>
                                </td>
                                <td><span className="dept-chip">{rfq.department_details?.code || '—'}</span></td>
                                <td className="date-cell">{rfq.deadline}</td>
                                <td><span className={`badge badge-priority-${rfq.priority}`}>{rfq.priority}</span></td>
                                <td className="actions-cell">
                                  <button className="btn-primary" style={{ padding: '5px 14px' }} onClick={(e) => { e.stopPropagation(); openRfqDetail(rfq); }}>
                                    View & Quote
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {/* My Quotations */}
              {currentView === 'quotations' && (
                <VendorQuotations
                  quotations={vendorQuotations}
                  onEditQuotation={handleEditQuotation}
                  onViewRFQ={openRfqDetail}
                />
              )}

              {/* Purchase Orders View for Vendor */}
              {currentView === 'purchase-orders' && (
                <VendorPurchaseOrders
                  vendor={currentVendor}
                  rfqs={rfqs}
                  quotations={quotations}
                  onNotify={msg => setNotificationsList(prev => [
                    { id: Date.now(), text: msg, time: 'Just now', priority: 'high' },
                    ...prev
                  ])}
                />
              )}

              {/* Quotation History */}
              {currentView === 'history' && (
                <VendorHistory quotations={vendorQuotations} />
              )}

              {/* Notifications */}
              {currentView === 'notifications' && (
                <div className="table-card">
                  <div className="table-header-bar">
                    <span className="table-title">All Notifications</span>
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {notificationsList.map(n => (
                      <div key={n.id} className={`notification-item ${n.priority}`} style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>{n.text}</p>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.time}</span>
                        </div>
                        <span className={`badge badge-priority-${n.priority}`} style={{ textTransform: 'uppercase' }}>{n.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile */}
              {currentView === 'profile' && (
                <VendorProfile
                  vendor={currentVendor}
                  vendors={vendors}
                  onVendorSwitch={(v) => setCurrentVendor(v)}
                />
              )}

              {/* RFQ Detail + Quotation Form */}
              {currentView === 'rfq-detail' && selectedRfq && (
                <VendorRFQDetail
                  rfq={selectedRfq}
                  vendor={currentVendor}
                  existingQuotation={getExistingQuotation(selectedRfq.id)}
                  onBack={() => { setSelectedRfq(null); setCurrentView('open-rfqs'); }}
                  onSubmitted={handleQuotationSubmitted}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
