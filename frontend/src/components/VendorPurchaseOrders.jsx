import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import VendorInvoiceUpload from './VendorInvoiceUpload';

export default function VendorPurchaseOrders({ vendor, rfqs = [], quotations = [], onNotify }) {
  const [selectedPo, setSelectedPo] = useState(null);
  const [showUploadInvoiceView, setShowUploadInvoiceView] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Unable to meet delivery schedule');
  const [rejectNotes, setRejectNotes] = useState('');
  const [bannerMsg, setBannerMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [dbOrders, setDbOrders] = useState([]);
  const [loadingPOs, setLoadingPOs] = useState(true);

  // Sample Purchase Orders fallback data
  const [sampleOrders, setSampleOrders] = useState([
    {
      id: 'po-sample-1',
      po_number: 'PO-2026-0042',
      rfq_number: 'RFQ-2026-8215',
      rfq_title: 'Laptops & Workstations Procurement',
      issue_date: '2026-08-05',
      expected_delivery_date: '2026-08-19',
      subtotal: 125000,
      cgst_amount: 11250,
      sgst_amount: 11250,
      igst_amount: 0,
      grand_total: 147500,
      status: 'issued',
      item_name: 'High Performance Laptops & Equipment',
      description: 'Intel i7 13th Gen, 16GB DDR5 RAM, 512GB NVMe SSD, 15.6" FHD Display',
      quantity: 10,
      unit_price: 12500,
      tax_rate: '18% (9% CGST + 9% SGST)',
      delivery_address: 'VendorBridge Tech Park, Gate #3, Central Warehouse, Sector 62, Noida, UP - 201309',
      delivery_contact_person: 'Rajesh Sharma (Logistics Lead)',
      delivery_phone: '+91 98112 34567',
      delivery_instructions: 'Deliver between 9:00 AM and 5:00 PM on working days. Gate Pass & Quality Inspection required.',
      payment_terms: 'Net 30 Days',
      payment_due_days: 30,
      warranty: '2 Years Comprehensive On-Site Warranty',
      return_policy: '14-day replacement for manufacturing defects / DOA',
      service_terms: 'Next business day (NBD) on-site technical support',
      buyer_name: 'VendorBridge Enterprise Systems Pvt Ltd',
      officer_name: 'Alex Mercer (Senior Procurement Officer)',
      officer_email: 'procurement@vendorbridge.com',
      officer_phone: '+91 98765 43210',
      buyer_address: 'Tech Park One, Tower B, Level 6, Cyber City, Bangalore - 560103',
      specs_file_url: '#',
      quotation_file_url: '#',
    },
    {
      id: 'po-sample-2',
      po_number: 'PO-2026-0039',
      rfq_number: 'RFQ-2026-7748',
      rfq_title: 'Enterprise Servers & Storage Rack System',
      issue_date: '2026-07-28',
      expected_delivery_date: '2026-08-12',
      subtotal: 406779.66,
      cgst_amount: 36610.17,
      sgst_amount: 36610.17,
      igst_amount: 0,
      grand_total: 480000,
      status: 'acknowledged',
      item_name: 'Dell PowerEdge R760 Rack Server',
      description: 'Dual Xeon Gold 6430, 128GB ECC RAM, 4x 1.92TB NVMe Enterprise SSD',
      quantity: 2,
      unit_price: 203389.83,
      tax_rate: '18% GST',
      delivery_address: 'VendorBridge Data Center, Server Room 4B, Electronic City, Bangalore',
      delivery_contact_person: 'Vikram Mehta (Infrastructure Head)',
      delivery_phone: '+91 98450 98765',
      delivery_instructions: 'Handle with extreme care. Temperature controlled transport required.',
      payment_terms: '50% Advance + 50% on Delivery',
      payment_due_days: 15,
      warranty: '3 Years Enterprise Mission Critical Support',
      return_policy: '30-day DOA replacement guarantee',
      service_terms: '4-Hour 24x7 On-Site Response Time',
      buyer_name: 'VendorBridge Enterprise Systems Pvt Ltd',
      officer_name: 'Alex Mercer',
      officer_email: 'procurement@vendorbridge.com',
      officer_phone: '+91 98765 43210',
      buyer_address: 'Tech Park One, Tower B, Cyber City, Bangalore',
      specs_file_url: '#',
      quotation_file_url: '#',
    },
    {
      id: 'po-sample-3',
      po_number: 'PO-2026-0031',
      rfq_number: 'RFQ-2026-5107',
      rfq_title: 'Office Networking Equipment & Switches',
      issue_date: '2026-07-15',
      expected_delivery_date: '2026-07-25',
      subtotal: 72033.90,
      cgst_amount: 6483.05,
      sgst_amount: 6483.05,
      igst_amount: 0,
      grand_total: 85000,
      status: 'rejected',
      rejection_reason: 'Unable to meet delivery schedule',
      rejection_notes: 'Current chip shortage delay pushed lead time to 4 weeks.',
      item_name: 'Managed Gigabit Switches 48-Port PoE+',
      description: 'L3 Managed Switches with 4x SFP+ 10G Uplinks',
      quantity: 5,
      unit_price: 14406.78,
      tax_rate: '18% GST',
      delivery_address: 'VendorBridge Central Store, Cyberabad',
      delivery_contact_person: 'Priya Nair',
      delivery_phone: '+91 97110 55443',
      delivery_instructions: 'Standard loading dock entry.',
      payment_terms: 'Net 30 Days',
      payment_due_days: 30,
      warranty: '1 Year Hardware Warranty',
      return_policy: 'Standard Vendor Policy',
      service_terms: 'Return to Bench Service',
      buyer_name: 'VendorBridge Enterprise Systems Pvt Ltd',
      officer_name: 'Alex Mercer',
      officer_email: 'procurement@vendorbridge.com',
      officer_phone: '+91 98765 43210',
      buyer_address: 'Tech Park One, Cyber City, Bangalore',
      specs_file_url: '#',
      quotation_file_url: '#',
    }
  ]);

  const fetchRealPOs = async () => {
    setLoadingPOs(true);
    try {
      const posData = await api.getPurchaseOrders().catch(() => []);
      setDbOrders(posData);
    } catch (err) {
      console.log('Error fetching POs from backend:', err);
    } finally {
      setLoadingPOs(false);
    }
  };

  useEffect(() => {
    fetchRealPOs();
  }, [vendor?.id]);

  // Helper to convert raw DB PO into full view structure
  const mapRealPoToView = (rawPo) => {
    const rfqObj = rawPo.rfq_details || rfqs.find(r => r.id === rawPo.rfq) || {};
    const quotObj = rawPo.quotation_details || quotations.find(q => q.id === rawPo.quotation) || {};
    const qty = rfqObj.quantity || 10;
    const unitPrice = parseFloat(quotObj.unit_price || (parseFloat(rawPo.subtotal) / qty) || 12500);
    const subtotal = parseFloat(rawPo.subtotal || unitPrice * qty);
    const totalVal = parseFloat(rawPo.total_value || subtotal * 1.18);
    const cgst = parseFloat(rawPo.cgst_amount || quotObj.cgst_amount || subtotal * 0.09);
    const sgst = parseFloat(rawPo.sgst_amount || quotObj.sgst_amount || subtotal * 0.09);

    return {
      id: rawPo.id,
      isRealDb: true,
      po_number: rawPo.po_number || `PO-2026-0042`,
      rfq_number: rfqObj.rfq_number || 'RFQ-2026-8215',
      rfq_title: rfqObj.title || 'Equipment Procurement',
      issue_date: rawPo.issued_at ? new Date(rawPo.issued_at).toISOString().split('T')[0] : (rawPo.created_at ? new Date(rawPo.created_at).toISOString().split('T')[0] : '2026-08-05'),
      expected_delivery_date: rawPo.expected_delivery_date || '2026-08-19',
      subtotal: subtotal,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: parseFloat(rawPo.igst_amount || 0),
      grand_total: totalVal,
      status: rawPo.status || 'issued',
      item_name: rfqObj.title || 'Primary Equipment',
      description: rfqObj.description || 'Enterprise equipment & specifications',
      quantity: qty,
      unit_price: unitPrice,
      tax_rate: quotObj.tax_type === 'IGST_18' ? '18% IGST' : '18% (9% CGST + 9% SGST)',
      delivery_address: rawPo.delivery_address || 'VendorBridge Tech Park, Gate #3, Central Warehouse, Sector 62, Noida, UP - 201309',
      delivery_contact_person: rawPo.delivery_contact_person || 'Rajesh Sharma (Logistics Lead)',
      delivery_phone: rawPo.delivery_phone || '+91 98112 34567',
      delivery_instructions: rawPo.delivery_instructions || 'Deliver between 9:00 AM and 5:00 PM on working days.',
      payment_terms: quotObj.payment_terms || rawPo.payment_terms || 'Net 30 Days',
      payment_due_days: rawPo.payment_due_days || 30,
      warranty: quotObj.warranty || rawPo.warranty || '2 Years Comprehensive On-Site Warranty',
      return_policy: rawPo.return_policy || '14-day replacement for manufacturing defects / DOA',
      service_terms: rawPo.service_terms || 'Next business day (NBD) on-site technical support',
      buyer_name: 'VendorBridge Enterprise Systems Pvt Ltd',
      officer_name: 'Alex Mercer (Senior Procurement Officer)',
      officer_email: 'procurement@vendorbridge.com',
      officer_phone: '+91 98765 43210',
      buyer_address: 'Tech Park One, Tower B, Level 6, Cyber City, Bangalore - 560103',
      specs_file_url: rfqObj.specs_file_url || '#',
      quotation_file_url: quotObj.attachment_url || '#',
      rejection_reason: rawPo.procurement_notes || '',
      rejection_notes: '',
    };
  };

  const isMatchingVendor = (vendorRef, targetVendor) => {
    if (!vendorRef || !targetVendor) return true;
    const targetId = String(targetVendor.id || targetVendor.uuid || '').toLowerCase();
    const targetCode = String(targetVendor.vendor_code || '').toLowerCase();
    const targetEmail = String(targetVendor.email || '').toLowerCase();

    if (typeof vendorRef === 'object') {
      const refId = String(vendorRef.id || vendorRef.uuid || '').toLowerCase();
      const refCode = String(vendorRef.vendor_code || '').toLowerCase();
      const refEmail = String(vendorRef.email || '').toLowerCase();
      return (targetId && refId === targetId) || (targetCode && refCode === targetCode) || (targetEmail && refEmail === targetEmail);
    }
    
    const refStr = String(vendorRef).toLowerCase();
    return (targetId && refStr === targetId) || (targetCode && refStr === targetCode) || (targetEmail && refStr === targetEmail);
  };

  // Filter real POs for active vendor (EXCLUDING unissued draft POs)
  const realVendorOrders = dbOrders
    .filter(p => (isMatchingVendor(p.vendor, vendor) || isMatchingVendor(p.vendor_details, vendor)) && p.status && p.status !== 'draft')
    .map(mapRealPoToView);

  const realPoNumbers = new Set(realVendorOrders.map(o => o.po_number));
  const filteredSampleOrders = sampleOrders.filter(s => !realPoNumbers.has(s.po_number));

  const orders = [...realVendorOrders, ...filteredSampleOrders];

  // Counts for summary cards
  const newCount = orders.filter(o => o.status === 'issued').length;
  const pendingCount = newCount;
  const acknowledgedCount = orders.filter(o => o.status === 'acknowledged').length;
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const rejectedCount = orders.filter(o => o.status === 'rejected').length;

  const handleAcceptPOForPo = async (targetPo) => {
    if (!targetPo) return;
    setSubmitting(true);
    try {
      await api.patchPurchaseOrder(targetPo.id, { status: 'acknowledged' }).catch(err => {
        console.log('PO update fallback notice:', err.message);
      });

      setDbOrders(prev => prev.map(o => o.id === targetPo.id ? { ...o, status: 'acknowledged' } : o));
      setSampleOrders(prev => prev.map(o => o.id === targetPo.id ? { ...o, status: 'acknowledged' } : o));
      if (selectedPo && selectedPo.id === targetPo.id) {
        setSelectedPo(prev => ({ ...prev, status: 'acknowledged' }));
      }
      setShowAcceptModal(false);
      setBannerMsg(`Purchase Order ${targetPo.po_number} has been ACKNOWLEDGED successfully. Procurement Officer notified.`);
      if (onNotify) onNotify(`Purchase Order ${targetPo.po_number} acknowledged successfully.`);
    } catch (err) {
      alert(`Acceptance failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptPO = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedPo) return;
    await handleAcceptPOForPo(selectedPo);
  };

  const handleRejectPO = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedPo) return;
    setSubmitting(true);
    try {
      await api.patchPurchaseOrder(selectedPo.id, { status: 'rejected' }).catch(err => {
        console.log('PO update fallback notice:', err.message);
      });

      setDbOrders(prev => prev.map(o => o.id === selectedPo.id ? { ...o, status: 'rejected', rejection_reason: rejectReason, rejection_notes: rejectNotes } : o));
      setSampleOrders(prev => prev.map(o => o.id === selectedPo.id ? { ...o, status: 'rejected', rejection_reason: rejectReason, rejection_notes: rejectNotes } : o));
      setSelectedPo(prev => ({ ...prev, status: 'rejected', rejection_reason: rejectReason, rejection_notes: rejectNotes }));
      setShowRejectModal(false);
      setBannerMsg(`Purchase Order ${selectedPo.po_number} has been REJECTED. Procurement Officer notified.`);
      if (onNotify) onNotify(`Purchase Order ${selectedPo.po_number} rejected.`);
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartFulfillment = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedPo) return;
    setSubmitting(true);
    try {
      await api.patchPurchaseOrder(selectedPo.id, { status: 'in_progress' }).catch(err => {
        console.log('PO update fallback notice:', err.message);
      });

      setDbOrders(prev => prev.map(o => o.id === selectedPo.id ? { ...o, status: 'in_progress' } : o));
      setSampleOrders(prev => prev.map(o => o.id === selectedPo.id ? { ...o, status: 'in_progress' } : o));
      setSelectedPo(prev => ({ ...prev, status: 'in_progress' }));
      setBannerMsg(`Order fulfillment for ${selectedPo.po_number} has started successfully.`);
      const vendorName = vendor?.name || 'Dell Technologies';
      if (onNotify) onNotify(`Vendor ${vendorName} has started fulfilling Purchase Order ${selectedPo.po_number}.`);
    } catch (err) {
      alert(`Failed to start fulfillment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelivery = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedPo) return;
    setSubmitting(true);
    try {
      await api.patchPurchaseOrder(selectedPo.id, { status: 'delivered' }).catch(err => {
        console.log('PO update fallback notice:', err.message);
      });

      setDbOrders(prev => prev.map(o => o.id === selectedPo.id ? { ...o, status: 'delivered' } : o));
      setSampleOrders(prev => prev.map(o => o.id === selectedPo.id ? { ...o, status: 'delivered' } : o));
      setSelectedPo(prev => ({ ...prev, status: 'delivered' }));
      setShowDeliveryModal(false);
      setBannerMsg(`Purchase Order ${selectedPo.po_number} has been marked as DELIVERED.`);
      const vendorName = vendor?.name || 'Dell Technologies';
      if (onNotify) onNotify(`Vendor ${vendorName} has marked Purchase Order ${selectedPo.po_number} as DELIVERED.`);
    } catch (err) {
      alert(`Failed to confirm delivery: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadInvoice = () => {
    setShowUploadInvoiceView(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'issued': return <span className="badge badge-status-approved">Issued</span>;
      case 'acknowledged': return <span className="badge badge-status-open">Acknowledged</span>;
      case 'in_progress': return <span className="badge badge-priority-medium">In Progress</span>;
      case 'delivered': return <span className="badge badge-status-approved" style={{ background: '#059669', color: '#fff' }}>Delivered</span>;
      case 'invoiced': return <span className="badge badge-priority-medium" style={{ background: '#8b5cf6', color: '#fff' }}>Invoiced</span>;
      case 'paid':
      case 'completed':
      case 'closed': return <span className="badge badge-status-approved" style={{ background: '#10b981', color: '#fff' }}>Paid & Completed</span>;
      case 'rejected_by_finance':
      case 'rejected': return <span className="badge badge-status-rejected" style={{ background: '#ef4444', color: '#fff' }}>Rejected by Finance</span>;
      case 'cancelled': return <span className="badge badge-status-closed">Cancelled</span>;
      default: return <span className="badge badge-status-draft">{status?.toUpperCase()}</span>;
    }
  };

  if (showUploadInvoiceView && selectedPo) {
    return (
      <VendorInvoiceUpload
        po={selectedPo}
        vendor={vendor}
        onBack={() => setShowUploadInvoiceView(false)}
        onInvoiceSubmitted={(invData) => {
          setSelectedPo(prev => ({ ...prev, status: 'invoiced' }));
          if (selectedPo?.isRealDb) {
            setDbOrders(prev => prev.map(o => o.id === selectedPo.id ? { ...o, status: 'invoiced' } : o));
          } else {
            setSampleOrders(prev => prev.map(o => o.id === selectedPo.id ? { ...o, status: 'invoiced' } : o));
          }
          fetchRealPOs();
        }}
        onNotify={onNotify}
      />
    );
  }

  return (
    <div className="qc-page" style={{ paddingBottom: '40px' }}>
      {/* ── DETAIL VIEW ── */}
      {selectedPo ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button className="btn-secondary" onClick={() => { setSelectedPo(null); setBannerMsg(''); }}>
              ← Back to Purchase Orders
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => alert(`Downloading official PDF for ${selectedPo.po_number}...`)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:'middle'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Download Purchase Order PDF
              </button>
            </div>
          </div>

          {bannerMsg && (
            <div className="state-banner info" style={{ marginBottom: '20px', padding: '14px 18px', fontSize: '14px', background: 'rgba(34, 197, 94, 0.15)', borderColor: '#34d399', color: '#34d399' }}>
              {bannerMsg}
            </div>
          )}

          {/* Rejection Reason Banner if Rejected */}
          {selectedPo.status === 'rejected' && (
            <div className="state-banner error" style={{ marginBottom: '20px', padding: '14px 18px' }}>
              <strong><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:'middle'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Purchase Order Rejected</strong><br />
              <span style={{ fontSize: '13px' }}>
                Reason: <strong>{selectedPo.rejection_reason || 'Unable to meet terms'}</strong>
                {selectedPo.rejection_notes && ` — "${selectedPo.rejection_notes}"`}
              </span>
            </div>
          )}

          {/* PO Header */}
          <section className="table-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{selectedPo.po_number}</h1>
                  {getStatusBadge(selectedPo.status)}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Issue Date: {selectedPo.issue_date} · Expected Delivery: <strong>{selectedPo.expected_delivery_date}</strong>
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Reference RFQ</span>
                <span className="mono-text" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>{selectedPo.rfq_number}</span>
                <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedPo.rfq_title}</p>
              </div>
            </div>
          </section>

          {/* Buyer & Vendor Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="table-card info-card" style={{ padding: '20px' }}>
              <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="table-title" style={{ fontSize: '14px' }}>Buyer Information</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div className="info-row"><span className="info-label">Company Name</span><span className="info-val" style={{ fontWeight: 700 }}>{selectedPo.buyer_name}</span></div>
                <div className="info-row"><span className="info-label">Procurement Officer</span><span className="info-val">{selectedPo.officer_name}</span></div>
                <div className="info-row"><span className="info-label">Contact Email</span><span className="info-val">{selectedPo.officer_email}</span></div>
                <div className="info-row"><span className="info-label">Contact Phone</span><span className="info-val">{selectedPo.officer_phone}</span></div>
                <div className="info-row"><span className="info-label">Company Address</span><span className="info-val">{selectedPo.buyer_address}</span></div>
              </div>
            </div>

            <div className="table-card info-card" style={{ padding: '20px' }}>
              <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="table-title" style={{ fontSize: '14px' }}>Vendor Information (You)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div className="info-row"><span className="info-label">Vendor Name</span><span className="info-val" style={{ fontWeight: 700, color: 'var(--accent)' }}>{vendor?.name || 'Dell Technologies'}</span></div>
                <div className="info-row"><span className="info-label">Vendor Code</span><span className="info-val mono-text">{vendor?.vendor_code || 'VND-DELL'}</span></div>
                <div className="info-row"><span className="info-label">Contact Person</span><span className="info-val">{vendor?.contact_person || 'Rajesh Kumar'}</span></div>
                <div className="info-row"><span className="info-label">Email & Phone</span><span className="info-val">{vendor?.email} · {vendor?.phone}</span></div>
                <div className="info-row"><span className="info-label">GST Number</span><span className="info-val mono-text">{vendor?.gst_number || '27AAACD4567E1Z9'}</span></div>
                <div className="info-row"><span className="info-label">Vendor Address</span><span className="info-val">{vendor?.address || 'Bangalore, India'}</span></div>
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <section className="table-card" style={{ marginBottom: '20px' }}>
            <div className="table-header-bar">
              <span className="table-title">Ordered Items</span>
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
                    <th className="num-cell">Tax</th>
                    <th className="num-cell">Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="cell-primary">{selectedPo.item_name}</td>
                    <td><span className="cell-sub">{selectedPo.description}</span></td>
                    <td className="num-cell" style={{ fontWeight: 600 }}>{selectedPo.quantity}</td>
                    <td>Units</td>
                    <td className="num-cell">₹{selectedPo.unit_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="num-cell">{selectedPo.tax_rate}</td>
                    <td className="num-cell" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{selectedPo.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Financial & Delivery Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Delivery Details (Read-only) */}
            <div className="table-card info-card" style={{ padding: '20px' }}>
              <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="table-title">Delivery Details (Read-Only)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div className="info-row"><span className="info-label">Delivery Address</span><span className="info-val">{selectedPo.delivery_address}</span></div>
                <div className="info-row"><span className="info-label">Contact Person</span><span className="info-val">{selectedPo.delivery_contact_person}</span></div>
                <div className="info-row"><span className="info-label">Contact Number</span><span className="info-val">{selectedPo.delivery_phone}</span></div>
                <div className="info-row"><span className="info-label">Expected Delivery Date</span><span className="info-val" style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedPo.expected_delivery_date}</span></div>
                <div className="info-row"><span className="info-label">Instructions</span><span className="info-val">{selectedPo.delivery_instructions}</span></div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="table-card decision-card" style={{ padding: '20px' }}>
              <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="table-title">Financial Summary</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span className="mono-text" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹ {selectedPo.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>CGST (9%)</span>
                  <span className="mono-text">+ ₹ {selectedPo.cgst_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>SGST (9%)</span>
                  <span className="mono-text">+ ₹ {selectedPo.sgst_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
                  <span>Grand Total</span>
                  <span className="mono-text" style={{ color: 'var(--accent)', fontSize: '18px' }}>
                    ₹ {selectedPo.grand_total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Warranty Terms Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="table-card info-card" style={{ padding: '20px' }}>
              <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="table-title">Payment Information</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div className="info-row"><span className="info-label">Payment Terms</span><span className="info-val" style={{ fontWeight: 600 }}>{selectedPo.payment_terms}</span></div>
                <div className="info-row"><span className="info-label">Currency</span><span className="info-val">INR (₹)</span></div>
                <div className="info-row"><span className="info-label">Payment Due Days</span><span className="info-val">{selectedPo.payment_due_days} Days after Invoice Verification</span></div>
              </div>
            </div>

            <div className="table-card info-card" style={{ padding: '20px' }}>
              <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="table-title">Warranty & Service Terms</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div className="info-row"><span className="info-label">Warranty Period</span><span className="info-val" style={{ fontWeight: 700, color: 'var(--accent)' }}>{selectedPo.warranty}</span></div>
                <div className="info-row"><span className="info-label">Return Policy</span><span className="info-val">{selectedPo.return_policy}</span></div>
                <div className="info-row"><span className="info-label">Service Terms</span><span className="info-val">{selectedPo.service_terms}</span></div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="table-card info-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div className="table-header-bar" style={{ paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="table-title">Downloadable Attachments</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="#" onClick={e => { e.preventDefault(); alert('Downloading PO PDF...'); }} className="download-link" style={{ fontSize: '13px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4,verticalAlign:'middle'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Purchase Order PDF ({selectedPo.po_number}.pdf)
              </a>
              <a href="#" onClick={e => { e.preventDefault(); alert('Downloading RFQ Specs...'); }} className="download-link" style={{ fontSize: '13px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4,verticalAlign:'middle'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                RFQ Specification Document
              </a>
              <a href="#" onClick={e => { e.preventDefault(); alert('Downloading Selected Quotation...'); }} className="download-link" style={{ fontSize: '13px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4,verticalAlign:'middle'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Selected Vendor Quotation.pdf
              </a>
            </div>
          </div>

          {/* Timeline */}
          <section className="table-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <div className="table-header-bar" style={{ marginBottom: '20px' }}>
              <span className="table-title">Purchase Order Timeline</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              {[
                { step: '1', title: 'RFQ Received', done: true },
                { step: '2', title: 'Quotation Submitted', done: true },
                { step: '3', title: 'Quotation Selected', done: true },
                { step: '4', title: 'Purchase Order Received', done: true },
                {
                  step: '5',
                  title: 'Purchase Order Acknowledged',
                  done: ['acknowledged', 'in_progress', 'delivered', 'invoiced', 'paid', 'completed', 'closed'].includes(selectedPo.status),
                  current: selectedPo.status === 'issued'
                },
                {
                  step: '6',
                  title: 'Order Fulfillment Started',
                  done: ['in_progress', 'delivered', 'invoiced', 'paid', 'completed', 'closed'].includes(selectedPo.status),
                  current: selectedPo.status === 'acknowledged'
                },
                {
                  step: '7',
                  title: 'Goods Delivered',
                  done: ['delivered', 'invoiced', 'paid', 'completed', 'closed', 'rejected_by_finance', 'rejected'].includes(selectedPo.status),
                  current: selectedPo.status === 'in_progress'
                },
                {
                  step: '8',
                  title: 'Invoice Submitted',
                  done: ['invoiced', 'paid', 'completed', 'closed', 'rejected_by_finance', 'rejected'].includes(selectedPo.status),
                  current: selectedPo.status === 'delivered'
                },
                {
                  step: '9',
                  title: (selectedPo.status === 'rejected_by_finance' || selectedPo.status === 'rejected') ? 'Payment Rejected' : 'Paid & Completed',
                  done: ['paid', 'completed', 'closed'].includes(selectedPo.status),
                  rejected: (selectedPo.status === 'rejected_by_finance' || selectedPo.status === 'rejected'),
                  current: selectedPo.status === 'invoiced'
                },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: item.rejected ? '#ef4444' : item.done ? '#22c55e' : item.current ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                    color: item.rejected || item.done || item.current ? '#fff' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '13px', marginBottom: '8px',
                    boxShadow: item.rejected ? '0 0 12px rgba(239, 68, 68, 0.5)' : 'none'
                  }}>
                    {item.rejected ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ) : item.done ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : item.step}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: item.current || item.rejected ? 700 : 500, color: item.rejected ? '#f87171' : item.current ? 'var(--accent)' : 'var(--text-primary)', textAlign: 'center' }}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Vendor Decision & Order Fulfillment Panels ── */}
          {(selectedPo.status === 'rejected_by_finance' || selectedPo.status === 'rejected') && (
            <div className="table-card decision-card" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#f87171' }}>Invoice Rejected by Finance Department</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    Finance Remarks: <strong>{selectedPo.rejection_reason || selectedPo.procurement_notes || 'Invoice rejected by Finance.'}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
          {['paid', 'completed', 'closed'].includes(selectedPo.status) && (
            <div className="table-card decision-card" style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#10b981' }}>Order Paid & Completed</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    Payment has been successfully processed and disbursed by the Finance Department. This Purchase Order is fully closed and complete.
                  </p>
                </div>
              </div>
            </div>
          )}
          {selectedPo.status === 'issued' && (
            <div className="table-card decision-card" style={{ padding: '24px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Purchase Order Acknowledgement</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    Please review all details before acknowledging this Purchase Order.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-secondary" style={{ borderColor: '#ef4444', color: '#f87171' }} onClick={() => setShowRejectModal(true)}>
                    Reject Purchase Order
                  </button>
                  <button className="btn-primary" style={{ background: '#22c55e', borderColor: '#22c55e' }} onClick={() => setShowAcceptModal(true)}>
                    Accept Purchase Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedPo.status === 'acknowledged' && (
            <div className="table-card decision-card" style={{ padding: '24px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Order Fulfillment</h3>
                    <span className="badge badge-status-open">Acknowledged</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    The Purchase Order has been acknowledged. You can now begin fulfilling the order.
                  </p>
                </div>
                <div>
                  <button type="button" className="btn-primary" style={{ background: '#0284c7', borderColor: '#0284c7' }} onClick={(e) => handleStartFulfillment(e)} disabled={submitting}>
                    {submitting ? 'Starting…' : '▶ Start Fulfillment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedPo.status === 'in_progress' && (
            <div className="table-card decision-card" style={{ padding: '24px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Order Fulfillment In Progress</h3>
                    <span className="badge badge-priority-medium">In Progress</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    The order is currently being prepared for delivery. Please mark the order as delivered once all requested items have been supplied.
                  </p>
                </div>
                <div>
                  <button type="button" className="btn-primary" style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#000', fontWeight: 700 }} onClick={(e) => handleConfirmDelivery(e)} disabled={submitting}>
                    {submitting ? 'Confirming…' : '✓ Mark as Delivered'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedPo.status === 'delivered' && (
            <div className="table-card decision-card" style={{ padding: '24px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Goods Delivered Successfully</h3>
                    <span className="badge badge-status-approved" style={{ background: '#059669', color: '#fff' }}>Delivered</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    Goods have been delivered successfully. The next step is to upload the invoice for payment processing.
                  </p>
                </div>
                <div>
                  <button className="btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={handleUploadInvoice}>
                    Upload Invoice
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div>
          {/* Summary Cards */}
          <section className="stats-row">
            <div className="stat-card stat-blue">
              <div className="stat-header">
                <span className="stat-label">New Purchase Orders</span>
              </div>
              <div className="stat-value">{newCount}</div>
              <span className="stat-sub">Newly issued POs</span>
            </div>
            <div className="stat-card stat-amber">
              <div className="stat-header">
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-value">{inProgressCount}</div>
              <span className="stat-sub">Fulfillment underway</span>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-header">
                <span className="stat-label">Delivered POs</span>
              </div>
              <div className="stat-value">{deliveredCount}</div>
              <span className="stat-sub">Goods delivered</span>
            </div>
            <div className="stat-card stat-zinc">
              <div className="stat-header">
                <span className="stat-label">Acknowledged / Rejected</span>
              </div>
              <div className="stat-value">{acknowledgedCount + rejectedCount}</div>
              <span className="stat-sub">{acknowledgedCount} Ack · {rejectedCount} Rej</span>
            </div>
          </section>

          {/* Table */}
          <section className="table-card">
            <div className="table-header-bar">
              <span className="table-title">Purchase Orders Received</span>
              <span className="table-count">{orders.length} Total</span>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>RFQ Number</th>
                    <th>RFQ Title</th>
                    <th>Issue Date</th>
                    <th>Expected Delivery</th>
                    <th>Grand Total (₹)</th>
                    <th>Status</th>
                    <th className="th-actions">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-state">
                        <p>No Purchase Orders received yet.</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map(po => (
                      <tr key={po.id}>
                        <td><span className="mono-text">{po.po_number}</span></td>
                        <td><span className="mono-text">{po.rfq_number}</span></td>
                        <td><span className="cell-primary">{po.rfq_title}</span></td>
                        <td className="date-cell">{po.issue_date}</td>
                        <td className="date-cell">{po.expected_delivery_date}</td>
                        <td className="num-cell" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                          ₹{po.grand_total?.toLocaleString('en-IN')}
                        </td>
                        <td>{getStatusBadge(po.status)}</td>
                        <td className="actions-cell" style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {po.status === 'issued' && (
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ padding: '4px 12px', fontSize: '12px', background: '#22c55e', borderColor: '#22c55e' }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAcceptPOForPo(po);
                              }}
                              disabled={submitting}
                            >
                              ✓ Accept PO
                            </button>
                          )}
                          {po.status === 'acknowledged' && (
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ padding: '4px 12px', fontSize: '12px', background: '#0284c7', borderColor: '#0284c7' }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedPo(po);
                                handleStartFulfillment(e);
                              }}
                              disabled={submitting}
                            >
                              ▶ Start Fulfillment
                            </button>
                          )}
                          {po.status === 'in_progress' && (
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ padding: '4px 12px', fontSize: '12px', background: '#f59e0b', borderColor: '#f59e0b', color: '#000', fontWeight: 700 }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedPo(po);
                                handleConfirmDelivery(e);
                              }}
                              disabled={submitting}
                            >
                              ✓ Mark Delivered
                            </button>
                          )}
                          {po.status === 'delivered' && (
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ padding: '4px 12px', fontSize: '12px', background: '#10b981', borderColor: '#10b981' }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedPo(po);
                                handleUploadInvoice();
                              }}
                            >
                              📄 Upload Invoice
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '4px 12px', fontSize: '12px' }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedPo(po);
                            }}
                          >
                            View
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
      )}

      {/* ── ACCEPT CONFIRMATION MODAL ── */}
      {showAcceptModal && selectedPo && (
        <div className="modal-overlay" onClick={() => setShowAcceptModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-head">
              <h2 className="modal-title">Confirm Purchase Order</h2>
              <button className="modal-close" onClick={() => setShowAcceptModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="modal-body" style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <p style={{ margin: 0 }}>
                By accepting this Purchase Order <strong>{selectedPo.po_number}</strong>, you agree to supply the requested items according to the specified price, delivery date (<strong>{selectedPo.expected_delivery_date}</strong>), and payment terms (<strong>{selectedPo.payment_terms}</strong>).
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setShowAcceptModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: '#22c55e', borderColor: '#22c55e' }} onClick={handleAcceptPO} disabled={submitting}>
                {submitting ? 'Accepting…' : 'Accept Purchase Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELIVERY MODAL ── */}
      {showDeliveryModal && selectedPo && (
        <div className="modal-overlay" onClick={() => setShowDeliveryModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-head">
              <h2 className="modal-title">Confirm Delivery</h2>
              <button className="modal-close" onClick={() => setShowDeliveryModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="modal-body" style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <p style={{ margin: 0 }}>
                Have all ordered items for Purchase Order <strong>{selectedPo.po_number}</strong> been delivered successfully to the buyer?
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setShowDeliveryModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#000', fontWeight: 700 }} onClick={handleConfirmDelivery} disabled={submitting}>
                {submitting ? 'Confirming…' : 'Confirm Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {showRejectModal && selectedPo && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-head">
              <h2 className="modal-title">Reject Purchase Order</h2>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="field">
                <label>Rejection Reason *</label>
                <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                  <option value="Unable to meet delivery schedule">Unable to meet delivery schedule</option>
                  <option value="Pricing error">Pricing error</option>
                  <option value="Item unavailable">Item unavailable</option>
                  <option value="Capacity constraints">Capacity constraints</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Additional Notes / Remarks</label>
                <textarea
                  rows="3"
                  value={rejectNotes}
                  onChange={e => setRejectNotes(e.target.value)}
                  placeholder="Provide additional details regarding the rejection..."
                />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={handleRejectPO} disabled={submitting}>
                {submitting ? 'Rejecting…' : 'Reject Purchase Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
