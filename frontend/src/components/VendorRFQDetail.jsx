import React, { useState } from 'react';
import { api } from '../services/api';

export default function VendorRFQDetail({ rfq, vendor, existingQuotation, onBack, onSubmitted }) {
  const isDeadlinePassed = new Date(rfq.deadline) < new Date();
  const hasExisting = !!existingQuotation;
  const isReadOnly = hasExisting && existingQuotation.status !== 'draft';

  const [formData, setFormData] = useState({
    unit_price: existingQuotation?.unit_price || '',
    delivery_days: existingQuotation?.delivery_days || '',
    payment_terms: existingQuotation?.payment_terms || 'Net 30',
    notes: existingQuotation?.notes || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (asDraft) => {
    if (!formData.unit_price || !formData.delivery_days) {
      alert('Please fill in Unit Price and Delivery Days.');
      return;
    }
    setSubmitting(true);
    try {
      const totalPrice = parseFloat(formData.unit_price) * rfq.quantity;
      const payload = {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        total_price: totalPrice,
        delivery_days: parseInt(formData.delivery_days),
        rfq: rfq.id,
        vendor: vendor.id,
        status: asDraft ? 'draft' : 'submitted',
        submitted_at: asDraft ? null : new Date().toISOString(),
      };

      if (hasExisting) {
        await api.patchQuotation(existingQuotation.id, payload);
      } else {
        await api.createQuotation(payload);
      }
      onSubmitted();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const mockItems = [
    { name: 'Primary Equipment / Hardware', qty: rfq.quantity, spec: rfq.description?.substring(0, 80) + '…' },
    { name: 'Installation & Commissioning', qty: 1, spec: 'On-site setup, testing, and handover' },
  ];

  const getPriorityClass = (p) => `badge badge-priority-${p}`;

  return (
    <div className="review-container">
      <div className="review-header">
        <button className="btn-secondary btn-back" onClick={onBack}>← Back</button>
        <div className="review-header-title">
          <h2>RFQ Details</h2>
          <span className="mono-text">{rfq.rfq_number}</span>
        </div>
      </div>

      <div className="review-grid">
        {/* Left: RFQ Info */}
        <div className="review-main-panel">
          <div className="table-card info-card">
            <div className="table-header-bar">
              <span className="table-title">General Information</span>
              <span className={getPriorityClass(rfq.priority)}>{rfq.priority?.toUpperCase()}</span>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Title</span>
                <span className="info-val">{rfq.title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-val dept-chip">{rfq.department_details?.name || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Quantity Required</span>
                <span className="info-val">{rfq.quantity?.toLocaleString()} units</span>
              </div>
              <div className="info-item">
                <span className="info-label">Submission Deadline</span>
                <span className="info-val" style={isDeadlinePassed ? { color: '#f87171' } : {}}>
                  {rfq.deadline} {isDeadlinePassed ? '(Expired)' : ''}
                </span>
              </div>
            </div>
            <div className="info-section">
              <span className="info-label">Description & Specifications</span>
              <p className="info-text-area">{rfq.description}</p>
            </div>
            {rfq.specs_file_url && (
              <div className="info-section">
                <span className="info-label">Attachments</span>
                <a href={rfq.specs_file_url} target="_blank" rel="noreferrer" className="download-link">
                  📎 View Specification Document
                </a>
              </div>
            )}
          </div>

          {/* Requested Items */}
          <div className="table-card">
            <div className="table-header-bar">
              <span className="table-title">Requested Items</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Specifications</th>
                </tr>
              </thead>
              <tbody>
                {mockItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="cell-primary">{item.name}</td>
                    <td className="num-cell">{item.qty}</td>
                    <td><span className="cell-sub">{item.spec}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quotation Form */}
        <div className="review-sidebar-panel">
          <div className="table-card decision-card">
            <div className="table-header-bar">
              <span className="table-title">
                {isReadOnly ? 'Quotation (Submitted)' : hasExisting ? 'Edit Quotation' : 'Submit Quotation'}
              </span>
            </div>

            {isDeadlinePassed && !hasExisting ? (
              <div className="decision-body">
                <div className="state-banner error" style={{ margin: 0 }}>
                  The deadline for this RFQ has passed. Quotation submission is closed.
                </div>
              </div>
            ) : (
              <div className="decision-body">
                {isReadOnly && (
                  <div className="state-banner info" style={{ margin: 0, padding: '8px 12px' }}>
                    This quotation has been submitted and is read-only.
                    {existingQuotation.status === 'selected' && ' 🎉 Your quotation was selected!'}
                    {existingQuotation.status === 'rejected' && ' This quotation was not selected.'}
                  </div>
                )}

                <div className="field">
                  <label>Unit Price (₹) *</label>
                  <input
                    type="number"
                    name="unit_price"
                    min="0"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    placeholder="e.g. 12500.00"
                  />
                </div>

                {formData.unit_price && (
                  <div className="field">
                    <label>Total Price (auto-calculated)</label>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>
                      ₹ {(parseFloat(formData.unit_price) * rfq.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}

                <div className="field">
                  <label>Delivery Time (Days) *</label>
                  <input
                    type="number"
                    name="delivery_days"
                    min="1"
                    value={formData.delivery_days}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    placeholder="e.g. 14"
                  />
                </div>

                <div className="field">
                  <label>Payment Terms</label>
                  <select name="payment_terms" value={formData.payment_terms} onChange={handleChange} disabled={isReadOnly}>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                    <option value="Net 90">Net 90 Days</option>
                    <option value="Advance">100% Advance</option>
                    <option value="50-50">50% Advance + 50% on Delivery</option>
                  </select>
                </div>

                <div className="field">
                  <label>Notes / Remarks</label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    placeholder="Any additional information, warranty details, terms..."
                  />
                </div>

                {!isReadOnly && (
                  <div className="decision-actions">
                    <button className="btn-secondary" onClick={() => handleSave(true)} disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
                      {submitting ? 'Saving…' : '💾 Save as Draft'}
                    </button>
                    {!isDeadlinePassed && (
                      <button className="btn-primary btn-approve" onClick={() => handleSave(false)} disabled={submitting}>
                        {submitting ? 'Submitting…' : '📩 Submit Quotation'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
