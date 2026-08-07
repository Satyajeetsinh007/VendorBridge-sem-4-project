import React, { useState } from 'react';

export default function VendorQuotations({ quotations, onEditQuotation, onViewRFQ }) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = quotations.filter(q =>
    statusFilter === 'ALL' || q.status === statusFilter.toLowerCase()
  );

  const getStatusBadge = (s) => {
    switch (s) {
      case 'draft': return 'badge badge-status-draft';
      case 'submitted': return 'badge badge-status-pending_approval';
      case 'selected': return 'badge badge-status-open';
      case 'rejected': return 'badge badge-status-rejected';
      default: return 'badge';
    }
  };

  const canEdit = (q) => {
    if (q.status !== 'draft') return false;
    const rfqDeadline = q.rfq_details?.deadline;
    if (rfqDeadline && new Date(rfqDeadline) < new Date()) return false;
    return true;
  };

  const statusFilters = ['ALL', 'DRAFT', 'SUBMITTED', 'SELECTED', 'REJECTED'];

  return (
    <div>
      <section className="toolbar" style={{ marginBottom: '20px' }}>
        <div className="filter-pills">
          {statusFilters.map(f => (
            <button key={f} className={`pill ${statusFilter === f ? 'pill-active' : ''}`} onClick={() => setStatusFilter(f)}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </section>

      <section className="table-card">
        <div className="table-header-bar">
          <span className="table-title">My Quotations</span>
          <span className="table-count">{filtered.length} {filtered.length === 1 ? 'quotation' : 'quotations'}</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quotation #</th>
                <th>RFQ</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Delivery</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className="th-actions">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state"><p>No quotations found.</p></td>
                </tr>
              ) : (
                filtered.map(q => (
                  <tr key={q.id}>
                    <td><span className="mono-text">{q.quotation_number}</span></td>
                    <td>
                      <span className="cell-primary">{q.rfq_details?.title || '—'}</span>
                      <span className="cell-sub">{q.rfq_details?.rfq_number}</span>
                    </td>
                    <td className="num-cell">₹{parseFloat(q.unit_price).toLocaleString('en-IN')}</td>
                    <td className="num-cell">₹{parseFloat(q.total_price).toLocaleString('en-IN')}</td>
                    <td>{q.delivery_days} days</td>
                    <td className="date-cell">
                      {q.submitted_at ? new Date(q.submitted_at).toLocaleDateString() : '—'}
                    </td>
                    <td><span className={getStatusBadge(q.status)}>{q.status}</span></td>
                    <td className="actions-cell">
                      {canEdit(q) ? (
                        <button className="btn-action btn-submit" onClick={() => onEditQuotation(q)}>
                          ✏️ Edit
                        </button>
                      ) : (
                        <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => onViewRFQ(q.rfq_details)}>
                          View RFQ
                        </button>
                      )}
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
