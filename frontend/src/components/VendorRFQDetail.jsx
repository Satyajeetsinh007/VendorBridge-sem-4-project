import React, { useState } from 'react';
import { api } from '../services/api';

export default function VendorRFQDetail({ rfq, vendor, existingQuotation, onBack, onSubmitted }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultValidUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const isDeadlinePassed = rfq.deadline ? rfq.deadline < todayStr : false;
  const isClosed = rfq.status === 'closed' || isDeadlinePassed;
  const hasExisting = !!existingQuotation;
  const isReadOnly = isClosed || (hasExisting && existingQuotation.status !== 'draft');

  const [formData, setFormData] = useState({
    unit_price: existingQuotation?.unit_price || '',
    delivery_days: existingQuotation?.delivery_days || '',
    payment_terms: existingQuotation?.payment_terms || 'Net 30',
    warranty: existingQuotation?.warranty || '2 Years',
    valid_until: existingQuotation?.valid_until || defaultValidUntil,
    tax_type: existingQuotation?.tax_type || 'GST_9_9',
    attachment_url: existingQuotation?.attachment_url || '',
    notes: existingQuotation?.notes || '',
  });
  const [fileName, setFileName] = useState(existingQuotation?.attachment_url ? 'quotation.pdf' : '');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      // Simulate file upload URL
      setFormData(prev => ({
        ...prev,
        attachment_url: `https://vendorbridge.s3.amazonaws.com/quotations/${file.name}`,
      }));
    }
  };

  // Realistic Tax Calculations
  const qty = rfq.quantity || 1;
  const unitPrice = parseFloat(formData.unit_price) || 0;
  const subtotal = unitPrice * qty;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (formData.tax_type === 'GST_9_9') {
    cgst = subtotal * 0.09;
    sgst = subtotal * 0.09;
  } else if (formData.tax_type === 'IGST_18') {
    igst = subtotal * 0.18;
  }

  const totalTax = cgst + sgst + igst;
  const grandTotal = subtotal + totalTax;

  const handleSave = async (asDraft) => {
    if (!formData.unit_price || !formData.delivery_days) {
      alert('Please fill in Unit Price and Delivery Days.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        subtotal: subtotal,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        total_price: grandTotal,
        delivery_days: parseInt(formData.delivery_days),
        rfq: rfq.id,
        vendor: vendor.id,
        status: asDraft ? 'draft' : 'submitted',
        submitted_at: asDraft ? null : new Date().toISOString(),
        attachment_url: formData.attachment_url || 'https://vendorbridge.s3.amazonaws.com/quotations/quotation.pdf',
      };

      if (hasExisting) {
        await api.patchQuotation(existingQuotation.id, payload);
      } else {
        await api.createQuotation(payload);
      }

      if (!asDraft) {
        await api.patchRFQ(rfq.id, { status: 'under_review' });
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
              <span className="table-title">Requirement Overview</span>
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
                <span className="info-val" style={isClosed ? { color: '#f87171' } : {}}>
                  {rfq.deadline} {isClosed ? '(Closed)' : ''}
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
                {isClosed ? 'RFQ Closed' : isReadOnly ? 'Quotation (Submitted)' : hasExisting ? 'Edit Quotation' : 'Submit Quotation'}
              </span>
            </div>

            {isClosed && !hasExisting ? (
              <div className="decision-body">
                <div className="state-banner error" style={{ margin: 0, padding: '12px' }}>
                  🔒 The deadline for this RFQ has been reached. Quotation submission is closed.
                </div>
              </div>
            ) : (
              <div className="decision-body">
                {isClosed && hasExisting && (
                  <div className="state-banner error" style={{ margin: 0, padding: '10px 12px' }}>
                    🔒 The deadline for this RFQ has been reached. No further edits are allowed.
                  </div>
                )}
                {isReadOnly && !isClosed && (
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

                <div className="field">
                  <label>Tax Structure (GST)</label>
                  <select name="tax_type" value={formData.tax_type} onChange={handleChange} disabled={isReadOnly}>
                    <option value="GST_9_9">Intra-State GST (CGST 9% + SGST 9% = 18%)</option>
                    <option value="IGST_18">Inter-State IGST (IGST 18%)</option>
                    <option value="EXEMPT">Tax Exempt (0%)</option>
                  </select>
                </div>

                {/* Tax Breakdown Box */}
                {formData.unit_price > 0 && (
                  <div className="table-card" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Detailed Tax Breakdown
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      <span>Subtotal ({qty} units × ₹{unitPrice.toLocaleString('en-IN')})</span>
                      <span className="mono-text" style={{ color: 'var(--text-primary)' }}>₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {formData.tax_type === 'GST_9_9' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          <span>CGST (9%)</span>
                          <span className="mono-text" style={{ color: 'var(--text-secondary)' }}>+ ₹ {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          <span>SGST (9%)</span>
                          <span className="mono-text" style={{ color: 'var(--text-secondary)' }}>+ ₹ {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    )}

                    {formData.tax_type === 'IGST_18' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        <span>IGST (18%)</span>
                        <span className="mono-text" style={{ color: 'var(--text-secondary)' }}>+ ₹ {igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-primary)' }}>Grand Total</span>
                      <span className="mono-text" style={{ color: 'var(--accent)', fontSize: '15px' }}>
                        ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="field-row">
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
                    <label>Warranty Period *</label>
                    <select name="warranty" value={formData.warranty} onChange={handleChange} disabled={isReadOnly}>
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3 Years">3 Years</option>
                      <option value="5 Years">5 Years</option>
                    </select>
                  </div>
                </div>

                <div className="field-row">
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
                    <label>Quotation Valid Until *</label>
                    <input
                      type="date"
                      name="valid_until"
                      value={formData.valid_until}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                {/* Quotation Document Upload */}
                <div className="field">
                  <label>Quotation Attachment (PDF)</label>
                  {!isReadOnly ? (
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                  ) : (
                    <a href={formData.attachment_url || '#'} target="_blank" rel="noreferrer" className="download-link" style={{ fontSize: '13px' }}>
                      📄 {fileName || 'quotation.pdf'} (Download Document)
                    </a>
                  )}
                  {fileName && !isReadOnly && (
                    <span style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', display: 'block' }}>
                      ✓ Attached: {fileName}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label>Notes / Technical Remarks</label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    placeholder="Technical specifications, exclusions, support details..."
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
