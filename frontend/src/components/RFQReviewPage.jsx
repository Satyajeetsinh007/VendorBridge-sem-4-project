import React, { useState } from 'react';

export default function RFQReviewPage({ rfq, onBack, onDecision, manager }) {
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (status) => {
    if (status === 'rejected' && !remarks.trim()) {
      alert('Please provide a remark/reason for rejecting this request.');
      return;
    }
    setSubmitting(true);
    try {
      await onDecision(rfq.id, status, remarks);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'badge badge-priority-high';
      case 'medium': return 'badge badge-priority-medium';
      case 'low': return 'badge badge-priority-low';
      default: return 'badge';
    }
  };

  return (
    <div className="review-container">
      {/* Page Header */}
      <div className="review-header">
        <button className="btn-secondary btn-back" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <div className="review-header-title">
          <h2>RFQ Review</h2>
          <span className="mono-text">{rfq.rfq_number}</span>
        </div>
      </div>

      <div className="review-grid">
        {/* Left Side: RFQ Details */}
        <div className="review-main-panel">
          {/* RFQ Information Card */}
          <div className="table-card info-card">
            <div className="table-header-bar">
              <span className="table-title">General Information</span>
              <span className={getPriorityBadgeClass(rfq.priority)}>{rfq.priority?.toUpperCase()} Priority</span>
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Title</span>
                <span className="info-val">{rfq.title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-val dept-chip">{rfq.department_details?.name || 'ENG'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created By</span>
                <span className="info-val">{rfq.created_by_details?.name || 'Alex Mercer'} ({rfq.created_by_details?.email})</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created Date</span>
                <span className="info-val">{new Date(rfq.created_at).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Quantity</span>
                <span className="info-val" style={{ fontWeight: 700, color: 'var(--accent, #6366f1)', fontSize: '15px' }}>
                  {rfq.quantity ? `${rfq.quantity} units` : '100 units'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Response Deadline</span>
                <span className="info-val">{rfq.deadline}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Required By Date</span>
                <span className="info-val">{rfq.required_by_date || 'None specified'}</span>
              </div>
            </div>

            <div className="info-section">
              <span className="info-label">Description & Technical Scope</span>
              <p className="info-text-area">{rfq.description}</p>
            </div>

            <div className="info-section">
              <span className="info-label">Procurement Justification</span>
              <p className="info-text-area justification">
                This request is essential for replacing end-of-lifecycle department workstations and upgrading local computing clusters. 
                Delayed deployment will bottleneck engineering sprint schedules and IT support tickets. Approved budget code: {rfq.department_details?.code || 'ENG'}-2026-Q3.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Decision Box */}
        <div className="review-sidebar-panel">
          <div className="table-card decision-card">
            <div className="table-header-bar">
              <span className="table-title">Approval Action Portal</span>
            </div>
            <div className="decision-body">
              <p className="decision-instructions">
                Review the items and justification. Approve to publish this RFQ immediately for selected vendor bidding. Reject to return to the Procurement Officer for review.
              </p>

              <div className="field">
                <label>Review Notes / Remarks *</label>
                <textarea
                  placeholder="e.g. Approved for release. Standard terms apply. / Rejected: please check technical specifications and modify quantity..."
                  rows="6"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="decision-actions">
                <button
                  className="btn-primary btn-approve"
                  onClick={() => handleSubmit('approved')}
                  disabled={submitting}
                >
                  Approve & Release RFQ
                </button>
                <button
                  className="btn-action btn-reject"
                  onClick={() => handleSubmit('rejected')}
                  disabled={submitting}
                >
                  Reject Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
