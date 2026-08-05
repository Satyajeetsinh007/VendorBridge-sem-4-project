import React, { useState } from 'react';
import { api } from '../services/api';

/* ── Mock ML Feature Data per Vendor ── */
const vendorMLFeatures = {
  'VND-DELL': { rfqsInvited: 48, quotationsSubmitted: 42, quotationsWon: 28, quoteSuccessRate: 66.7, purchaseOrders: 25, onTimeDelivery: 96, avgDeliveryDays: 12, avgResponseTime: 1.2, avgPriceIndex: 0.95, totalBusinessValue: '₹2.85Cr', aiScore: 92, confidence: 94, strengths: ['Competitive Price', 'Excellent Vendor Rating', 'High On-time Delivery', 'Fast Response Time', 'Strong Purchase History'], ordersWonTrend: [3,5,4,6,5,7,4,6,5,8,6,5], ratingTrend: [4.2,4.3,4.4,4.5,4.5,4.6,4.6,4.5,4.7,4.7,4.8,4.7], deliveryPerf: [94,96,95,97,96,98,95,96,97,96,97,96], bizValueTrend: [18,32,24,38,30,42,28,36,32,48,38,34] },
  'VND-HP': { rfqsInvited: 40, quotationsSubmitted: 35, quotationsWon: 22, quoteSuccessRate: 62.9, purchaseOrders: 20, onTimeDelivery: 92, avgDeliveryDays: 14, avgResponseTime: 1.8, avgPriceIndex: 1.02, totalBusinessValue: '₹1.92Cr', aiScore: 78, confidence: 82, strengths: ['Strong Brand', 'Wide Product Range', 'Good Rating'], ordersWonTrend: [2,4,3,5,4,5,3,4,5,6,4,4], ratingTrend: [4.0,4.1,4.2,4.3,4.3,4.4,4.4,4.5,4.5,4.5,4.5,4.5], deliveryPerf: [90,91,92,91,93,92,91,93,92,94,92,92], bizValueTrend: [12,22,18,28,24,30,16,24,28,36,26,24] },
  'VND-LNV': { rfqsInvited: 35, quotationsSubmitted: 30, quotationsWon: 18, quoteSuccessRate: 60.0, purchaseOrders: 16, onTimeDelivery: 88, avgDeliveryDays: 16, avgResponseTime: 2.1, avgPriceIndex: 0.98, totalBusinessValue: '₹1.45Cr', aiScore: 71, confidence: 76, strengths: ['Competitive Pricing', 'Innovation Leader'], ordersWonTrend: [2,3,2,4,3,4,2,3,4,5,3,3], ratingTrend: [4.0,4.0,4.1,4.2,4.1,4.2,4.3,4.2,4.3,4.3,4.3,4.3], deliveryPerf: [86,88,87,89,88,90,87,88,89,88,89,88], bizValueTrend: [10,16,12,22,18,24,14,18,22,30,20,18] },
  'VND-GDJ': { rfqsInvited: 30, quotationsSubmitted: 26, quotationsWon: 20, quoteSuccessRate: 76.9, purchaseOrders: 18, onTimeDelivery: 94, avgDeliveryDays: 21, avgResponseTime: 1.5, avgPriceIndex: 1.05, totalBusinessValue: '₹1.68Cr', aiScore: 85, confidence: 88, strengths: ['Excellent Quality', 'High Win Rate', 'Reliable Delivery'], ordersWonTrend: [1,2,3,2,3,4,3,3,4,4,3,4], ratingTrend: [4.3,4.3,4.4,4.4,4.5,4.5,4.5,4.6,4.6,4.6,4.6,4.6], deliveryPerf: [92,93,94,93,95,94,93,95,94,95,94,94], bizValueTrend: [8,14,18,14,20,28,20,22,28,30,24,28] },
  'VND-DRN': { rfqsInvited: 22, quotationsSubmitted: 18, quotationsWon: 10, quoteSuccessRate: 55.6, purchaseOrders: 9, onTimeDelivery: 85, avgDeliveryDays: 25, avgResponseTime: 2.5, avgPriceIndex: 0.88, totalBusinessValue: '₹78L', aiScore: 58, confidence: 64, strengths: ['Lowest Price', 'Value for Money'], ordersWonTrend: [1,1,2,1,2,2,1,2,2,3,2,2], ratingTrend: [3.8,3.9,3.9,4.0,4.0,4.0,4.1,4.0,4.1,4.1,4.1,4.1], deliveryPerf: [83,85,84,86,85,87,84,85,86,85,86,85], bizValueTrend: [4,6,10,6,12,14,8,12,14,18,12,14] },
  'VND-ABC': { rfqsInvited: 55, quotationsSubmitted: 48, quotationsWon: 32, quoteSuccessRate: 66.7, purchaseOrders: 30, onTimeDelivery: 90, avgDeliveryDays: 5, avgResponseTime: 0.8, avgPriceIndex: 1.10, totalBusinessValue: '₹42L', aiScore: 68, confidence: 72, strengths: ['Fastest Delivery', 'Quickest Response', 'High Volume'], ordersWonTrend: [4,5,6,5,7,6,5,6,7,8,6,7], ratingTrend: [3.6,3.7,3.7,3.8,3.8,3.9,3.9,3.8,3.9,3.9,3.9,3.9], deliveryPerf: [88,90,89,91,90,92,89,90,91,90,91,90], bizValueTrend: [3,4,5,4,6,5,4,5,6,7,5,6] },
};

const featureImportance = [
  { feature: 'Price Competitiveness', weight: 35, color: '#3b82f6' },
  { feature: 'Vendor Rating', weight: 24, color: '#8b5cf6' },
  { feature: 'Delivery Time', weight: 18, color: '#10b981' },
  { feature: 'On-time Delivery %', weight: 10, color: '#f59e0b' },
  { feature: 'Quote Success Rate', weight: 7, color: '#ef4444' },
  { feature: 'Response Time', weight: 4, color: '#06b6d4' },
  { feature: 'Avg Price Index', weight: 2, color: '#ec4899' },
];

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const logoColors = {
  'VND-DELL': '#0076CE', 'VND-HP': '#0096D6', 'VND-LNV': '#E2231A',
  'VND-GDJ': '#7C3AED', 'VND-DRN': '#D97706', 'VND-ABC': '#10B981',
};

/* ── Mini Bar Chart ── */
function MiniBar({ data, color, h = 60 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: h }}>
      {data.map((v, i) => (
        <div key={i} title={`${months[i]}: ${v}`} style={{
          flex: 1, height: `${(v / max) * 100}%`, background: color,
          borderRadius: '2px 2px 0 0', minHeight: 3, transition: 'height 0.3s',
        }} />
      ))}
    </div>
  );
}

/* ── Horizontal Bar ── */
function HBar({ label, value, max, color, suffix = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
      <span style={{ width: '140px', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ width: '50px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{value}{suffix}</span>
    </div>
  );
}

/* ── Comparison Bar Chart ── */
function ComparisonBarChart({ title, dataPoints, color, suffix = '', reverseIsBetter = false }) {
  const max = Math.max(...dataPoints.map(d => d.value));
  const bestIdx = reverseIsBetter
    ? dataPoints.reduce((best, d, i) => d.value < dataPoints[best].value ? i : best, 0)
    : dataPoints.reduce((best, d, i) => d.value > dataPoints[best].value ? i : best, 0);

  return (
    <div className="table-card" style={{ padding: '16px 20px' }}>
      <span className="table-title" style={{ marginBottom: '12px', display: 'block' }}>{title}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {dataPoints.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
            <span style={{ width: '100px', color: 'var(--text-secondary)', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</span>
            <div style={{ flex: 1, height: '18px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                width: `${(d.value / max) * 100}%`, height: '100%', borderRadius: '4px',
                background: i === bestIdx ? color : 'rgba(255,255,255,0.1)',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <span style={{ width: '60px', textAlign: 'right', fontWeight: 600, color: i === bestIdx ? color : 'var(--text-secondary)' }}>
              {d.value}{suffix} {i === bestIdx ? '⭐' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuotationComparison({ rfq, quotations, vendors, currentUser, onBack, onRefresh, onViewPO }) {
  const [selectedVendorProfile, setSelectedVendorProfile] = useState(null);
  const [selectionModal, setSelectionModal] = useState(null);
  const [selectionReason, setSelectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPredictionDetails, setShowPredictionDetails] = useState(false);

  // Helper to check ownership
  const isOwnRfq = (rfqObj) => {
    if (!currentUser) return true;
    const creatorId = typeof rfqObj?.created_by === 'object' ? rfqObj?.created_by?.id : rfqObj?.created_by;
    if (creatorId && creatorId === currentUser.id) return true;
    if (rfqObj?.created_by_details && (rfqObj.created_by_details.id === currentUser.id || rfqObj.created_by_details.email === currentUser.email)) return true;
    if (rfqObj?.created_by_name && currentUser.name && rfqObj.created_by_name.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  };

  const isOwn = isOwnRfq(rfq);

  // Build quotation data with ML features
  const enrichedQuotations = quotations
    .filter(q => q.rfq === rfq.id && q.status !== 'draft')
    .map(q => {
      const vendor = vendors.find(v => v.id === q.vendor) || q.vendor_details || {};
      const ml = vendorMLFeatures[vendor.vendor_code] || vendorMLFeatures['VND-DELL'];
      return { ...q, vendor, ml };
    })
    .sort((a, b) => b.ml.aiScore - a.ml.aiScore);

  const todayStr = new Date().toISOString().split('T')[0];
  const isClosed = rfq.status === 'closed' || (rfq.deadline && rfq.deadline < todayStr);

  const recommended = enrichedQuotations.length > 0 ? enrichedQuotations[0] : null;

  const handleSelectVendor = async () => {
    if (!selectionModal) return;
    setSubmitting(true);
    try {
      // Update selected quotation to 'selected'
      await api.patchQuotation(selectionModal.id, { status: 'selected' });
      // Reject remaining quotations
      for (const q of enrichedQuotations) {
        if (q.id !== selectionModal.id && q.status === 'submitted') {
          await api.patchQuotation(q.id, { status: 'rejected' });
        }
      }
      // Complete RFQ
      await api.patchRFQ(rfq.id, { status: 'completed' });

      // Automatically generate Purchase Order in Backend
      let createdPo = null;
      try {
        createdPo = await api.createPurchaseOrder({
          rfq: rfq.id,
          quotation: selectionModal.id,
          vendor: selectionModal.vendor.id,
          subtotal: selectionModal.subtotal || (selectionModal.unit_price * rfq.quantity),
          total_value: selectionModal.total_price || (selectionModal.unit_price * rfq.quantity * 1.18),
          delivery_address: 'VendorBridge Tech Park, Gate #3, Central Warehouse, Sector 62, Noida, UP - 201309',
          terms_and_conditions: 'Standard VendorBridge Enterprise Terms Apply',
          status: 'draft',
          expected_delivery_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        });
      } catch (e) { console.log('PO auto-gen note:', e.message); }

      const poToPass = createdPo || {
        po_number: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'draft',
        rfq: rfq.id,
        quotation: selectionModal.id,
        vendor: selectionModal.vendor.id,
      };

      setSelectionModal(null);
      setSelectionReason('');
      if (onRefresh) onRefresh();
      if (onViewPO) onViewPO(poToPass, rfq, selectionModal, selectionModal.vendor);
    } catch (err) {
      alert(`Selection failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (name) => (name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="qc-page">
      {/* Back Button */}
      <button className="btn-secondary btn-back" onClick={onBack} style={{ marginBottom: '16px' }}>
        ← Back to RFQ Dashboard
      </button>

      {/* ═══════ PAGE HEADER ═══════ */}
      <div className="qc-header">
        <div className="qc-header-left">
          <h2 className="qc-title">Quotation Comparison</h2>
          <span className="mono-text" style={{ fontSize: '14px' }}>{rfq.rfq_number}</span>
        </div>
        <div className="qc-header-badges">
          <span className={`badge badge-status-${rfq.status}`}>{rfq.status?.replace(/_/g, ' ')}</span>
          <span className={`badge badge-priority-${rfq.priority}`}>{rfq.priority}</span>
        </div>
      </div>

      {/* View-Only Banner for another Officer's RFQ */}
      {!isOwn && (
        <div className="state-banner info" style={{ marginBottom: '20px', padding: '14px 18px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            ℹ This RFQ was created by <span style={{ color: 'var(--accent)' }}>{rfq.created_by_details?.name || rfq.created_by_name || 'Priya Shah'}</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Department: <strong>{rfq.department_details?.name || rfq.department_details?.code || 'Human Resources'}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginTop: '6px' }}>
            You have view-only access. Selecting a winning vendor and generating a Purchase Order is restricted to the creator.
          </div>
        </div>
      )}

      {/* RFQ Info Cards */}
      <div className="qc-info-row">
        <div className="qc-info-card">
          <span className="qc-info-label">RFQ Title</span>
          <span className="qc-info-value">{rfq.title}</span>
        </div>
        <div className="qc-info-card">
          <span className="qc-info-label">Department</span>
          <span className="qc-info-value">{rfq.department_details?.name || '—'}</span>
        </div>
        <div className="qc-info-card">
          <span className="qc-info-label">Deadline</span>
          <span className="qc-info-value">{rfq.deadline}</span>
        </div>
        <div className="qc-info-card">
          <span className="qc-info-label">Vendors Invited</span>
          <span className="qc-info-value">{vendors.length}</span>
        </div>
        <div className="qc-info-card">
          <span className="qc-info-label">Quotations Received</span>
          <span className="qc-info-value">{enrichedQuotations.length}</span>
        </div>
      </div>

      {/* ═══════ AI RECOMMENDATION ═══════ */}
      {recommended && (
        <div className="qc-ai-card">
          <div className="qc-ai-left">
            <div className="qc-ai-badge">🤖 AI RECOMMENDATION</div>
            <div className="qc-ai-vendor">
              <div className="qc-ai-logo" style={{ background: logoColors[recommended.vendor.vendor_code] || '#3b82f6' }}>
                {initials(recommended.vendor.name)}
              </div>
              <div>
                <h3 className="qc-ai-vendor-name">{recommended.vendor.name}</h3>
                <span className="mono-text" style={{ fontSize: '12px' }}>{recommended.vendor.vendor_code}</span>
              </div>
            </div>
            <div className="qc-ai-reasons">
              {recommended.ml.strengths.map((s, i) => (
                <span key={i} className="qc-strength-tag">✓ {s}</span>
              ))}
            </div>
          </div>
          <div className="qc-ai-right">
            <div className="qc-ai-metric">
              <div className="qc-ai-circle" style={{ '--pct': `${recommended.ml.confidence}%` }}>
                <span className="qc-ai-pct">{recommended.ml.confidence}%</span>
              </div>
              <span className="qc-ai-metric-label">AI Confidence</span>
            </div>
            <div className="qc-ai-meta">
              <div><span className="qc-meta-label">Model</span><span className="qc-meta-value">Random Forest</span></div>
              <div><span className="qc-meta-label">AI Score</span><span className="qc-meta-value">{recommended.ml.aiScore}/100</span></div>
              <div><span className="qc-meta-label">Features</span><span className="qc-meta-value">7 analyzed</span></div>
            </div>
            <button className="btn-secondary" onClick={() => setShowPredictionDetails(!showPredictionDetails)} style={{ marginTop: '8px', fontSize: '12px' }}>
              {showPredictionDetails ? 'Hide' : 'View'} Prediction Details
            </button>
          </div>
        </div>
      )}

      {/* Prediction Details Expanded */}
      {showPredictionDetails && (
        <div className="table-card" style={{ padding: '20px' }}>
          <span className="table-title" style={{ marginBottom: '16px', display: 'block' }}>Feature Importance — Random Forest Model</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {featureImportance.map((f, i) => (
              <HBar key={i} label={f.feature} value={f.weight} max={40} color={f.color} suffix="%" />
            ))}
          </div>
        </div>
      )}

      {/* ═══════ COMPARISON TABLE ═══════ */}
      {enrichedQuotations.length === 0 ? (
        <div className="table-card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No submitted quotations to compare for this RFQ.</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-header-bar">
            <span className="table-title">Vendor Quotation Comparison</span>
            <span className="table-count">{enrichedQuotations.length} quotations</span>
          </div>
          <div className="table-scroll">
            <table className="data-table qc-table">
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, background: 'var(--bg-surface)', zIndex: 2 }}>Vendor</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                  <th>CGST (9%)</th>
                  <th>SGST (9%)</th>
                  <th>IGST (18%)</th>
                  <th>Grand Total</th>
                  <th>Delivery</th>
                  <th>Warranty</th>
                  <th>Valid Until</th>
                  <th>Payment Terms</th>
                  <th>Attachment</th>
                  <th className="th-divider">Rating</th>
                  <th>Success %</th>
                  <th>On-time %</th>
                  <th>Avg Delivery</th>
                  <th>Business Value</th>
                  <th className="th-divider">AI Score</th>
                  <th>Confidence</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrichedQuotations.map((q, idx) => {
                  const isRecommended = idx === 0;
                  const unitP = parseFloat(q.unit_price) || 0;
                  const qty = rfq.quantity || 1;
                  const subT = parseFloat(q.subtotal) || (unitP * qty);
                  const cgstVal = parseFloat(q.cgst_amount) || (q.tax_type === 'GST_9_9' ? subT * 0.09 : 0);
                  const sgstVal = parseFloat(q.sgst_amount) || (q.tax_type === 'GST_9_9' ? subT * 0.09 : 0);
                  const igstVal = parseFloat(q.igst_amount) || (q.tax_type === 'IGST_18' ? subT * 0.18 : 0);
                  const grandT = parseFloat(q.total_price) || (subT + cgstVal + sgstVal + igstVal);

                  return (
                    <tr key={q.id} className={isRecommended ? 'qc-recommended-row' : ''}>
                      <td style={{ position: 'sticky', left: 0, background: isRecommended ? 'rgba(59,130,246,0.06)' : 'var(--bg-surface)', zIndex: 1, minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="qc-vendor-logo" style={{ background: logoColors[q.vendor.vendor_code] || '#64748b' }}>
                            {initials(q.vendor.name)}
                          </div>
                          <div>
                            <span className="cell-primary">{q.vendor.name}</span>
                            <span className="cell-sub">{q.vendor.vendor_code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="num-cell">₹{unitP.toLocaleString('en-IN')}</td>
                      <td className="num-cell">₹{subT.toLocaleString('en-IN')}</td>
                      <td className="num-cell" style={{ color: cgstVal ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {cgstVal ? `₹${cgstVal.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="num-cell" style={{ color: sgstVal ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {sgstVal ? `₹${sgstVal.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="num-cell" style={{ color: igstVal ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {igstVal ? `₹${igstVal.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="num-cell" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        ₹{grandT.toLocaleString('en-IN')}
                      </td>
                      <td>{q.delivery_days} days</td>
                      <td><span className="badge badge-status-open">{q.warranty || '2 Years'}</span></td>
                      <td className="date-cell">{q.valid_until || '20 Aug 2026'}</td>
                      <td>{q.payment_terms || 'Net 30'}</td>
                      <td>
                        <a href={q.attachment_url || '#'} target="_blank" rel="noreferrer" className="download-link" style={{ fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                          📄 Download PDF
                        </a>
                      </td>
                      <td className="th-divider"><span className="badge badge-priority-medium">⭐ {q.vendor.rating}</span></td>
                      <td className="num-cell">{q.ml.quoteSuccessRate}%</td>
                      <td className="num-cell">{q.ml.onTimeDelivery}%</td>
                      <td>{q.ml.avgDeliveryDays}d</td>
                      <td>{q.ml.totalBusinessValue}</td>
                      <td className="th-divider">
                        <span className="qc-score-pill" style={{ background: q.ml.aiScore >= 80 ? 'rgba(34,197,94,0.15)' : q.ml.aiScore >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: q.ml.aiScore >= 80 ? '#4ade80' : q.ml.aiScore >= 60 ? '#fbbf24' : '#f87171' }}>
                          {q.ml.aiScore}
                        </span>
                      </td>
                      <td className="num-cell">{q.ml.confidence}%</td>
                      <td className="actions-cell" style={{ whiteSpace: 'nowrap' }}>
                        {isRecommended && <span className="qc-rec-badge">⭐ Recommended</span>}
                        <div style={{ display: 'flex', gap: '6px', marginTop: isRecommended ? '6px' : 0 }}>
                          <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setSelectedVendorProfile(q)}>
                            Profile
                          </button>
                          {!isClosed && rfq.status !== 'completed' && isOwn && (
                            <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => { setSelectionModal(q); setSelectionReason(''); }}>
                              Select
                            </button>
                          )}
                          {!isClosed && rfq.status !== 'completed' && !isOwn && (
                            <span className="badge badge-status-draft" style={{ background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.25)', fontSize: '10px' }}>
                              View Only
                            </span>
                          )}
                          {isClosed && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>🔒 Closed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════ COMPARISON CHARTS ═══════ */}
      {enrichedQuotations.length > 1 && (
        <div className="qc-charts-grid">
          <ComparisonBarChart
            title="💰 Price Comparison (Unit Price ₹)"
            dataPoints={enrichedQuotations.map(q => ({ label: q.vendor.name, value: parseFloat(q.unit_price) }))}
            color="#3b82f6" reverseIsBetter={true}
          />
          <ComparisonBarChart
            title="🚚 Delivery Time (Days)"
            dataPoints={enrichedQuotations.map(q => ({ label: q.vendor.name, value: q.delivery_days }))}
            color="#10b981" reverseIsBetter={true}
          />
          <ComparisonBarChart
            title="⭐ Vendor Rating"
            dataPoints={enrichedQuotations.map(q => ({ label: q.vendor.name, value: parseFloat(q.vendor.rating || 0) }))}
            color="#f59e0b" suffix=""
          />
          <ComparisonBarChart
            title="📊 Quote Success Rate (%)"
            dataPoints={enrichedQuotations.map(q => ({ label: q.vendor.name, value: q.ml.quoteSuccessRate }))}
            color="#8b5cf6" suffix="%"
          />
          <ComparisonBarChart
            title="✅ On-time Delivery (%)"
            dataPoints={enrichedQuotations.map(q => ({ label: q.vendor.name, value: q.ml.onTimeDelivery }))}
            color="#06b6d4" suffix="%"
          />
          <ComparisonBarChart
            title="🤖 AI Score"
            dataPoints={enrichedQuotations.map(q => ({ label: q.vendor.name, value: q.ml.aiScore }))}
            color="#ec4899"
          />
        </div>
      )}

      {/* ═══════ FEATURE IMPORTANCE ═══════ */}
      <div className="table-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span className="table-title">🧠 Feature Importance — Random Forest Model</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              How the AI weighted each feature in its recommendation decision
            </p>
          </div>
          <span className="badge badge-status-open">7 Features Analyzed</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {featureImportance.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '160px', fontSize: '13px', color: 'var(--text-secondary)', flexShrink: 0 }}>{f.feature}</span>
              <div style={{ flex: 1, height: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${(f.weight / 35) * 100}%`, height: '100%', background: `${f.color}30`, borderRadius: '6px', borderLeft: `3px solid ${f.color}`, display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: f.color }}>{f.weight}%</span>
                </div>
              </div>
              <span style={{ width: '60px', fontSize: '13px', fontWeight: 600, color: f.color, textAlign: 'right' }}>
                {f.weight >= 20 ? 'High' : f.weight >= 10 ? 'Medium' : 'Low'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════ VENDOR PROFILE MODAL ═══════ */}
      {selectedVendorProfile && (
        <div className="modal-overlay" onClick={() => setSelectedVendorProfile(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="modal-head">
              <div>
                <h2 className="modal-title">Vendor Profile</h2>
                <p className="modal-subtitle">
                  {selectedVendorProfile.vendor.name} · <span className="mono-text">{selectedVendorProfile.vendor.vendor_code}</span>
                </p>
              </div>
              <button className="modal-close" onClick={() => setSelectedVendorProfile(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Company Info */}
              <div className="qc-profile-hero" style={{ background: logoColors[selectedVendorProfile.vendor.vendor_code] || '#3b82f6' }}>
                <div className="qc-profile-logo">{initials(selectedVendorProfile.vendor.name)}</div>
                <div>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>{selectedVendorProfile.vendor.name}</h3>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{selectedVendorProfile.vendor.category} · ⭐ {selectedVendorProfile.vendor.rating}</span>
                </div>
              </div>

              <div className="field-row" style={{ marginTop: '16px' }}>
                <div className="field"><label>Contact Person</label><p style={{ fontSize: '13px' }}>{selectedVendorProfile.vendor.contact_person || '—'}</p></div>
                <div className="field"><label>Category</label><p style={{ fontSize: '13px' }}>{selectedVendorProfile.vendor.category || '—'}</p></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Email</label><p style={{ fontSize: '13px' }}>{selectedVendorProfile.vendor.email}</p></div>
                <div className="field"><label>Phone</label><p style={{ fontSize: '13px' }}>{selectedVendorProfile.vendor.phone}</p></div>
              </div>
              <div className="field-row">
                <div className="field"><label>GST Number</label><p style={{ fontSize: '13px' }} className="mono-text">{selectedVendorProfile.vendor.gst_number || '—'}</p></div>
                <div className="field"><label>Rating</label><p style={{ fontSize: '13px' }}>⭐ {selectedVendorProfile.vendor.rating}/5.00</p></div>
              </div>
              <div className="field full">
                <label>Address</label>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedVendorProfile.vendor.address || '—'}</p>
              </div>

              {/* Financial & Quotation Details */}
              <div className="table-card" style={{ padding: '16px', marginTop: '14px', background: 'rgba(255,255,255,0.02)' }}>
                <span className="table-title" style={{ marginBottom: '12px', display: 'block' }}>Quotation Financial & Tax Details</span>
                <div className="field-row">
                  <div className="field"><label>Warranty Period</label><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>{selectedVendorProfile.warranty || '2 Years'}</p></div>
                  <div className="field"><label>Quotation Valid Until</label><p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedVendorProfile.valid_until || '20 Aug 2026'}</p></div>
                  <div className="field">
                    <label>Quotation Attachment</label>
                    <a href={selectedVendorProfile.attachment_url || '#'} target="_blank" rel="noreferrer" className="download-link" style={{ fontSize: '13px' }}>
                      📄 Download quotation.pdf
                    </a>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '10px', padding: '12px', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)' }}>
                  <div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Subtotal</span><p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>₹{parseFloat(selectedVendorProfile.subtotal || selectedVendorProfile.unit_price * (rfq.quantity || 1)).toLocaleString('en-IN')}</p></div>
                  <div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CGST (9%)</span><p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>₹{parseFloat(selectedVendorProfile.cgst_amount || 0).toLocaleString('en-IN')}</p></div>
                  <div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SGST (9%)</span><p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>₹{parseFloat(selectedVendorProfile.sgst_amount || 0).toLocaleString('en-IN')}</p></div>
                  <div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>IGST (18%)</span><p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>₹{parseFloat(selectedVendorProfile.igst_amount || 0).toLocaleString('en-IN')}</p></div>
                  <div><span style={{ fontSize: '11px', color: 'var(--accent)' }}>Grand Total</span><p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--accent)' }}>₹{parseFloat(selectedVendorProfile.total_price).toLocaleString('en-IN')}</p></div>
                </div>
              </div>

              {/* Strength Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                {selectedVendorProfile.ml.strengths.map((s, i) => (
                  <span key={i} className="qc-strength-tag">{s}</span>
                ))}
              </div>

              {/* Mini Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                <div className="table-card" style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Orders Won Trend</span>
                  <MiniBar data={selectedVendorProfile.ml.ordersWonTrend} color="#3b82f6" />
                </div>
                <div className="table-card" style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Rating Trend</span>
                  <MiniBar data={selectedVendorProfile.ml.ratingTrend.map(v => v * 10)} color="#f59e0b" />
                </div>
                <div className="table-card" style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Delivery Performance %</span>
                  <MiniBar data={selectedVendorProfile.ml.deliveryPerf} color="#10b981" />
                </div>
                <div className="table-card" style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Business Value (₹L)</span>
                  <MiniBar data={selectedVendorProfile.ml.bizValueTrend} color="#8b5cf6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ SELECTION CONFIRMATION MODAL ═══════ */}
      {selectionModal && (
        <div className="modal-overlay" onClick={() => setSelectionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-head">
              <div>
                <h2 className="modal-title">Confirm Vendor Selection</h2>
                <p className="modal-subtitle">This action will finalize the RFQ procurement decision</p>
              </div>
              <button className="modal-close" onClick={() => setSelectionModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="qc-selection-preview">
                <div className="qc-vendor-logo" style={{ background: logoColors[selectionModal.vendor.vendor_code] || '#3b82f6', width: '48px', height: '48px', fontSize: '16px' }}>
                  {initials(selectionModal.vendor.name)}
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>{selectionModal.vendor.name}</h4>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Total: ₹{parseFloat(selectionModal.total_price).toLocaleString('en-IN')} · {selectionModal.delivery_days} days delivery
                  </span>
                </div>
              </div>

              <div className="state-banner info" style={{ margin: '16px 0', padding: '10px 14px' }}>
                ⚠ Selecting this vendor will mark their quotation as <strong>Selected</strong> and reject all other quotations.
              </div>

              <div className="field full">
                <label>Selection Reason <span className="req">*</span></label>
                <textarea
                  rows="4"
                  required
                  value={selectionReason}
                  onChange={e => setSelectionReason(e.target.value)}
                  placeholder="Explain why this vendor was selected (e.g., best price-quality balance, reliable delivery history, AI recommendation alignment...)"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectionModal(null)}>Cancel</button>
                <button
                  type="button"
                  className="btn-primary btn-approve"
                  disabled={submitting || !selectionReason.trim()}
                  onClick={handleSelectVendor}
                >
                  {submitting ? 'Processing…' : '✓ Confirm Selection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
