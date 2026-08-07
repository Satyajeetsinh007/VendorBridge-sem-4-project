import React, { useState } from 'react';

export default function ApprovalHistory({ approvals, departments, users, onViewDetails }) {
  // Filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter logic
  const filteredApprovals = approvals.filter(item => {
    // Reference details from reference object. 
    // In our seed setup, we link reference_id to the RFQ ID. 
    // We will attach dynamic details from target objects.
    const matchesDept = !selectedDept || item.rfq_details?.department === selectedDept;
    const matchesStatus = !selectedStatus || item.status === selectedStatus.toLowerCase();
    const matchesOfficer = !selectedOfficer || item.rfq_details?.created_by === selectedOfficer;
    
    let matchesDate = true;
    if (startDate || endDate) {
      const decisionDate = new Date(item.decided_at || item.submitted_at);
      if (startDate && decisionDate < new Date(startDate)) matchesDate = false;
      if (endDate && decisionDate > new Date(endDate + 'T23:59:59')) matchesDate = false;
    }

    return matchesDept && matchesStatus && matchesOfficer && matchesDate;
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'badge badge-status-open';
      case 'rejected': return 'badge badge-status-rejected';
      default: return 'badge badge-status-draft';
    }
  };

  return (
    <div className="history-container">
      {/* Filters Bar */}
      <section className="toolbar history-toolbar">
        <div className="filter-grid">
          <div className="field">
            <label>Department</label>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="field">
            <label>Procurement Officer</label>
            <select value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)}>
              <option value="">All Officers</option>
              {users.filter(u => u.role === 'procurement_officer').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>From Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="field">
            <label>To Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Main Table */}
      <section className="table-card">
        <div className="table-header-bar">
          <span className="table-title">Approval Decision Records</span>
          <span className="table-count">
            {filteredApprovals.length} {filteredApprovals.length === 1 ? 'record' : 'records'} found
          </span>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Approval #</th>
                <th>RFQ Number</th>
                <th>Department</th>
                <th>Officer</th>
                <th>Decision</th>
                <th>Decision Date</th>
                <th>Remarks</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <p>No decision logs match your selected filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredApprovals.map(log => (
                  <tr key={log.id}>
                    <td><span className="mono-text">{log.approval_number}</span></td>
                    <td className="cell-primary">{log.rfq_details?.rfq_number || 'RFQ-2026'}</td>
                    <td>
                      <span className="dept-chip">
                        {log.rfq_details?.department_code || 'ENG'}
                      </span>
                    </td>
                    <td><span className="cell-sub">{log.rfq_details?.created_by_name || 'Alex Mercer'}</span></td>
                    <td>
                      <span className={getStatusBadgeClass(log.status)}>
                        {log.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(log.decided_at || log.submitted_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <span className="cell-sub cell-desc" title={log.remarks}>{log.remarks || '—'}</span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-secondary"
                        onClick={() => onViewDetails(log.rfq_details)}
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        View RFQ Details
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
  );
}
