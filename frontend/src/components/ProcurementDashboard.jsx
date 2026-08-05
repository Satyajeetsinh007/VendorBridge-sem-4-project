import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import QuotationComparison from './QuotationComparison';
import PurchaseOrderDetail from './PurchaseOrderDetail';
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

export default function ProcurementDashboard({ onLogout, currentUser, onToggleRole }) {
  const [rfqs, setRfqs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState('ALL'); // 'ALL' | 'MY'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', department: '', priority: 'medium',
    quantity: 100, deadline: '', required_by_date: '', specs_file_url: '',
    status: 'draft', created_by: currentUser?.id || '',
  });

  // Detail/Edit modal state
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [editData, setEditData] = useState(null);

  // Purchase Order state
  const [activePOInfo, setActivePOInfo] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // Quotation Comparison state
  const [comparisonRfq, setComparisonRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let [deptsData, usersData, rfqsData, quotationsData, vendorsData, posData] = await Promise.all([
        api.getDepartments().catch(() => []),
        api.getUsers().catch(() => []),
        api.getRFQs().catch(() => []),
        api.getQuotations().catch(() => []),
        api.getVendors().catch(() => []),
        api.getPurchaseOrders().catch(() => []),
      ]);
      if (deptsData.length === 0 || usersData.length === 0) {
        await api.seedData().catch(() => {});
        deptsData = await api.getDepartments().catch(() => []);
        usersData = await api.getUsers().catch(() => []);
      }
      setDepartments(deptsData);
      setUsers(usersData);
      setRfqs(rfqsData);
      setQuotations(quotationsData);
      setVendors(vendorsData);
      setPurchaseOrders(posData);

      // Auto-set department to officer's department
      const userInDb = usersData.find(u => u.id === currentUser?.id || u.email === currentUser?.email);
      const officerDept = currentUser?.department || userInDb?.department;
      const matchedDept = deptsData.find(d => d.id === officerDept || d.code === officerDept || d.name?.toLowerCase() === currentUser?.department_name?.toLowerCase());

      if (deptsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          department: matchedDept ? matchedDept.id : deptsData[0].id,
          created_by: currentUser?.id || userInDb?.id || usersData[0]?.id || '',
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Helper to get officer's department ID
  const getOfficerDepartmentId = () => {
    if (!currentUser && departments.length > 0) return departments[0].id;
    if (currentUser?.department) {
      const deptId = typeof currentUser.department === 'object' ? currentUser.department.id : currentUser.department;
      const found = departments.find(d => d.id === deptId || d.code === deptId);
      if (found) return found.id;
    }
    if (currentUser?.department_name) {
      const found = departments.find(d => d.name?.toLowerCase() === currentUser.department_name?.toLowerCase() || d.code?.toLowerCase() === currentUser.department_name?.toLowerCase());
      if (found) return found.id;
    }
    const userInDb = users.find(u => u.id === currentUser?.id || u.email === currentUser?.email);
    if (userInDb?.department) {
      const found = departments.find(d => d.id === userInDb.department || d.code === userInDb.department);
      if (found) return found.id;
    }
    return departments[0]?.id || '';
  };

  const handleOpenCreateModal = () => {
    const officerDeptId = getOfficerDepartmentId();
    setFormData(prev => ({
      ...prev,
      department: officerDeptId || departments[0]?.id || '',
      created_by: currentUser?.id || users[0]?.id || '',
    }));
    setIsModalOpen(true);
  };

  // Helper to check if logged-in user created the RFQ
  const isOwnRfq = (rfq) => {
    if (!currentUser) return true;
    const creatorId = typeof rfq.created_by === 'object' ? rfq.created_by?.id : rfq.created_by;
    if (creatorId && creatorId === currentUser.id) return true;
    if (rfq.created_by_details && (rfq.created_by_details.id === currentUser.id || rfq.created_by_details.email === currentUser.email)) return true;
    if (rfq.created_by_name && currentUser.name && rfq.created_by_name.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  };

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
      const officerDeptId = getOfficerDepartmentId();
      setFormData({
        title: '', description: '', department: officerDeptId || departments[0]?.id || '',
        priority: 'medium', quantity: 100, deadline: '', required_by_date: '',
        specs_file_url: '', status: 'draft', created_by: currentUser?.id || users[0]?.id || '',
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

  const handleDeleteRFQ = async (rfqId) => {
    if (!window.confirm('Are you sure you want to delete this draft RFQ?')) return;
    try {
      await api.deleteRFQ(rfqId);
      await fetchData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSeedClick = async () => {
    setLoading(true);
    try { await api.seedData(); await fetchData(); }
    catch (err) { alert(`Seed failed: ${err.message}`); setLoading(false); }
  };

  // Open detail/edit modal
  const openRfqDetail = (rfq) => {
    setSelectedRfq(rfq);
    const isOwn = isOwnRfq(rfq);
    const canEdit = isOwn && (rfq.status === 'draft' || rfq.status === 'rejected');
    if (canEdit) {
      setEditData({
        title: rfq.title || '',
        description: rfq.description || '',
        department: rfq.department || '',
        priority: rfq.priority || 'medium',
        quantity: rfq.quantity || 100,
        deadline: rfq.deadline || '',
        required_by_date: rfq.required_by_date || '',
        specs_file_url: rfq.specs_file_url || '',
      });
    } else {
      setEditData(null);
    }
  };

  const closeRfqDetail = () => {
    setSelectedRfq(null);
    setEditData(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patchRFQ(selectedRfq.id, editData);
      closeRfqDetail();
      await fetchData();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAndResubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patchRFQ(selectedRfq.id, { ...editData, status: 'pending_approval' });
      closeRfqDetail();
      await fetchData();
    } catch (err) {
      alert(`Resubmit failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering by search, status, and ownership (All RFQs vs My RFQs)
  const filteredRfqs = rfqs.filter(rfq => {
    const q = searchQuery.toLowerCase();
    const creatorName = rfq.created_by_details?.name || rfq.created_by_name || '';
    const deptName = rfq.department_details?.name || rfq.department_details?.code || '';
    
    const matchesSearch = !q ||
      rfq.title?.toLowerCase().includes(q) ||
      rfq.rfq_number?.toLowerCase().includes(q) ||
      rfq.description?.toLowerCase().includes(q) ||
      deptName.toLowerCase().includes(q) ||
      creatorName.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || rfq.status === statusFilter.toLowerCase();
    const matchesOwnership = ownershipFilter === 'ALL' || (ownershipFilter === 'MY' && isOwnRfq(rfq));

    return matchesSearch && matchesStatus && matchesOwnership;
  });

  // Updated Dashboard Metrics
  const myRfqsCount = rfqs.filter(r => isOwnRfq(r)).length;
  const companyRfqsCount = rfqs.length;
  const pendingCount = rfqs.filter(r => r.status === 'pending_approval').length;
  const openCount = rfqs.filter(r => r.status === 'open' || r.status === 'under_review').length;
  const draftCount = rfqs.filter(r => r.status === 'draft').length;

  // RFQs that have at least one submitted quotation
  const rfqIdsWithQuotations = new Set(
    quotations.filter(q => q.status !== 'draft').map(q => q.rfq)
  );
  const rfqsWithQuotations = rfqs.filter(r => rfqIdsWithQuotations.has(r.id));
  const hasQuotations = (rfqId) => rfqIdsWithQuotations.has(rfqId);

  const statusLabel = (s) => (s || '').replace(/_/g, ' ');

  const sidebarLinks = [
    { icon: <Icons.Home />, label: 'Dashboard', view: 'dashboard' },
    { icon: <Icons.FileText />, label: 'RFQ Management', view: 'rfq-management' },
    { icon: <Icons.Inbox />, label: 'Quotations', view: 'quotations', count: rfqsWithQuotations.length },
    { icon: <Icons.FileText />, label: 'Purchase Orders', view: 'purchase-orders', count: purchaseOrders.length },
    { icon: <Icons.BarChart />, label: 'Analytics', view: 'analytics' },
    { icon: <Icons.Settings />, label: 'Settings', view: 'settings' },
  ];

  const statusFilters = [
    { key: 'ALL', label: 'All' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'OPEN', label: 'Open' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'COMPLETED', label: 'Completed' },
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
          {sidebarLinks.map(link => (
            <a
              key={link.label}
              href="#"
              className={`nav-link ${currentView === link.view && !comparisonRfq && !activePOInfo ? 'active' : ''}`}
              onClick={e => {
                e.preventDefault();
                setComparisonRfq(null);
                setActivePOInfo(null);
                setCurrentView(link.view);
              }}
            >
              {link.icon}
              <span>{link.label}</span>
              {link.count !== undefined && link.count > 0 && (
                <span className="pill-count" style={{ marginLeft: 'auto', background: 'var(--accent)' }}>{link.count}</span>
              )}
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
            <h1 className="topbar-title">
              {activePOInfo ? 'Purchase Order Details' :
               comparisonRfq ? 'Quotation Comparison' :
               currentView === 'rfq-management' ? 'RFQ Management' :
               currentView === 'quotations' ? 'Quotations' :
               currentView === 'purchase-orders' ? 'Purchase Order Management' :
               currentView === 'analytics' ? 'Procurement Analytics' :
               currentView === 'settings' ? 'Settings & Preferences' : 'RFQ Dashboard'}
            </h1>
            <span className="breadcrumb">
              Procurement &nbsp;/&nbsp; {
                activePOInfo ? (activePOInfo.po?.po_number || 'Purchase Order') :
                comparisonRfq ? comparisonRfq.rfq_number :
                currentView === 'rfq-management' ? 'Management & Lifecycle' :
                currentView === 'quotations' ? 'Vendor Quotations' :
                currentView === 'purchase-orders' ? 'Issued & Draft Orders' :
                currentView === 'analytics' ? 'Reports & Metrics' :
                currentView === 'settings' ? 'Configuration' : 'Requests for Quotation'
              }
            </span>
          </div>
          <div className="topbar-right">
            {onToggleRole && (
              <button className="btn-secondary" onClick={onToggleRole} style={{ borderStyle: 'dashed', color: 'var(--accent)' }}>
                ⇄ Switch to Manager Portal
              </button>
            )}
            <div className="topbar-divider" />
            <button className="icon-btn" title="Notifications">
              <Icons.Bell />
              <span className="notif-dot" />
            </button>
            <div className="topbar-divider" />
            <div className="user-chip">
              <div className="user-avatar">{((currentUser?.name || users[0]?.name || 'Alex Mercer'))[0]}</div>
              <div className="user-meta">
                <span className="user-name">{currentUser?.name || users[0]?.name || 'Alex Mercer'}</span>
                <span className="user-role">Procurement Officer</span>
              </div>
              {onLogout && (
                <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginLeft: '8px', cursor: 'pointer', fontSize: '12px' }}>
                  Logout
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          {activePOInfo ? (
            <PurchaseOrderDetail
              po={activePOInfo.po}
              rfq={activePOInfo.rfq}
              quotation={activePOInfo.quotation}
              vendor={activePOInfo.vendor}
              currentUser={currentUser}
              onBack={() => setActivePOInfo(null)}
              onUpdated={async () => { await fetchData(); }}
            />
          ) : comparisonRfq ? (
            <QuotationComparison
              rfq={comparisonRfq}
              quotations={quotations}
              vendors={vendors}
              currentUser={currentUser}
              onBack={() => { setComparisonRfq(null); }}
              onRefresh={async () => { setComparisonRfq(null); await fetchData(); }}
              onViewPO={(po, rfq, quotation, vendor) => {
                setComparisonRfq(null);
                setActivePOInfo({ po, rfq, quotation, vendor });
              }}
            />
          ) : currentView === 'purchase-orders' ? (
            /* ── Purchase Orders View ── */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="search-input" style={{ flex: 1, maxWidth: '440px' }}>
                  <Icons.Search />
                  <input
                    type="text"
                    placeholder="Search POs by PO #, vendor, title, officer..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <button
                    className={`btn-ghost ${ownershipFilter === 'ALL' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => setOwnershipFilter('ALL')}
                  >
                    🏢 All Purchase Orders ({purchaseOrders.length})
                  </button>
                  <button
                    className={`btn-ghost ${ownershipFilter === 'MY' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => setOwnershipFilter('MY')}
                  >
                    👤 My Purchase Orders ({purchaseOrders.filter(p => {
                      const rfqObj = rfqs.find(r => r.id === p.rfq) || p.rfq_details;
                      return isOwnRfq(p) || isOwnRfq(rfqObj);
                    }).length})
                  </button>
                </div>
              </div>

              <section className="table-card">
                <div className="table-header-bar">
                  <span className="table-title">Issued & Generated Purchase Orders</span>
                  <span className="table-count">
                    {purchaseOrders.filter(po => {
                      const rfqObj = rfqs.find(r => r.id === po.rfq) || po.rfq_details;
                      const vendorObj = vendors.find(v => v.id === po.vendor) || po.vendor_details;
                      const creatorName = rfqObj?.created_by_details?.name || rfqObj?.created_by_name || '';
                      const q = searchQuery.toLowerCase();
                      const matchesSearch = !q || po.po_number?.toLowerCase().includes(q) || vendorObj?.name?.toLowerCase().includes(q) || rfqObj?.title?.toLowerCase().includes(q) || creatorName.toLowerCase().includes(q);
                      const matchesOwn = ownershipFilter === 'ALL' || isOwnRfq(po) || isOwnRfq(rfqObj);
                      return matchesSearch && matchesOwn;
                    }).length} POs
                  </span>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>PO #</th>
                        <th>Vendor</th>
                        <th>RFQ Title</th>
                        <th>Created By</th>
                        <th>Grand Total (₹)</th>
                        <th>Delivery Date</th>
                        <th>Status</th>
                        <th className="th-actions">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrders.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="empty-state">
                            <Icons.FileText />
                            <p>No purchase orders generated yet. Select a winning vendor from quotation comparison to auto-generate a Purchase Order.</p>
                          </td>
                        </tr>
                      ) : (
                        purchaseOrders
                          .filter(po => {
                            const rfqObj = rfqs.find(r => r.id === po.rfq) || po.rfq_details;
                            const vendorObj = vendors.find(v => v.id === po.vendor) || po.vendor_details;
                            const creatorName = rfqObj?.created_by_details?.name || rfqObj?.created_by_name || '';
                            const q = searchQuery.toLowerCase();
                            const matchesSearch = !q || po.po_number?.toLowerCase().includes(q) || vendorObj?.name?.toLowerCase().includes(q) || rfqObj?.title?.toLowerCase().includes(q) || creatorName.toLowerCase().includes(q);
                            const matchesOwn = ownershipFilter === 'ALL' || isOwnRfq(po) || isOwnRfq(rfqObj);
                            return matchesSearch && matchesOwn;
                          })
                          .map(po => {
                            const rfqObj = rfqs.find(r => r.id === po.rfq) || po.rfq_details;
                            const vendorObj = vendors.find(v => v.id === po.vendor) || po.vendor_details;
                            const quotObj = quotations.find(q => q.id === po.quotation) || po.quotation_details;
                            const isOwn = isOwnRfq(po) || isOwnRfq(rfqObj);
                            const creatorName = rfqObj?.created_by_details?.name || rfqObj?.created_by_name || (isOwn ? (currentUser?.name || 'Alex Mercer') : 'Priya Shah');
                            return (
                              <tr key={po.id}>
                                <td><span className="mono-text">{po.po_number}</span></td>
                                <td>
                                  <span className="cell-primary">{vendorObj?.name || 'Dell Technologies'}</span>
                                  <span className="cell-sub">{vendorObj?.vendor_code || 'VND-DELL'}</span>
                                </td>
                                <td><span className="cell-primary">{rfqObj?.title || 'Laptops Procurement'}</span></td>
                                <td>
                                  <span className="cell-primary" style={{ fontSize: '13px', fontWeight: 600 }}>{creatorName}</span>
                                  {isOwn ? (
                                    <span className="cell-sub" style={{ color: 'var(--accent)' }}>You (Creator)</span>
                                  ) : (
                                    <span className="cell-sub" style={{ color: 'var(--text-muted)' }}>Officer</span>
                                  )}
                                </td>
                                <td className="num-cell" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                                  ₹{parseFloat(po.total_value || 147500).toLocaleString('en-IN')}
                                </td>
                                <td className="date-cell">{po.expected_delivery_date || '—'}</td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span className={`badge badge-status-${po.status === 'rejected_by_finance' || po.status === 'rejected' ? 'rejected' : po.status === 'issued' || po.status === 'delivered' || po.status === 'paid' || po.status === 'completed' || po.status === 'closed' ? 'approved' : po.status === 'acknowledged' ? 'open' : 'draft'}`} style={{ background: (po.status === 'rejected_by_finance' || po.status === 'rejected') ? '#ef4444' : (po.status === 'paid' || po.status === 'completed' || po.status === 'closed') ? '#10b981' : po.status === 'invoiced' ? '#8b5cf6' : po.status === 'delivered' ? '#059669' : undefined, color: (po.status === 'rejected_by_finance' || po.status === 'rejected' || po.status === 'paid' || po.status === 'completed' || po.status === 'closed' || po.status === 'invoiced' || po.status === 'delivered') ? '#fff' : undefined }}>
                                      {(po.status === 'rejected_by_finance' || po.status === 'rejected') ? 'REJECTED BY FINANCE' : (po.status === 'paid' || po.status === 'completed' || po.status === 'closed') ? 'PAID & COMPLETED' : (po.status?.toUpperCase() || 'DRAFT')}
                                    </span>
                                    {!isOwn && (
                                      <span className="badge badge-status-draft" style={{ background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.25)', fontSize: '10px', padding: '2px 6px', width: 'fit-content' }}>
                                        View Only
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="actions-cell">
                                  {isOwn ? (
                                    <button className="btn-action btn-submit" style={(po.status === 'rejected_by_finance' || po.status === 'rejected') ? { background: '#ef4444', borderColor: '#ef4444' } : undefined} onClick={() => setActivePOInfo({ po, rfq: rfqObj, quotation: quotObj, vendor: vendorObj })}>
                                      {(po.status === 'rejected_by_finance' || po.status === 'rejected') ? '⚠️ View Rejected PO' : (po.status === 'paid' || po.status === 'completed' || po.status === 'closed') ? '📄 View Paid & Completed PO' : po.status === 'invoiced' ? '📄 View Invoiced PO' : po.status === 'delivered' ? '📄 View Delivered PO' : (po.status === 'issued' || po.status === 'acknowledged' || po.status === 'in_progress') ? '📄 View PO' : '📄 Review & Issue PO'}
                                    </button>
                                  ) : (
                                    <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setActivePOInfo({ po, rfq: rfqObj, quotation: quotObj, vendor: vendorObj })}>
                                      👁 View PO (View Only)
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : currentView === 'quotations' ? (
            /* ── Quotations View ── */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="search-input" style={{ flex: 1, maxWidth: '440px' }}>
                  <Icons.Search />
                  <input
                    type="text"
                    placeholder="Search quotations by RFQ #, title, officer..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <button
                    className={`btn-ghost ${ownershipFilter === 'ALL' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => setOwnershipFilter('ALL')}
                  >
                    🏢 All Quotations ({rfqsWithQuotations.length})
                  </button>
                  <button
                    className={`btn-ghost ${ownershipFilter === 'MY' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => setOwnershipFilter('MY')}
                  >
                    👤 My RFQs Quotations ({rfqsWithQuotations.filter(r => isOwnRfq(r)).length})
                  </button>
                </div>
              </div>

              <section className="table-card">
                <div className="table-header-bar">
                  <span className="table-title">RFQs with Vendor Quotations</span>
                  <span className="table-count">
                    {rfqsWithQuotations.filter(rfq => {
                      const creatorName = rfq.created_by_details?.name || rfq.created_by_name || '';
                      const q = searchQuery.toLowerCase();
                      const matchesSearch = !q || rfq.rfq_number?.toLowerCase().includes(q) || rfq.title?.toLowerCase().includes(q) || creatorName.toLowerCase().includes(q);
                      const matchesOwn = ownershipFilter === 'ALL' || isOwnRfq(rfq);
                      return matchesSearch && matchesOwn;
                    }).length} RFQs
                  </span>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>RFQ #</th>
                        <th>Title</th>
                        <th>Department</th>
                        <th>Created By</th>
                        <th>Total Quotations</th>
                        <th>Status</th>
                        <th className="th-actions">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqsWithQuotations.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="empty-state">
                            <Icons.Inbox />
                            <p>No vendor quotations received yet for active RFQs.</p>
                          </td>
                        </tr>
                      ) : (
                        rfqsWithQuotations
                          .filter(rfq => {
                            const creatorName = rfq.created_by_details?.name || rfq.created_by_name || '';
                            const q = searchQuery.toLowerCase();
                            const matchesSearch = !q || rfq.rfq_number?.toLowerCase().includes(q) || rfq.title?.toLowerCase().includes(q) || creatorName.toLowerCase().includes(q);
                            const matchesOwn = ownershipFilter === 'ALL' || isOwnRfq(rfq);
                            return matchesSearch && matchesOwn;
                          })
                          .map(rfq => {
                            const rfqQuots = quotations.filter(q => q.rfq === rfq.id);
                            const isOwn = isOwnRfq(rfq);
                            const creatorName = rfq.created_by_details?.name || rfq.created_by_name || (isOwn ? (currentUser?.name || 'Alex Mercer') : 'Priya Shah');
                            return (
                              <tr key={rfq.id}>
                                <td><span className="mono-text">{rfq.rfq_number}</span></td>
                                <td><span className="cell-primary">{rfq.title}</span></td>
                                <td><span className="dept-chip">{rfq.department_details?.code || '—'}</span></td>
                                <td>
                                  <span className="cell-primary" style={{ fontSize: '13px', fontWeight: 600 }}>{creatorName}</span>
                                  {isOwn ? (
                                    <span className="cell-sub" style={{ color: 'var(--accent)' }}>You (Creator)</span>
                                  ) : (
                                    <span className="cell-sub" style={{ color: 'var(--text-muted)' }}>Officer</span>
                                  )}
                                </td>
                                <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{rfqQuots.length} Bids Received</td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span className={`badge badge-status-${rfq.status}`}>{statusLabel(rfq.status)}</span>
                                    {!isOwn && (
                                      <span className="badge badge-status-draft" style={{ background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.25)', fontSize: '10px', padding: '2px 6px', width: 'fit-content' }}>
                                        View Only
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="actions-cell">
                                  {isOwn ? (
                                    <button className="btn-action btn-submit" onClick={() => setComparisonRfq(rfq)}>
                                      📊 Compare & Select Winner
                                    </button>
                                  ) : (
                                    <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setComparisonRfq(rfq)}>
                                      👁 View Quotations (View Only)
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : currentView === 'analytics' ? (
            /* ── Analytics View ── */
            <div className="qc-page">
              <section className="stats-row">
                <div className="stat-card stat-blue">
                  <div className="stat-header">
                    <span className="stat-label">Total Procurement RFQs</span>
                    <div className="stat-icon-wrap"><Icons.FileText /></div>
                  </div>
                  <div className="stat-value">{companyRfqsCount}</div>
                  <span className="stat-sub">Across all officers</span>
                </div>
                <div className="stat-card stat-amber">
                  <div className="stat-header">
                    <span className="stat-label">Active Bidding RFQs</span>
                    <div className="stat-icon-wrap"><Icons.Clock /></div>
                  </div>
                  <div className="stat-value">{openCount}</div>
                  <span className="stat-sub">Open & Under Review</span>
                </div>
                <div className="stat-card stat-green">
                  <div className="stat-header">
                    <span className="stat-label">Quotations Received</span>
                    <div className="stat-icon-wrap"><Icons.Inbox /></div>
                  </div>
                  <div className="stat-value">{quotations.length}</div>
                  <span className="stat-sub">From registered vendors</span>
                </div>
                <div className="stat-card stat-zinc">
                  <div className="stat-header">
                    <span className="stat-label">Avg Cycle Time</span>
                    <div className="stat-icon-wrap"><Icons.BarChart /></div>
                  </div>
                  <div className="stat-value">6.8 days</div>
                  <span className="stat-sub">Creation to Selection</span>
                </div>
              </section>
            </div>
          ) : currentView === 'settings' ? (
            /* ── Settings View ── */
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div className="table-card info-card">
                <div className="table-header-bar"><span className="table-title">System & Workflow Settings</span></div>
                <form style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={e => { e.preventDefault(); alert('Settings saved successfully!'); }}>
                  <div className="field">
                    <label>Default RFQ Validity Period (Days)</label>
                    <input type="number" defaultValue={14} />
                  </div>
                  <div className="field">
                    <label>Manager Approval Threshold (₹)</label>
                    <input type="number" defaultValue={50000} />
                  </div>
                  <div className="field">
                    <label>Auto-Close Expired RFQs</label>
                    <select defaultValue="enabled">
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Save Settings</button>
                </form>
              </div>
            </div>
          ) : (
          /* ── Main Dashboard & RFQ Management Views ── */
          <>
          {/* Stats Row */}
          <section className="stats-row">
            <div className="stat-card stat-blue">
              <div className="stat-header">
                <span className="stat-label">My RFQs</span>
                <div className="stat-icon-wrap"><Icons.FileText /></div>
              </div>
              <div className="stat-value">{myRfqsCount}</div>
              <span className="stat-sub">Created by you</span>
            </div>

            <div className="stat-card stat-zinc">
              <div className="stat-header">
                <span className="stat-label">Company RFQs</span>
                <div className="stat-icon-wrap"><Icons.Inbox /></div>
              </div>
              <div className="stat-value">{companyRfqsCount}</div>
              <span className="stat-sub">Across all officers</span>
            </div>

            <div className="stat-card stat-amber">
              <div className="stat-header">
                <span className="stat-label">Pending Approval</span>
                <div className="stat-icon-wrap"><Icons.Clock /></div>
              </div>
              <div className="stat-value">{pendingCount}</div>
              <span className="stat-sub">Across the company</span>
            </div>

            <div className="stat-card stat-green">
              <div className="stat-header">
                <span className="stat-label">Open RFQs</span>
                <div className="stat-icon-wrap"><Icons.CheckCircle /></div>
              </div>
              <div className="stat-value">{openCount}</div>
              <span className="stat-sub">Across the company</span>
            </div>
          </section>

          {/* Toolbar & Filters */}
          <section className="toolbar" style={{ flexDirection: 'column', gap: '14px', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div className="search-input" style={{ flex: 1, maxWidth: '440px' }}>
                <Icons.Search />
                <input
                  type="text"
                  placeholder="Search by RFQ #, title, dept, officer name…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Ownership Filter Tabs: All RFQs vs My RFQs */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <button
                  className={`btn-ghost ${ownershipFilter === 'ALL' ? 'btn-primary' : ''}`}
                  style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer' }}
                  onClick={() => setOwnershipFilter('ALL')}
                >
                  🏢 All RFQs ({companyRfqsCount})
                </button>
                <button
                  className={`btn-ghost ${ownershipFilter === 'MY' ? 'btn-primary' : ''}`}
                  style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer' }}
                  onClick={() => setOwnershipFilter('MY')}
                >
                  👤 My RFQs ({myRfqsCount})
                </button>
              </div>

              <button className="btn-primary" onClick={handleOpenCreateModal}>
                <Icons.Plus /> New RFQ
              </button>
            </div>

            {/* Status Filter Pills */}
            <div className="filter-pills" style={{ marginTop: '2px' }}>
              {statusFilters.map(f => (
                <button key={f.key} className={`pill ${statusFilter === f.key ? 'pill-active' : ''}`} onClick={() => setStatusFilter(f.key)}>
                  {f.label}
                  {f.key !== 'ALL' && (
                    <span className="pill-count">
                      {rfqs.filter(r => (f.key === 'ALL' || r.status === f.key.toLowerCase()) && (ownershipFilter === 'ALL' || isOwnRfq(r))).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
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

          {/* RFQ Table */}
          {!loading && (
            <section className="table-card">
              <div className="table-header-bar">
                <span className="table-title">Company Requests for Quotation</span>
                <span className="table-count">{filteredRfqs.length} {filteredRfqs.length === 1 ? 'result' : 'results'}</span>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>RFQ #</th>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Created By</th>
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
                          <p>{rfqs.length === 0 ? 'No RFQs created yet.' : 'No results match your search or filters.'}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRfqs.map(rfq => {
                        const isOwn = isOwnRfq(rfq);
                        const creatorName = rfq.created_by_details?.name || rfq.created_by_name || (isOwn ? (currentUser?.name || 'Alex Mercer') : 'Priya Shah');
                        return (
                          <tr key={rfq.id} onClick={() => openRfqDetail(rfq)} style={{ cursor: 'pointer' }}>
                            <td>
                              <span className="mono-text">{rfq.rfq_number}</span>
                              <span className="cell-sub">{new Date(rfq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </td>
                            <td>
                              <span className="cell-primary">{rfq.title}</span>
                              <span className="cell-sub cell-desc">{rfq.description}</span>
                            </td>
                            <td><span className="dept-chip">{rfq.department_details?.code || rfq.department_details?.name || '—'}</span></td>
                            <td>
                              <span className="cell-primary" style={{ fontSize: '13px', fontWeight: 600 }}>{creatorName}</span>
                              {isOwn ? (
                                <span className="cell-sub" style={{ color: 'var(--accent)' }}>You (Creator)</span>
                              ) : (
                                <span className="cell-sub" style={{ color: 'var(--text-muted)' }}>{rfq.created_by_details?.department_details?.name || 'Officer'}</span>
                              )}
                            </td>
                            <td><span className={`badge badge-priority-${rfq.priority}`}>{rfq.priority}</span></td>
                            <td className="date-cell">{rfq.deadline || '—'}</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span className={`badge badge-status-${rfq.status}`}>{statusLabel(rfq.status)}</span>
                                {!isOwn && (
                                  <span className="badge badge-status-draft" style={{ background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.25)', fontSize: '10px', padding: '2px 6px', width: 'fit-content' }}>
                                    View Only
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="actions-cell" onClick={e => e.stopPropagation()}>
                              {isOwn ? (
                                <>
                                  {rfq.status === 'draft' && (
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                      <button className="btn-action btn-submit" onClick={() => handleStatusUpdate(rfq.id, 'pending_approval')}>
                                        <Icons.Send /> Submit
                                      </button>
                                      <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => openRfqDetail(rfq)}>
                                        Edit
                                      </button>
                                      <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }} onClick={() => handleDeleteRFQ(rfq.id)}>
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                  {rfq.status === 'pending_approval' && (
                                    <span className="awaiting-text">Awaiting Approval</span>
                                  )}
                                  {(rfq.status === 'open' || rfq.status === 'under_review') && hasQuotations(rfq.id) && (
                                    <button className="btn-action btn-submit" onClick={() => setComparisonRfq(rfq)}>
                                      📊 Compare Quotations
                                    </button>
                                  )}
                                  {rfq.status === 'open' && !hasQuotations(rfq.id) && (
                                    <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '12px' }}>✓ Approved & Live</span>
                                  )}
                                  {rfq.status === 'completed' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ color: '#34d399', fontWeight: '600', fontSize: '12px' }}>✓ Completed</span>
                                      <button className="btn-action btn-submit" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => {
                                        const matchedPo = purchaseOrders.find(p => p.rfq === rfq.id);
                                        const matchedQuot = quotations.find(q => q.rfq === rfq.id && q.status === 'selected');
                                        const matchedVend = vendors.find(v => v.id === matchedQuot?.vendor);
                                        setActivePOInfo({
                                          po: matchedPo || { po_number: 'PO-2026-0042', status: 'issued', rfq: rfq.id },
                                          rfq: rfq,
                                          quotation: matchedQuot,
                                          vendor: matchedVend
                                        });
                                      }}>
                                        📄 View PO
                                      </button>
                                    </div>
                                  )}
                                  {rfq.status === 'closed' && (
                                    <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '12px' }}>🔒 Closed</span>
                                  )}
                                  {rfq.status === 'rejected' && (
                                    <button className="btn-action btn-publish" onClick={() => openRfqDetail(rfq)}>
                                      ↻ Edit & Resubmit
                                    </button>
                                  )}
                                </>
                              ) : (
                                /* Read-only view for another officer's RFQ */
                                <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => openRfqDetail(rfq)}>
                                  👁 View Details
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          </>
          )}
        </main>
      </div>

      {/* ── CREATE RFQ MODAL ── */}
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
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Enterprise Server Rack Infrastructure"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Department <span className="req">*</span> <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 500 }}>(Locked to your department)</span></label>
                  <select name="department" value={formData.department} onChange={handleInputChange} disabled style={{ cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.04)', opacity: 0.85 }}>
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
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="field">
                  <label>Deadline <span className="req">*</span></label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    value={formData.deadline}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Required By Date</label>
                  <input
                    type="date"
                    name="required_by_date"
                    value={formData.required_by_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="field">
                  <label>Specs File URL</label>
                  <input
                    type="url"
                    name="specs_file_url"
                    placeholder="https://…"
                    value={formData.specs_file_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="field full">
                <label>Description & Scope <span className="req">*</span></label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Detailed specifications, technical constraints, compliance requirements..."
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating…' : 'Create Draft RFQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RFQ DETAIL & EDIT MODAL ── */}
      {selectedRfq && (
        <div className="modal-overlay" onClick={closeRfqDetail}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2 className="modal-title">{selectedRfq.rfq_number}: {selectedRfq.title}</h2>
                <p className="modal-subtitle">
                  Status: <strong>{statusLabel(selectedRfq.status)}</strong> · Created {new Date(selectedRfq.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
              <button className="modal-close" onClick={closeRfqDetail}><Icons.X /></button>
            </div>

            {/* View-Only Banner if created by another Officer */}
            {!isOwnRfq(selectedRfq) && (
              <div style={{
                margin: '0 24px 16px',
                padding: '14px 18px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ℹ This RFQ was created by <span style={{ color: 'var(--accent)' }}>{selectedRfq.created_by_details?.name || selectedRfq.created_by_name || 'Priya Shah'}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Department: <strong>{selectedRfq.department_details?.name || selectedRfq.department_details?.code || 'Human Resources'}</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginTop: '6px' }}>
                  You have view-only access. Actions such as editing, deleting, resubmitting, comparing quotations, and issuing POs are disabled for this request.
                </div>
              </div>
            )}

            {/* Manager Remarks Banner (for rejected or approved) */}
            {selectedRfq.manager_remarks && (
              <div style={{
                margin: '0 24px 16px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: selectedRfq.status === 'rejected'
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'rgba(34, 197, 94, 0.08)',
                border: `1px solid ${selectedRfq.status === 'rejected'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(34, 197, 94, 0.2)'}`,
              }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: selectedRfq.status === 'rejected' ? '#f87171' : '#4ade80', display: 'block', marginBottom: '4px' }}>
                  Manager Remarks
                </span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {selectedRfq.manager_remarks}
                </p>
              </div>
            )}

            {/* Editable Form (if creator and draft/rejected) */}
            {editData ? (
              <form onSubmit={selectedRfq.status === 'rejected' ? handleEditAndResubmit : handleSaveEdit} className="modal-body">
                <div className="field full">
                  <label>Title <span className="req">*</span></label>
                  <input type="text" name="title" required value={editData.title} onChange={handleEditChange} />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Department <span className="req">*</span> <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 500 }}>(Locked)</span></label>
                    <select name="department" value={editData.department} onChange={handleEditChange} disabled style={{ cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.04)', opacity: 0.85 }}>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Priority</label>
                    <select name="priority" value={editData.priority} onChange={handleEditChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Quantity <span className="req">*</span></label>
                    <input type="number" name="quantity" min="1" required value={editData.quantity} onChange={handleEditChange} />
                  </div>
                  <div className="field">
                    <label>Deadline <span className="req">*</span></label>
                    <input type="date" name="deadline" required value={editData.deadline} onChange={handleEditChange} />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Required By Date</label>
                    <input type="date" name="required_by_date" value={editData.required_by_date} onChange={handleEditChange} />
                  </div>
                  <div className="field">
                    <label>Specs URL</label>
                    <input type="url" name="specs_file_url" placeholder="https://…" value={editData.specs_file_url} onChange={handleEditChange} />
                  </div>
                </div>

                <div className="field full">
                  <label>Description <span className="req">*</span></label>
                  <textarea name="description" rows="4" required value={editData.description} onChange={handleEditChange} />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeRfqDetail}>Cancel</button>
                  {selectedRfq.status === 'rejected' ? (
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? 'Resubmitting…' : '↻ Save & Resubmit to Manager'}
                    </button>
                  ) : (
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? 'Saving…' : 'Save Changes'}
                    </button>
                  )}
                </div>
              </form>
            ) : (
              /* Read-only view (pending_approval / open / closed / view-only officer) */
              <div className="modal-body">
                <div className="field-row">
                  <div className="field">
                    <label>Title</label>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{selectedRfq.title}</p>
                  </div>
                  <div className="field">
                    <label>Department</label>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{selectedRfq.department_details?.name || selectedRfq.department_details?.code || '—'}</p>
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Priority</label>
                    <span className={`badge badge-priority-${selectedRfq.priority}`}>{selectedRfq.priority}</span>
                  </div>
                  <div className="field">
                    <label>Quantity</label>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{selectedRfq.quantity?.toLocaleString()} units</p>
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Deadline</label>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{selectedRfq.deadline || '—'}</p>
                  </div>
                  <div className="field">
                    <label>Required By</label>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{selectedRfq.required_by_date || '—'}</p>
                  </div>
                </div>

                <div className="field full">
                  <label>Description</label>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    {selectedRfq.description}
                  </p>
                </div>

                <div className="field full">
                  <label>Created By Officer</label>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {selectedRfq.created_by_details?.name || selectedRfq.created_by_name || 'Alex Mercer'} &nbsp;
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
                      ({selectedRfq.created_by_details?.email || 'officer@vendorbridge.com'})
                    </span>
                  </p>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeRfqDetail}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
