import React, { useState } from 'react';
import { api } from '../services/api';

export default function VendorInvoiceUpload({ po, vendor, onBack, onInvoiceSubmitted, onNotify }) {
  const [invoiceNumber] = useState(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceStatus, setInvoiceStatus] = useState('draft');
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const dueDateStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  // Editable Form Details
  const [invoiceDetails, setInvoiceDetails] = useState({
    vendor_invoice_number: `DELL-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    invoice_date: todayStr,
    due_date: dueDateStr,
    bank_name: 'HDFC Bank Ltd',
    account_number: '50200098765432',
    ifsc_code: 'HDFC0001234',
    upi_id: 'dell.billing@hdfcbank',
    vendor_notes: 'All items delivered in original condition. Payment terms as agreed (Net 30 Days).',
    invoice_pdf_name: 'Invoice_INV-2026-0031.pdf',
    delivery_challan_name: 'Delivery_Challan_DC-8812.pdf',
    eway_bill_name: 'EWay_Bill_EWB-441092.pdf',
    other_docs_name: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setInvoiceDetails(prev => ({ ...prev, [fieldName]: file.name }));
    }
  };

  // Calculations from PO
  const subtotal = parseFloat(po?.subtotal || 125000);
  const cgst = parseFloat(po?.cgst_amount || subtotal * 0.09);
  const sgst = parseFloat(po?.sgst_amount || subtotal * 0.09);
  const igst = parseFloat(po?.igst_amount || 0);
  const discount = parseFloat(po?.discount_amount || 0);
  const grandTotal = parseFloat(po?.grand_total || po?.total_value || subtotal + cgst + sgst + igst - discount);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_verification':
      case 'pending':
        return <span className="badge badge-priority-medium">Pending Verification</span>;
      case 'approved':
        return <span className="badge badge-status-approved">Approved</span>;
      case 'paid':
        return <span className="badge badge-status-open" style={{ background: '#059669', color: '#fff' }}>Paid</span>;
      case 'rejected':
        return <span className="badge badge-status-rejected">Rejected</span>;
      default:
        return <span className="badge badge-status-draft">Draft</span>;
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      setSuccessBanner('Invoice draft saved successfully.');
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (err) {
      alert(`Save draft failed: ${err.message}`);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmitInvoice = async () => {
    setSubmitting(true);
    try {
      const payload = {
        invoice_number: invoiceNumber,
        vendor_invoice_number: invoiceDetails.vendor_invoice_number,
        po: po?.id,
        vendor: vendor?.id,
        invoice_date: invoiceDetails.invoice_date,
        due_date: invoiceDetails.due_date,
        subtotal: subtotal,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        amount: grandTotal,
        bank_name: invoiceDetails.bank_name,
        account_number: invoiceDetails.account_number,
        ifsc_code: invoiceDetails.ifsc_code,
        upi_id: invoiceDetails.upi_id,
        file_url: invoiceDetails.invoice_pdf_name || 'Invoice.pdf',
        delivery_challan_url: invoiceDetails.delivery_challan_name || 'Challan.pdf',
        eway_bill_url: invoiceDetails.eway_bill_name || '',
        status: 'pending_verification',
        notes: invoiceDetails.vendor_notes,
      };

      // Create Invoice in Backend DB
      let createdInv = null;
      try {
        createdInv = await api.createInvoice(payload);
      } catch (e) {
        console.log('Invoice DB create note:', e.message);
      }

      // Update PO Status to 'invoiced'
      if (po?.id) {
        await api.patchPurchaseOrder(po.id, { status: 'invoiced' }).catch(() => {});
      }

      setInvoiceStatus('pending_verification');
      setShowSubmitModal(false);
      const msg = `Invoice submitted successfully. Your invoice ${invoiceNumber} has been sent to the Finance Team for verification.`;
      setSuccessBanner(msg);

      if (onNotify) {
        onNotify(`Invoice ${invoiceNumber} submitted for PO ${po?.po_number || 'PO-2026-0042'}. Pending Finance Verification.`);
      }

      if (onInvoiceSubmitted) {
        onInvoiceSubmitted(createdInv || payload);
      }
    } catch (err) {
      alert(`Invoice submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = invoiceStatus === 'pending_verification' || invoiceStatus === 'approved' || invoiceStatus === 'paid';

  return (
    <div className="qc-page" style={{ paddingBottom: '40px' }}>
      {/* ── Top Navigation & Actions ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="btn-secondary" onClick={onBack}>← Back to Purchase Orders</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setShowPreviewModal(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:'middle'}}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Preview PDF
          </button>
          <button className="btn-secondary" onClick={() => alert(`Downloading ${invoiceNumber}.pdf...`)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:'middle'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Invoice
          </button>
          {!isSubmitted && (
            <>
              <button className="btn-secondary" onClick={handleSaveDraft} disabled={savingDraft}>
                {savingDraft ? 'Saving…' : 'Save Draft'}
              </button>
              <button className="btn-primary" onClick={() => setShowSubmitModal(true)} style={{ background: '#22c55e', borderColor: '#22c55e' }}>
                Submit Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Success Banner ── */}
      {successBanner && (
        <div className="state-banner info" style={{ marginBottom: '20px', padding: '14px 18px', fontSize: '14px', background: 'rgba(34, 197, 94, 0.15)', borderColor: '#34d399', color: '#34d399' }}>
          {successBanner}
        </div>
      )}

      {/* ── Invoice Header Card ── */}
      <section className="table-card" style={{ padding: '24px', marginBottom: '20px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                Invoice {invoiceNumber}
              </h1>
              {getStatusBadge(invoiceStatus)}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Auto-Generated from Purchase Order <strong>{po?.po_number || 'PO-2026-0042'}</strong> · Date: <strong>{invoiceDetails.invoice_date}</strong>
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
              Reference RFQ
            </span>
            <span className="mono-text" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
              {po?.rfq_number || 'RFQ-2026-8215'}
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {po?.rfq_title || 'Laptops & Workstations Procurement'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Grid: Buyer & Vendor Information (Read Only) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Buyer Info */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title" style={{ fontSize: '14px' }}>Buyer Information (Read Only)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div className="info-row"><span className="info-label">Company Name</span><span className="info-val" style={{ fontWeight: 700 }}>VendorBridge Enterprise Systems Pvt Ltd</span></div>
            <div className="info-row"><span className="info-label">Company Address</span><span className="info-val">Tech Park One, Tower B, Level 6, Cyber City, Bangalore - 560103</span></div>
            <div className="info-row"><span className="info-label">Procurement Officer</span><span className="info-val">Alex Mercer (Senior Officer)</span></div>
            <div className="info-row"><span className="info-label">Contact Email</span><span className="info-val">finance@vendorbridge.com</span></div>
            <div className="info-row"><span className="info-label">GST Number</span><span className="info-val mono-text">29AAAAA0000A1Z5</span></div>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title" style={{ fontSize: '14px' }}>Vendor Information (Read Only)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div className="info-row"><span className="info-label">Vendor Name</span><span className="info-val" style={{ fontWeight: 700, color: 'var(--accent)' }}>{vendor?.name || 'Dell Technologies'}</span></div>
            <div className="info-row"><span className="info-label">GST Number</span><span className="info-val mono-text">{vendor?.gst_number || '27AAACD4567E1Z9'}</span></div>
            <div className="info-row"><span className="info-label">Contact Person</span><span className="info-val">{vendor?.contact_person || 'Rajesh Kumar'}</span></div>
            <div className="info-row"><span className="info-label">Email & Phone</span><span className="info-val">{vendor?.email || 'sales@dell.com'} · {vendor?.phone || '+91 98765 12345'}</span></div>
          </div>
        </div>
      </div>

      {/* ── Invoice Items Table (Auto-populated from PO) ── */}
      <section className="table-card" style={{ marginBottom: '20px' }}>
        <div className="table-header-bar">
          <span className="table-title">Invoice Items</span>
          <span className="table-count">Populated from PO {po?.po_number || 'PO-2026-0042'}</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th className="num-cell">Quantity</th>
                <th className="num-cell">Unit Price (₹)</th>
                <th className="num-cell">Tax %</th>
                <th className="num-cell">Line Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cell-primary">{po?.item_name || 'High Performance Laptops & Equipment'}</td>
                <td className="num-cell" style={{ fontWeight: 600 }}>{po?.quantity || 10}</td>
                <td className="num-cell">₹{(po?.unit_price || 12500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="num-cell">{po?.tax_rate || '18% GST'}</td>
                <td className="num-cell" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Editable Invoice Details & Financial Summary Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Editable Invoice Details */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title">Editable Invoice & Payment Details</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="field-row">
              <div className="field">
                <label>Vendor Invoice Number *</label>
                <input
                  type="text"
                  name="vendor_invoice_number"
                  value={invoiceDetails.vendor_invoice_number}
                  onChange={handleChange}
                  disabled={isSubmitted}
                />
              </div>
              <div className="field">
                <label>Invoice Date *</label>
                <input
                  type="date"
                  name="invoice_date"
                  value={invoiceDetails.invoice_date}
                  onChange={handleChange}
                  disabled={isSubmitted}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Payment Due Date *</label>
                <input
                  type="date"
                  name="due_date"
                  value={invoiceDetails.due_date}
                  onChange={handleChange}
                  disabled={isSubmitted}
                />
              </div>
              <div className="field">
                <label>Bank Name *</label>
                <input
                  type="text"
                  name="bank_name"
                  value={invoiceDetails.bank_name}
                  onChange={handleChange}
                  disabled={isSubmitted}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Account Number *</label>
                <input
                  type="text"
                  name="account_number"
                  value={invoiceDetails.account_number}
                  onChange={handleChange}
                  disabled={isSubmitted}
                />
              </div>
              <div className="field">
                <label>IFSC Code *</label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={invoiceDetails.ifsc_code}
                  onChange={handleChange}
                  disabled={isSubmitted}
                />
              </div>
            </div>

            <div className="field">
              <label>UPI ID (Optional)</label>
              <input
                type="text"
                name="upi_id"
                value={invoiceDetails.upi_id}
                onChange={handleChange}
                disabled={isSubmitted}
                placeholder="e.g. vendor.business@bank"
              />
            </div>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="table-card decision-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title">Financial Summary</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span className="mono-text" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>CGST (9%)</span>
              <span className="mono-text">+ ₹ {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>SGST (9%)</span>
              <span className="mono-text">+ ₹ {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                <span>Discount</span>
                <span className="mono-text">- ₹ {discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
              <span style={{ color: 'var(--text-primary)' }}>Grand Total</span>
              <span className="mono-text" style={{ color: 'var(--accent)', fontSize: '18px' }}>
                ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Supporting Documents & Vendor Notes Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* File Uploads */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title">Supporting Documents Upload</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="field">
              <label>Invoice PDF *</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="file" disabled={isSubmitted} onChange={e => handleFileChange(e, 'invoice_pdf_name')} style={{ fontSize: '12.5px' }} />
                <span style={{ fontSize: '12px', color: 'var(--accent)' }}>{invoiceDetails.invoice_pdf_name}</span>
              </div>
            </div>

            <div className="field">
              <label>Delivery Challan *</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="file" disabled={isSubmitted} onChange={e => handleFileChange(e, 'delivery_challan_name')} style={{ fontSize: '12.5px' }} />
                <span style={{ fontSize: '12px', color: 'var(--accent)' }}>{invoiceDetails.delivery_challan_name}</span>
              </div>
            </div>

            <div className="field">
              <label>E-Way Bill (Optional)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="file" disabled={isSubmitted} onChange={e => handleFileChange(e, 'eway_bill_name')} style={{ fontSize: '12.5px' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{invoiceDetails.eway_bill_name || 'No file chosen'}</span>
              </div>
            </div>

            <div className="field">
              <label>Other Supporting Documents (Optional)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="file" disabled={isSubmitted} onChange={e => handleFileChange(e, 'other_docs_name')} style={{ fontSize: '12.5px' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{invoiceDetails.other_docs_name || 'No file chosen'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Notes */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title">Vendor Billing Notes</span>
          </div>

          <div className="field">
            <textarea
              name="vendor_notes"
              rows="7"
              value={invoiceDetails.vendor_notes}
              onChange={handleChange}
              disabled={isSubmitted}
              placeholder="Additional billing information..."
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* ── Updated 9-Step Purchase Order Timeline ── */}
      <section className="table-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div className="table-header-bar" style={{ marginBottom: '20px' }}>
          <span className="table-title">Purchase & Invoice Lifecycle Timeline</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {[
            { step: '1', title: 'RFQ Received', done: true },
            { step: '2', title: 'Quotation Submitted', done: true },
            { step: '3', title: 'Quotation Selected', done: true },
            { step: '4', title: 'Purchase Order Received', done: true },
            { step: '5', title: 'Purchase Order Acknowledged', done: true },
            { step: '6', title: 'Order Fulfillment Started', done: true },
            { step: '7', title: 'Goods Delivered', done: true },
            { step: '8', title: 'Invoice Submitted', done: isSubmitted, current: !isSubmitted },
            { step: '9', title: 'Waiting for Finance Verification', done: false, current: isSubmitted },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: item.done ? '#22c55e' : item.current ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                color: item.done || item.current ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '13px', marginBottom: '8px'
              }}>
                {item.done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : item.step}
              </div>
              <span style={{ fontSize: '11px', fontWeight: item.current ? 700 : 500, color: item.current ? 'var(--accent)' : 'var(--text-primary)', textAlign: 'center' }}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Action Panel ── */}
      {!isSubmitted && (
        <div className="table-card decision-card" style={{ padding: '24px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Invoice Submission</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                Review all invoice details and payment terms before submitting to the Finance Team.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setShowPreviewModal(true)}>
                Preview PDF
              </button>
              <button className="btn-primary" style={{ background: '#22c55e', borderColor: '#22c55e' }} onClick={() => setShowSubmitModal(true)}>
                Submit Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMIT CONFIRMATION MODAL ── */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-head">
              <h2 className="modal-title">Submit Invoice</h2>
              <button className="modal-close" onClick={() => setShowSubmitModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="modal-body" style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>
                Invoice Number: {invoiceNumber}
              </p>
              <p style={{ margin: 0 }}>
                This invoice will be sent to the Finance Team for verification and payment processing according to agreed payment terms.
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setShowSubmitModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: '#22c55e', borderColor: '#22c55e' }} onClick={handleSubmitInvoice} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICE PREVIEW MODAL ── */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', background: '#fff', color: '#0f172a' }}>
            <div className="modal-head" style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div>
                <h2 className="modal-title" style={{ color: '#0f172a' }}>Invoice Preview ({invoiceNumber})</h2>
                <p className="modal-subtitle" style={{ color: '#64748b' }}>Tax Invoice Document Preview</p>
              </div>
              <button className="modal-close" style={{ color: '#64748b' }} onClick={() => setShowPreviewModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>

            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '30px', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{vendor?.name || 'Dell Technologies'}</h1>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>GSTIN: {vendor?.gst_number || '27AAACD4567E1Z9'}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>{vendor?.address || 'Bangalore, India'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: 0, fontSize: '20px', color: '#16a34a' }}>TAX INVOICE</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 700 }}>{invoiceNumber}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>Vendor Inv: {invoiceDetails.vendor_invoice_number}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>Date: {invoiceDetails.invoice_date}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '12.5px' }}>
                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', color: '#16a34a', marginBottom: '6px' }}>BILLED TO (BUYER)</strong>
                  <strong>VendorBridge Enterprise Systems Pvt Ltd</strong><br />
                  GSTIN: 29AAAAA0000A1Z5<br />
                  Address: Tech Park One, Cyber City, Bangalore - 560103
                </div>
                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', color: '#16a34a', marginBottom: '6px' }}>PAYMENT & BANK DETAILS</strong>
                  Bank: {invoiceDetails.bank_name}<br />
                  A/C No: {invoiceDetails.account_number}<br />
                  IFSC: {invoiceDetails.ifsc_code}<br />
                  Due Date: <strong>{invoiceDetails.due_date}</strong>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Item Description</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Price (₹)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <strong>{po?.item_name || 'High Performance Laptops & Equipment'}</strong>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{po?.quantity || 10}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{(po?.unit_price || 12500).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', fontSize: '13px' }}>
                <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>CGST (9%):</span><span>₹{cgst.toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>SGST (9%):</span><span>₹{sgst.toLocaleString('en-IN')}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', borderTop: '2px solid #0f172a', paddingTop: '6px', color: '#16a34a' }}>
                    <span>Grand Total:</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-foot" style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setShowPreviewModal(false)}>Close Preview</button>
              <button className="btn-primary" onClick={() => alert('Printing Invoice...')}>🖨 Print Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
