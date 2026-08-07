import React, { useState } from 'react';

export default function VendorQuotations({ quotations, purchaseOrders = [], onEditQuotation, onViewRFQ }) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = quotations.filter(q =>
    statusFilter === 'ALL' || q.status === statusFilter.toLowerCase()
  );

  const renderStatusBadge = (q) => {
    const s = q.status;
    switch (s) {
      case 'draft': return <span className="badge badge-status-draft">Draft</span>;
      case 'submitted': return <span className="badge badge-status-pending_approval">Submitted</span>;
      case 'selected': {
        const issuedPo = purchaseOrders.find(p =>
          (p.quotation === q.id || p.rfq === q.rfq) &&
          p.status &&
          p.status !== 'draft'
        );
        if (issuedPo) {
          return <span className="badge badge-status-approved" style={{ background: '#10b981', color: '#fff' }}>PO Received</span>;
        }
        return <span className="badge badge-priority-medium" style={{ background: '#3b82f6', color: '#fff' }}>Waiting for PO</span>;
      }
      case 'rejected': return <span className="badge badge-status-rejected" style={{ background: '#ef4444', color: '#fff' }}>Rejected</span>;
      default: return <span className="badge">{s}</span>;
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
                    <td>{renderStatusBadge(q)}</td>
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
