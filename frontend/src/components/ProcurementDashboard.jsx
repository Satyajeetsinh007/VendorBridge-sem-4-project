import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './ProcurementDashboard.css';

/* ── SVG Icon Components ── */
const Icons = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
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
  ArrowUp: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  ),
  Send: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
  ),
  Database: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
  ),
  BarChart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
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
};

export default function ProcurementDashboard() {
  const [rfqs, setRfqs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', department: '', priority: 'medium',
    quantity: 100, deadline: '', required_by_date: '', specs_file_url: '',
    status: 'draft', created_by: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let [deptsData, usersData, rfqsData] = await Promise.all([
        api.getDepartments().catch(() => []),
        api.getUsers().catch(() => []),
        api.getRFQs().catch(() => []),
      ]);
      if (deptsData.length === 0 || usersData.length === 0) {
        await api.seedData().catch(() => {});
        deptsData = await api.getDepartments().catch(() => []);
        usersData = await api.getUsers().catch(() => []);
      }
      setDepartments(deptsData);
      setUsers(usersData);
      setRfqs(rfqsData);
      if (deptsData.length > 0 && !formData.department)
        setFormData(prev => ({ ...prev, department: deptsData[0].id }));
      if (usersData.length > 0 && !formData.created_by)
        setFormData(prev => ({ ...prev, created_by: usersData[0].id }));
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRFQ = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createRFQ(formData);
      setIsModalOpen(false);
      setFormData({
        title: '', description: '', department: departments[0]?.id || '',
        priority: 'medium', quantity: 100, deadline: '', required_by_date: '',
        specs_file_url: '', status: 'draft', created_by: users[0]?.id || '',
      });
      await fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (rfqId, newStatus) => {
    try {
      await api.updateRFQStatus(rfqId, newStatus);
      await fetchData();
    } catch (err) {
      alert(`Failed: ${err.message}`);
    }
  };

  const handleSeedClick = async () => {
    setLoading(true);
    try { await api.seedData(); await fetchData(); }
    catch (err) { alert(`Seed failed: ${err.message}`); setLoading(false); }
  };

  const filteredRfqs = rfqs.filter(rfq => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || rfq.title?.toLowerCase().includes(q) ||
      rfq.rfq_number?.toLowerCase().includes(q) || rfq.description?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || rfq.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalCount = rfqs.length;
  const draftCount = rfqs.filter(r => r.status === 'draft').length;
  const openCount = rfqs.filter(r => r.status === 'open').length;
  const pendingCount = rfqs.filter(r => r.status === 'pending_approval').length;

  const statusLabel = (s) => (s || '').replace(/_/g, ' ');

  const sidebarLinks = [
    { icon: <Icons.Home />, label: 'Dashboard', active: true },
    { icon: <Icons.FileText />, label: 'RFQ Management', active: false },
    { icon: <Icons.Inbox />, label: 'Quotations', active: false },
    { icon: <Icons.BarChart />, label: 'Analytics', active: false },
    { icon: <Icons.Settings />, label: 'Settings', active: false },
  ];

  const statusFilters = [
    { key: 'ALL', label: 'All' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'OPEN', label: 'Open' },
    { key: 'PENDING_APPROVAL', label: 'Pending' },
    { key: 'CLOSED', label: 'Closed' },
  ];

  return (
    <div className="layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">VB</div>
          <div className="brand-text">
            <span className="brand-name">VendorBridge</span>
            <span className="brand-sub">Procurement Suite</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Main Menu</span>
          {sidebarLinks.map((link) => (
            <a key={link.label} href="#" className={`nav-link ${link.active ? 'active' : ''}`}>
              {link.icon}
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="seed-btn" onClick={handleSeedClick}>
            <Icons.Database /> Seed Sample Data
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="main-area">
        {/* Header */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">RFQ Dashboard</h1>
            <span className="breadcrumb">Procurement &nbsp;/&nbsp; Requests for Quotation</span>
          </div>
          <div className="topbar-right">
            <button className="icon-btn" title="Notifications">
              <Icons.Bell />
              <span className="notif-dot" />
            </button>
            <div className="topbar-divider" />
            <div className="user-chip">
              <div className="user-avatar">{(users[0]?.name || 'A')[0]}</div>
              <div className="user-meta">
                <span className="user-name">{users[0]?.name || 'Alex Mercer'}</span>
                <span className="user-role">Procurement Officer</span>
              </div>
              <Icons.ChevronDown />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          {/* Stats Row */}
          <section className="stats-row">
            {[
              { label: 'Total RFQs', value: totalCount, icon: <Icons.FileText />, color: 'blue', sub: 'All requests' },
              { label: 'Drafts', value: draftCount, icon: <Icons.Inbox />, color: 'zinc', sub: 'In progress' },
              { label: 'Open', value: openCount, icon: <Icons.CheckCircle />, color: 'green', sub: 'Live for bids' },
              { label: 'Pending Approval', value: pendingCount, icon: <Icons.Clock />, color: 'amber', sub: 'Awaiting review' },
            ].map(stat => (
              <div key={stat.label} className={`stat-card stat-${stat.color}`}>
                <div className="stat-header">
                  <span className="stat-label">{stat.label}</span>
                  <div className="stat-icon-wrap">{stat.icon}</div>
                </div>
                <div className="stat-value">{stat.value}</div>
                <span className="stat-sub">{stat.sub}</span>
              </div>
            ))}
          </section>

          {/* Toolbar */}
          <section className="toolbar">
            <div className="toolbar-left">
              <div className="search-input">
                <Icons.Search />
                <input type="text" placeholder="Search by RFQ number, title…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="filter-pills">
                {statusFilters.map(f => (
                  <button key={f.key} className={`pill ${statusFilter === f.key ? 'pill-active' : ''}`} onClick={() => setStatusFilter(f.key)}>
                    {f.label}
                    {f.key !== 'ALL' && <span className="pill-count">{rfqs.filter(r => f.key === 'ALL' || r.status === f.key.toLowerCase()).length}</span>}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Icons.Plus /> New RFQ
            </button>
          </section>

          {/* Loading / Error */}
          {loading && (
            <div className="state-banner info">
              <div className="spinner" /> Connecting to backend…
            </div>
          )}
          {error && (
            <div className="state-banner error">
              <span>⚠ {error}</span>
              <button className="btn-ghost" onClick={fetchData}>Retry</button>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <section className="table-card">
              <div className="table-header-bar">
                <span className="table-title">All Requests</span>
                <span className="table-count">{filteredRfqs.length} {filteredRfqs.length === 1 ? 'result' : 'results'}</span>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>RFQ #</th>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Qty</th>
                      <th>Priority</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th className="th-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRfqs.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="empty-state">
                          <Icons.FileText />
                          <p>{rfqs.length === 0 ? 'No RFQs yet. Create your first request.' : 'No results match your filters.'}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRfqs.map(rfq => (
                        <tr key={rfq.id}>
                          <td>
                            <span className="mono-text">{rfq.rfq_number}</span>
                            <span className="cell-sub">{new Date(rfq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </td>
                          <td>
                            <span className="cell-primary">{rfq.title}</span>
                            <span className="cell-sub cell-desc">{rfq.description}</span>
                          </td>
                          <td><span className="dept-chip">{rfq.department_details?.code || '—'}</span></td>
                          <td className="num-cell">{rfq.quantity?.toLocaleString()}</td>
                          <td><span className={`badge badge-priority-${rfq.priority}`}>{rfq.priority}</span></td>
                          <td className="date-cell">{rfq.deadline || '—'}</td>
                          <td><span className={`badge badge-status-${rfq.status}`}>{statusLabel(rfq.status)}</span></td>
                          <td className="actions-cell">
                            {rfq.status === 'draft' && (
                              <button className="btn-action btn-publish" onClick={() => handleStatusUpdate(rfq.id, 'open')}>
                                <Icons.ArrowUp /> Publish
                              </button>
                            )}
                            {rfq.status === 'open' && (
                              <button className="btn-action btn-submit" onClick={() => handleStatusUpdate(rfq.id, 'pending_approval')}>
                                <Icons.Send /> Submit
                              </button>
                            )}
                            {rfq.status === 'pending_approval' && (
                              <span className="awaiting-text">Awaiting</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2 className="modal-title">Create New RFQ</h2>
                <p className="modal-subtitle">Fill in the details for a new Request for Quotation</p>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><Icons.X /></button>
            </div>

            <form onSubmit={handleCreateRFQ} className="modal-body">
              <div className="field full">
                <label>Title <span className="req">*</span></label>
                <input type="text" name="title" required placeholder="e.g. Procurement of Server Equipment" value={formData.title} onChange={handleInputChange} />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Department <span className="req">*</span></label>
                  <select name="department" value={formData.department} onChange={handleInputChange} required>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Quantity <span className="req">*</span></label>
                  <input type="number" name="quantity" min="1" required value={formData.quantity} onChange={handleInputChange} />
                </div>
                <div className="field">
                  <label>Submission Deadline <span className="req">*</span></label>
                  <input type="date" name="deadline" required value={formData.deadline} onChange={handleInputChange} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Required By Date</label>
                  <input type="date" name="required_by_date" value={formData.required_by_date} onChange={handleInputChange} />
                </div>
                <div className="field">
                  <label>Specs URL</label>
                  <input type="url" name="specs_file_url" placeholder="https://…" value={formData.specs_file_url} onChange={handleInputChange} />
                </div>
              </div>

              <div className="field full">
                <label>Description <span className="req">*</span></label>
                <textarea name="description" rows="4" required placeholder="Detailed technical requirements, warranty expectations…" value={formData.description} onChange={handleInputChange} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create RFQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
