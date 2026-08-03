import React, { useState } from 'react';

export default function VendorHistory({ quotations }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Only show submitted/selected/rejected (not drafts)
  const historicalQuotations = quotations.filter(q => q.status !== 'draft');

  const filtered = historicalQuotations.filter(q => {
    const matchesStatus = !statusFilter || q.status === statusFilter;
    let matchesDate = true;
    if (startDate || endDate) {
      const submitted = new Date(q.submitted_at || q.created_at);
      if (startDate && submitted < new Date(startDate)) matchesDate = false;
      if (endDate && submitted > new Date(endDate + 'T23:59:59')) matchesDate = false;
    }
    return matchesStatus && matchesDate;
  });

  const getStatusBadge = (s) => {
    switch (s) {
      case 'submitted': return 'badge badge-status-pending_approval';
      case 'selected': return 'badge badge-status-open';
      case 'rejected': return 'badge badge-status-rejected';
      default: return 'badge badge-status-draft';
    }
  };

  return (
    <div>
      <section className="toolbar history-toolbar" style={{ marginBottom: '20px' }}>
        <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="field">
            <label>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="selected">Selected</option>
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
          <span className="table-title">Quotation History</span>
          <span className="table-count">{filtered.length} records</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quotation #</th>
                <th>RFQ Number</th>
                <th>Department</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Decision</th>
                <th>Submitted Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state"><p>No historical quotations match your filters.</p></td>
                </tr>
              ) : (
                filtered.map(q => (
                  <tr key={q.id}>
                    <td><span className="mono-text">{q.quotation_number}</span></td>
                    <td>
                      <span className="cell-primary">{q.rfq_details?.rfq_number}</span>
                      <span className="cell-sub">{q.rfq_details?.title}</span>
                    </td>
                    <td><span className="dept-chip">{q.rfq_details?.department_details?.code || '—'}</span></td>
                    <td className="num-cell">₹{parseFloat(q.unit_price).toLocaleString('en-IN')}</td>
                    <td className="num-cell">₹{parseFloat(q.total_price).toLocaleString('en-IN')}</td>
                    <td><span className={getStatusBadge(q.status)}>{q.status}</span></td>
                    <td className="date-cell">
                      {q.submitted_at ? new Date(q.submitted_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) : '—'}
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
