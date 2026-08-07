import React, { useState } from 'react';

export default function VendorHistory({ quotations = [], rfqs = [] }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getIdStr = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') return obj.id || obj.uuid || String(obj);
    return String(obj);
  };

  // Map all vendor proposals with linked RFQ details
  const historicalQuotations = (quotations || [])
    .map(q => {
      const rfqId = getIdStr(q.rfq || q.rfq_details);
      const rfqObj = (rfqs || []).find(r => getIdStr(r) === rfqId) || q.rfq_details || {};
      return { ...q, rfq_info: rfqObj };
    });

  const filtered = historicalQuotations.filter(q => {
    const matchesStatus = !statusFilter || q.status === statusFilter || (statusFilter === 'selected' && (q.status === 'awarded' || q.status === 'completed'));
    let matchesDate = true;
    if (startDate || endDate) {
      const submitted = new Date(q.submitted_at || q.created_at || Date.now());
      if (startDate && submitted < new Date(startDate)) matchesDate = false;
      if (endDate && submitted > new Date(endDate + 'T23:59:59')) matchesDate = false;
    }
    return matchesStatus && matchesDate;
  });

  const getStatusBadge = (s) => {
    switch (s) {
      case 'submitted':
      case 'under_review':
        return <span className="badge badge-status-pending_approval" style={{ background: '#3b82f6', color: '#fff' }}>⏳ Submitted</span>;
      case 'selected':
      case 'awarded':
      case 'completed':
        return <span className="badge badge-status-open" style={{ background: '#10b981', color: '#fff' }}>🏆 Selected & Awarded</span>;
      case 'rejected':
        return <span className="badge badge-status-rejected" style={{ background: '#ef4444', color: '#fff' }}>❌ Rejected</span>;
      case 'draft':
        return <span className="badge badge-status-draft" style={{ background: '#94a3b8', color: '#fff' }}>📝 Draft</span>;
      default:
        return <span className="badge badge-status-draft">{(s || 'SUBMITTED').toUpperCase()}</span>;
    }
  };

  return (
    <div>
      <section className="toolbar history-toolbar" style={{ marginBottom: '20px' }}>
        <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="field">
            <label>Status Filter</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Historical Proposals ({historicalQuotations.length})</option>
              <option value="submitted">Submitted / Under Review</option>
              <option value="selected">Selected / Awarded</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="field">
            <label>From Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="field">
            <label>To Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="table-card">
        <div className="table-header-bar">
          <span className="table-title">Quotation History Log</span>
          <span className="table-count">{filtered.length} records</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quotation #</th>
                <th>RFQ Number & Title</th>
                <th>Department</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Status / Decision</th>
                <th>Submission Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <p>No historical quotations found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(q => (
                  <tr key={q.id}>
                    <td><span className="mono-text">{q.quotation_number || `QTN-${q.id?.slice(0, 6)}`}</span></td>
                    <td>
                      <span className="cell-primary">{q.rfq_info?.rfq_number || 'RFQ'}</span>
                      <span className="cell-sub">{q.rfq_info?.title || 'Supply Proposal'}</span>
                    </td>
                    <td><span className="dept-chip">{q.rfq_info?.department_details?.code || q.rfq_info?.department || 'IT'}</span></td>
                    <td className="num-cell">₹{parseFloat(q.unit_price || 0).toLocaleString('en-IN')}</td>
                    <td className="num-cell" style={{ fontWeight: 600, color: 'var(--accent)' }}>₹{parseFloat(q.total_price || (q.unit_price * (q.rfq_info?.quantity || 1))).toLocaleString('en-IN')}</td>
                    <td>{getStatusBadge(q.status)}</td>
                    <td className="date-cell">
                      {q.submitted_at || q.created_at ? new Date(q.submitted_at || q.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) : 'Recent'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
