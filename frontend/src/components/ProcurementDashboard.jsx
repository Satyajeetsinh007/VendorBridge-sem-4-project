import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './ProcurementDashboard.css';

export default function ProcurementDashboard() {
  const [rfqs, setRfqs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State matching DB fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    priority: 'medium',
    quantity: 100,
    deadline: '',
    required_by_date: '',
    specs_file_url: '',
    status: 'draft',
    created_by: '',
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

      // Auto seed if empty
      if (deptsData.length === 0 || usersData.length === 0) {
        await api.seedData().catch(() => {});
        deptsData = await api.getDepartments().catch(() => []);
        usersData = await api.getUsers().catch(() => []);
      }

      setDepartments(deptsData);
      setUsers(usersData);
      setRfqs(rfqsData);

      // Pre-fill department & created_by in form
      if (deptsData.length > 0 && !formData.department) {
        setFormData(prev => ({ ...prev, department: deptsData[0].id }));
      }
      if (usersData.length > 0 && !formData.created_by) {
        setFormData(prev => ({ ...prev, created_by: usersData[0].id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      // Reset form
      setFormData({
        title: '',
        description: '',
        department: departments[0]?.id || '',
        priority: 'medium',
        quantity: 100,
        deadline: '',
        required_by_date: '',
        specs_file_url: '',
        status: 'draft',
        created_by: users[0]?.id || '',
      });
      await fetchData();
    } catch (err) {
      alert(`Error creating RFQ: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (rfqId, newStatus) => {
    try {
      await api.updateRFQStatus(rfqId, newStatus);
      await fetchData();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
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

  // Filtered RFQs
  const filteredRfqs = rfqs.filter(rfq => {
    const matchesSearch = 
      rfq.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.rfq_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || rfq.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = rfqs.length;
  const draftCount = rfqs.filter(r => r.status === 'draft').length;
  const openCount = rfqs.filter(r => r.status === 'open').length;
  const pendingCount = rfqs.filter(r => r.status === 'pending_approval').length;

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'priority-badge high';
      case 'medium': return 'priority-badge medium';
      case 'low': return 'priority-badge low';
      default: return 'priority-badge';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'status-badge open';
      case 'draft': return 'status-badge draft';
      case 'pending_approval': return 'status-badge pending';
      case 'approved': return 'status-badge approved';
      case 'rejected': return 'status-badge rejected';
      case 'closed': return 'status-badge closed';
      default: return 'status-badge';
    }
  };

  return (
    <div className="procurement-container">
      {/* Top Navbar */}
      <header className="procurement-header">
        <div className="brand-section">
          <div className="logo-icon">🌉</div>
          <div>
            <h1>VendorBridge</h1>
            <p className="subtitle">Procurement Officer Portal</p>
          </div>
        </div>

        <div className="user-profile">
          <button className="seed-btn" onClick={handleSeedClick} title="Initialize sample DB departments & users">
            🌱 Seed DB Data
          </button>
          <div className="avatar">AM</div>
          <div className="user-info">
            <span className="user-name">{users[0]?.name || 'Alex Mercer'}</span>
            <span className="user-role">Procurement Officer</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="procurement-main">
        {/* Metrics Grid */}
        <section className="metrics-grid">
          <div className="metric-card cyan">
            <div className="metric-title">Total RFQs</div>
            <div className="metric-value">{totalCount}</div>
            <div className="metric-sub">Across all departments</div>
          </div>
          <div className="metric-card yellow">
            <div className="metric-title">Draft Proposals</div>
            <div className="metric-value">{draftCount}</div>
            <div className="metric-sub">Work in progress</div>
          </div>
          <div className="metric-card green">
            <div className="metric-title">Open RFQs</div>
            <div className="metric-value">{openCount}</div>
            <div className="metric-sub">Live for vendor bids</div>
          </div>
          <div className="metric-card purple">
            <div className="metric-title">Pending Approvals</div>
            <div className="metric-value">{pendingCount}</div>
            <div className="metric-sub">Awaiting Manager signoff</div>
          </div>
        </section>

        {/* Action Controls Header */}
        <section className="controls-section">
          <div className="search-filter-group">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search RFQs by number, title, specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="status-tabs">
              {['ALL', 'DRAFT', 'OPEN', 'PENDING_APPROVAL', 'CLOSED'].map(st => (
                <button
                  key={st}
                  className={`tab-btn ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            <span className="btn-icon">➕</span> Create New RFQ
          </button>
        </section>

        {/* Loading / Error States */}
        {loading && <div className="state-card loading">⏳ Connecting to Django Backend...</div>}
        {error && (
          <div className="state-card error">
            ⚠️ Backend Connection Notice: {error}
            <button className="retry-btn" onClick={fetchData}>Retry Connection</button>
          </div>
        )}

        {/* RFQ List Section */}
        {!loading && (
          <section className="rfq-table-card">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>RFQ Number</th>
                  <th>Title & Description</th>
                  <th>Department</th>
                  <th>Qty</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRfqs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-row">
                      {rfqs.length === 0 
                        ? "No RFQs found. Click 'Create New RFQ' above to add your first RFQ!" 
                        : "No RFQs match your current search/filter."}
                    </td>
                  </tr>
                ) : (
                  filteredRfqs.map((rfq) => (
                    <tr key={rfq.id}>
                      <td className="rfq-num-cell">
                        <span className="rfq-num">{rfq.rfq_number}</span>
                        <span className="created-date">
                          {new Date(rfq.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="title-cell">
                        <div className="rfq-title">{rfq.title}</div>
                        <div className="rfq-desc">{rfq.description}</div>
                      </td>
                      <td>
                        <span className="dept-pill">
                          {rfq.department_details?.code || rfq.department_details?.name || 'ENG'}
                        </span>
                      </td>
                      <td className="qty-cell">{rfq.quantity?.toLocaleString()} pcs</td>
                      <td>
                        <span className={getPriorityBadgeClass(rfq.priority)}>
                          {rfq.priority?.toUpperCase()}
                        </span>
                      </td>
                      <td className="date-cell">{rfq.deadline || 'N/A'}</td>
                      <td>
                        <span className={getStatusBadgeClass(rfq.status)}>
                          {rfq.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="actions-cell">
                        {rfq.status === 'draft' && (
                          <button
                            className="action-btn publish"
                            onClick={() => handleStatusUpdate(rfq.id, 'open')}
                            title="Publish RFQ for Vendors"
                          >
                            🚀 Publish
                          </button>
                        )}
                        {rfq.status === 'open' && (
                          <button
                            className="action-btn submit"
                            onClick={() => handleStatusUpdate(rfq.id, 'pending_approval')}
                            title="Submit for Manager Approval"
                          >
                            📩 Send for Approval
                          </button>
                        )}
                        {rfq.status === 'pending_approval' && (
                          <span className="info-text">Awaiting Review</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* Modal: Create New RFQ */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Request for Quotation (RFQ)</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateRFQ} className="rfq-form">
              <div className="form-group full-width">
                <label>RFQ Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Procurement of High-Performance Laptops & Switches"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority Level</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Required Quantity (Units) *</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Submission Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    value={formData.deadline}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Delivery Required By Date</label>
                  <input
                    type="date"
                    name="required_by_date"
                    value={formData.required_by_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Specs Document URL (Optional)</label>
                  <input
                    type="url"
                    name="specs_file_url"
                    placeholder="https://drive.google.com/specs.pdf"
                    value={formData.specs_file_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Detailed Description & Technical Specs *</label>
                <textarea
                  name="description"
                  rows="4"
                  required
                  placeholder="Describe technical requirements, warranty expectations, delivery criteria..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Creating RFQ...' : 'Submit & Save RFQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
