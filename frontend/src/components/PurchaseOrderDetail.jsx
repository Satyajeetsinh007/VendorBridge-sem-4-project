import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function PurchaseOrderDetail({ po, rfq, quotation, vendor, onBack, onUpdated }) {
  const [poStatus, setPoStatus] = useState(po?.status || 'draft');

  useEffect(() => {
    if (po?.status) {
      setPoStatus(po.status);
    }
  }, [po?.status]);
  const [saving, setSaving] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Delivery details state
  const [deliveryData, setDeliveryData] = useState({
    delivery_address: po?.delivery_address || 'VendorBridge Tech Park, Gate #3, Central Warehouse, Sector 62, Noida, UP - 201309',
    delivery_contact_person: po?.delivery_contact_person || 'Rajesh Sharma (Logistics Lead)',
    delivery_phone: po?.delivery_phone || '+91 98112 34567',
    expected_delivery_date: po?.expected_delivery_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    delivery_instructions: po?.delivery_instructions || 'Deliver between 9:00 AM and 5:00 PM on working days. Requires Gate Pass & Quality Inspection on unloading.',
    procurement_notes: po?.procurement_notes || 'All equipment must be packaged in original tamper-evident anti-static boxes. Serial numbers must be printed on the invoice.',
    discount_amount: po?.discount_amount || 0,
  });

  const isIssued = poStatus === 'issued' || poStatus === 'acknowledged' || poStatus === 'in_progress' || poStatus === 'delivered' || poStatus === 'invoiced';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData(prev => ({ ...prev, [name]: value }));
  };

  // Item & Financial Breakdown Calculations
  const qty = rfq?.quantity || quotation?.quantity || 10;
  const unitPrice = parseFloat(quotation?.unit_price) || 12500;
  const subtotal = unitPrice * qty;

  const taxType = quotation?.tax_type || 'GST_9_9';
  let cgst = taxType === 'GST_9_9' ? subtotal * 0.09 : 0;
  let sgst = taxType === 'GST_9_9' ? subtotal * 0.09 : 0;
  let igst = taxType === 'IGST_18' ? subtotal * 0.18 : 0;
  const discount = parseFloat(deliveryData.discount_amount) || 0;

  const grandTotal = subtotal + cgst + sgst + igst - discount;

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        ...deliveryData,
        subtotal,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        total_value: grandTotal,
        status: 'draft',
      };
      if (po?.id) {
        await api.patchPurchaseOrder(po.id, payload);
      }
      setSuccessBanner('💾 Purchase Order draft updated successfully!');
      setTimeout(() => setSuccessBanner(''), 4000);
      if (onUpdated) onUpdated();
    } catch (err) {
      alert(`Error saving draft: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleIssuePO = async () => {
    if (!window.confirm(`Are you sure you want to issue Purchase Order PO-2026-${po?.po_number ? po.po_number.split('-').pop() : '0042'} to ${vendor?.name || 'the vendor'}?`)) {
      return;
    }
    setIssuing(true);
    try {
      const payload = {
        ...deliveryData,
        subtotal,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        total_value: grandTotal,
        status: 'issued',
        issued_at: new Date().toISOString(),
      };
      if (po?.id) {
        await api.patchPurchaseOrder(po.id, payload);
      }
      setPoStatus('issued');
      setSuccessBanner(`🎉 Purchase Order PO-2026-${po?.po_number ? po.po_number.split('-').pop() : '0042'} has been successfully ISSUED to ${vendor?.name || 'Vendor'}! In-app notification sent.`);
      if (onUpdated) onUpdated();
    } catch (err) {
      alert(`Error issuing PO: ${err.message}`);
    } finally {
      setIssuing(false);
    }
  };

  const poNumberDisplay = po?.po_number || 'PO-2026-0042';
  const poDateDisplay = po?.created_at
    ? new Date(po.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const getStatusBadge = (st) => {
    switch (st) {
      case 'issued': return <span className="badge badge-status-approved">ISSUED</span>;
      case 'acknowledged': return <span className="badge badge-status-open">ACKNOWLEDGED</span>;
      case 'in_progress': return <span className="badge badge-priority-medium">IN PROGRESS</span>;
      case 'delivered': return <span className="badge badge-status-approved" style={{ background: '#059669', color: '#fff' }}>DELIVERED</span>;
      case 'invoiced': return <span className="badge badge-priority-medium" style={{ background: '#8b5cf6', color: '#fff' }}>INVOICED</span>;
      case 'cancelled': return <span className="badge badge-status-rejected">CANCELLED</span>;
      default: return <span className="badge badge-status-draft">{st ? st.toUpperCase() : 'DRAFT'}</span>;
    }
  };

  return (
    <div className="qc-page" style={{ paddingBottom: '40px' }}>
      {/* ── Page Top Navigation & Actions ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="btn-secondary" onClick={onBack}>← Back to Dashboard</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setShowPreviewModal(true)}>
            👁 Preview Purchase Order
          </button>
          <button className="btn-secondary" onClick={() => alert(`Downloading ${poNumberDisplay}.pdf ...`)}>
            📥 Download PDF
          </button>
          {!isIssued && (
            <>
              <button className="btn-secondary" onClick={handleSaveDraft} disabled={saving}>
                {saving ? 'Saving…' : '💾 Save Draft'}
              </button>
              <button className="btn-primary" onClick={handleIssuePO} disabled={issuing} style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>
                {issuing ? 'Issuing…' : '🚀 Issue Purchase Order'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Success Alert Banner ── */}
      {successBanner && (
        <div className="state-banner info" style={{ marginBottom: '20px', padding: '14px 18px', fontSize: '14px', background: 'rgba(34, 197, 94, 0.15)', borderColor: '#34d399', color: '#34d399' }}>
          {successBanner}
        </div>
      )}

      {/* ── Purchase Order Header Card ── */}
      <section className="table-card" style={{ padding: '24px', marginBottom: '20px', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                Purchase Order {poNumberDisplay}
              </h1>
              {getStatusBadge(poStatus)}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Generated on {poDateDisplay} · Based on Approved Quotation <strong>{quotation?.quotation_number || 'QTN-2026-3869'}</strong>
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
              Reference RFQ
            </span>
            <span className="mono-text" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
              {rfq?.rfq_number || 'RFQ-2026-8215'}
            </span>
            <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {rfq?.title || 'Laptops & Workstations Procurement'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Grid: Company & Vendor Info ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Buyer Company Info */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title" style={{ fontSize: '14px' }}>🏢 Buyer Information (Company)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div className="info-row"><span className="info-label">Company Name</span><span className="info-val" style={{ fontWeight: 700 }}>VendorBridge Enterprise Systems Pvt Ltd</span></div>
            <div className="info-row"><span className="info-label">Procurement Officer</span><span className="info-val">Alex Mercer (Senior Officer)</span></div>
            <div className="info-row"><span className="info-label">Company Address</span><span className="info-val">Tech Park One, Tower B, Level 6, Cyber City, Cyberabad, PB 560103</span></div>
            <div className="info-row"><span className="info-label">Contact Email</span><span className="info-val">procurement@vendorbridge.com</span></div>
            <div className="info-row"><span className="info-label">Contact Phone</span><span className="info-val">+91 98765 43210</span></div>
          </div>
        </div>

        {/* Supplier Vendor Info */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title" style={{ fontSize: '14px' }}>🏬 Supplier Information (Selected Vendor)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div className="info-row">
              <span className="info-label">Vendor Name</span>
              <span className="info-val" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                {vendor?.name || 'Dell Technologies'}
              </span>
            </div>
            <div className="info-row"><span className="info-label">Vendor Code / Category</span><span className="info-val">{vendor?.vendor_code || 'VND-DELL'} ({vendor?.category || 'IT Hardware'})</span></div>
            <div className="info-row"><span className="info-label">Contact Person</span><span className="info-val">{vendor?.contact_person || 'Rajesh Kumar (Enterprise Manager)'}</span></div>
            <div className="info-row"><span className="info-label">Email & Phone</span><span className="info-val">{vendor?.email || 'sales@dell.com'} · {vendor?.phone || '+91 98765 12345'}</span></div>
            <div className="info-row"><span className="info-label">GST Number</span><span className="info-val mono-text">{vendor?.gst_number || '27AAACD4567E1Z9'}</span></div>
            <div className="info-row"><span className="info-label">Address & Rating</span><span className="info-val">{vendor?.address || 'Dell India Pvt Ltd, Inner Ring Rd, Bangalore'} · ⭐ {vendor?.rating || '4.85'}/5</span></div>
          </div>
        </div>
      </div>

      {/* ── Ordered Items Table ── */}
      <section className="table-card" style={{ marginBottom: '20px' }}>
        <div className="table-header-bar">
          <span className="table-title">Ordered Items</span>
          <span className="table-count">Populated from Quotation {quotation?.quotation_number || 'QTN-2026-3869'}</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Description & Specs</th>
                <th className="num-cell">Quantity</th>
                <th>Unit</th>
                <th className="num-cell">Unit Price (₹)</th>
                <th className="num-cell">Tax Rate</th>
                <th className="num-cell">Line Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="cell-primary">{rfq?.title || 'High Performance Laptops & Equipment'}</td>
                <td>
                  <span className="cell-sub">
                    {rfq?.description || 'Intel i7 13th Gen, 16GB DDR5 RAM, 512GB NVMe SSD, 15.6" FHD Display, 3-Yr Warranty'}
                  </span>
                </td>
                <td className="num-cell" style={{ fontWeight: 600 }}>{qty}</td>
                <td>Units</td>
                <td className="num-cell">₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="num-cell">{taxType === 'IGST_18' ? '18% IGST' : '18% (9% CGST + 9% SGST)'}</td>
                <td className="num-cell" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  ₹{(unitPrice * qty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td className="cell-primary">Installation & Commissioning Support</td>
                <td><span className="cell-sub">On-site deployment, hardware verification, and enterprise software imaging</span></td>
                <td className="num-cell" style={{ fontWeight: 600 }}>1</td>
                <td>Lot</td>
                <td className="num-cell">Included</td>
                <td className="num-cell">0%</td>
                <td className="num-cell" style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Financial Summary & Delivery Details Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Editable Delivery Details */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title">🚚 Delivery Details & Logistics (Editable)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="field">
              <label>Delivery Address *</label>
              <textarea
                name="delivery_address"
                rows="2"
                value={deliveryData.delivery_address}
                onChange={handleChange}
                disabled={isIssued}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Delivery Contact Person *</label>
                <input
                  type="text"
                  name="delivery_contact_person"
                  value={deliveryData.delivery_contact_person}
                  onChange={handleChange}
                  disabled={isIssued}
                />
              </div>
              <div className="field">
                <label>Delivery Contact Phone *</label>
                <input
                  type="text"
                  name="delivery_phone"
                  value={deliveryData.delivery_phone}
                  onChange={handleChange}
                  disabled={isIssued}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Expected Delivery Date *</label>
                <input
                  type="date"
                  name="expected_delivery_date"
                  value={deliveryData.expected_delivery_date}
                  onChange={handleChange}
                  disabled={isIssued}
                />
              </div>
              <div className="field">
                <label>Discount Amount (₹)</label>
                <input
                  type="number"
                  name="discount_amount"
                  min="0"
                  value={deliveryData.discount_amount}
                  onChange={handleChange}
                  disabled={isIssued}
                />
              </div>
            </div>

            <div className="field">
              <label>Delivery & Unloading Instructions</label>
              <textarea
                name="delivery_instructions"
                rows="2"
                value={deliveryData.delivery_instructions}
                onChange={handleChange}
                disabled={isIssued}
                placeholder="Gate entry pass requirements, unloading instructions..."
              />
            </div>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="table-card decision-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title">💰 Financial Summary</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal ({qty} units)</span>
              <span className="mono-text" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {taxType === 'GST_9_9' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>CGST (9%)</span>
                  <span className="mono-text">+ ₹ {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>SGST (9%)</span>
                  <span className="mono-text">+ ₹ {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>IGST (18%)</span>
                <span className="mono-text">+ ₹ {igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                <span>Special Discount</span>
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

            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0 }}>ℹ Prices are inclusive of packaging, forwarding, and insurance as per agreed quotation terms.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Information & Warranty / Terms Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Payment Information */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title">💳 Payment Information</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div className="info-row">
              <span className="info-label">Payment Terms</span>
              <span className="info-val" style={{ fontWeight: 600 }}>{quotation?.payment_terms || 'Net 30 Days'}</span>
            </div>
            <div className="info-row"><span className="info-label">Currency</span><span className="info-val">INR (₹)</span></div>
            <div className="info-row"><span className="info-label">Payment Due Days</span><span className="info-val">30 Days after Invoice Verification</span></div>
            <div className="info-row"><span className="info-label">Billing Party</span><span className="info-val">VendorBridge Enterprise Systems</span></div>
          </div>
        </div>

        {/* Warranty & Service */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title">🛡️ Warranty & Service Terms</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div className="info-row">
              <span className="info-label">Warranty Period</span>
              <span className="info-val" style={{ fontWeight: 700, color: 'var(--accent)' }}>{quotation?.warranty || '2 Years Comprehensive On-Site Warranty'}</span>
            </div>
            <div className="info-row"><span className="info-label">Return Policy</span><span className="info-val">14-day replacement for manufacturing defects / DOA</span></div>
            <div className="info-row"><span className="info-label">Service SLA</span><span className="info-val">Next business day (NBD) on-site technical support</span></div>
            <div className="info-row"><span className="info-label">Support Email</span><span className="info-val">support@{vendor?.name?.toLowerCase().replace(/ /g, '') || 'dell'}.com</span></div>
          </div>
        </div>
      </div>

      {/* ── Procurement Notes & Attachments Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Procurement Notes */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title">📝 Procurement Special Instructions & Notes</span>
          </div>
          <div className="field">
            <textarea
              name="procurement_notes"
              rows="4"
              value={deliveryData.procurement_notes}
              onChange={handleChange}
              disabled={isIssued}
              placeholder="Add any special instructions for the vendor..."
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Attachments */}
        <div className="table-card info-card" style={{ padding: '20px' }}>
          <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="table-title">📎 Associated Documents</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href={rfq?.specs_file_url || '#'} target="_blank" rel="noreferrer" className="download-link" style={{ fontSize: '12.5px' }}>
              📄 RFQ Specification Document.pdf
            </a>
            <a href={quotation?.attachment_url || '#'} target="_blank" rel="noreferrer" className="download-link" style={{ fontSize: '12.5px' }}>
              📄 Selected Vendor Quotation.pdf
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Downloading Technical Terms & SLA...'); }} className="download-link" style={{ fontSize: '12.5px' }}>
              📄 Technical Terms & SLA Agreement.pdf
            </a>
          </div>
        </div>
      </div>

      {/* ── Purchase Order Timeline ── */}
      <section className="table-card" style={{ padding: '24px' }}>
        <div className="table-header-bar" style={{ marginBottom: '20px' }}>
          <span className="table-title">⏳ Purchase Order Lifecycle Timeline</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 10px' }}>
          {[
            { step: '1', title: 'RFQ Created', sub: 'Completed', done: true },
            { step: '2', title: 'Manager Approved', sub: 'Completed', done: true },
            { step: '3', title: 'Vendor Quoted', sub: 'Completed', done: true },
            { step: '4', title: 'Officer Selected Vendor', sub: 'Completed', done: true },
            { step: '5', title: 'PO Generated', sub: 'Completed', done: true },
            { step: '6', title: isIssued ? 'PO Issued' : 'Waiting to Issue PO', sub: isIssued ? 'Issued' : 'Action Required', done: isIssued, current: !isIssued },
            { step: '7', title: 'Vendor Acknowledged', sub: ['acknowledged', 'in_progress', 'delivered', 'invoiced'].includes(poStatus) ? 'Acknowledged' : 'Awaiting Vendor', done: ['acknowledged', 'in_progress', 'delivered', 'invoiced'].includes(poStatus), current: poStatus === 'issued' },
            { step: '8', title: 'Goods Delivered', sub: ['delivered', 'invoiced'].includes(poStatus) ? 'Delivered' : poStatus === 'in_progress' ? 'In Progress' : 'Pending', done: ['delivered', 'invoiced'].includes(poStatus), current: poStatus === 'in_progress' },
            { step: '9', title: 'Invoice Submitted', sub: poStatus === 'invoiced' ? 'Pending Verification' : 'Pending Invoice', done: poStatus === 'invoiced', current: poStatus === 'delivered' },
          ].map((item, index, arr) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: item.done ? '#22c55e' : item.current ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                color: item.done || item.current ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: item.current ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none',
                marginBottom: '8px'
              }}>
                {item.done ? '✓' : item.step}
              </div>
              <span style={{ fontSize: '12px', fontWeight: item.current ? 700 : 600, color: item.current ? 'var(--accent)' : 'var(--text-primary)', textAlign: 'center' }}>
                {item.title}
              </span>
              <span style={{ fontSize: '11px', color: item.done ? '#4ade80' : 'var(--text-muted)' }}>
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Preview PO Printable Modal ── */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', background: '#fff', color: '#0f172a' }}>
            <div className="modal-head" style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div>
                <h2 className="modal-title" style={{ color: '#0f172a' }}>Purchase Order Preview ({poNumberDisplay})</h2>
                <p className="modal-subtitle" style={{ color: '#64748b' }}>Official Document View for Issue & Printing</p>
              </div>
              <button className="modal-close" style={{ color: '#64748b' }} onClick={() => setShowPreviewModal(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '30px', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>VendorBridge Enterprise Systems</h1>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>Tech Park One, Cyber City, Bangalore - 560103</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>GSTIN: 29AAAAA0000A1Z5 · Email: procurement@vendorbridge.com</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: 0, fontSize: '20px', color: '#2563eb' }}>PURCHASE ORDER</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 700 }}>{poNumberDisplay}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>Date: {poDateDisplay}</p>
                </div>
              </div>

              {/* Parties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '12.5px' }}>
                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', color: '#2563eb', marginBottom: '6px' }}>SUPPLIER (VENDOR)</strong>
                  <strong>{vendor?.name || 'Dell Technologies'}</strong><br />
                  Code: {vendor?.vendor_code || 'VND-DELL'}<br />
                  Attn: {vendor?.contact_person || 'Rajesh Kumar'}<br />
                  GSTIN: {vendor?.gst_number || '27AAACD4567E1Z9'}<br />
                  Address: {vendor?.address || 'Inner Ring Rd, Bangalore'}
                </div>
                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', color: '#2563eb', marginBottom: '6px' }}>SHIP TO (DELIVERY ADDRESS)</strong>
                  {deliveryData.delivery_address}<br />
                  Attn: {deliveryData.delivery_contact_person}<br />
                  Phone: {deliveryData.delivery_phone}<br />
                  Expected Delivery: <strong>{deliveryData.expected_delivery_date}</strong>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Item Description</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <strong>{rfq?.title || 'Laptops & Workstations Equipment'}</strong><br />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{rfq?.description || 'Intel i7 13th Gen, 16GB RAM, 512GB SSD'}</span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{qty}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{unitPrice.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', fontSize: '13px' }}>
                <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                  {taxType === 'GST_9_9' ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>CGST (9%):</span><span>₹{cgst.toLocaleString('en-IN')}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>SGST (9%):</span><span>₹{sgst.toLocaleString('en-IN')}</span></div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>IGST (18%):</span><span>₹{igst.toLocaleString('en-IN')}</span></div>
                  )}
                  {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}><span>Discount:</span><span>- ₹{discount.toLocaleString('en-IN')}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', borderTop: '2px solid #0f172a', paddingTop: '6px', color: '#2563eb' }}>
                    <span>Grand Total:</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div style={{ fontSize: '11.5px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <p style={{ margin: '0 0 4px' }}><strong>Terms & Conditions:</strong> Payment Terms: {quotation?.payment_terms || 'Net 30 Days'}. Warranty: {quotation?.warranty || '2 Years'}. Special Notes: {deliveryData.procurement_notes}</p>
                <p style={{ margin: 0 }}>Authorized Signatory: Alex Mercer (Procurement Manager)</p>
              </div>
            </div>

            <div className="modal-foot" style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setShowPreviewModal(false)}>Close Preview</button>
              <button className="btn-primary" onClick={() => alert('Printing Purchase Order...')}>🖨 Print Official PO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
