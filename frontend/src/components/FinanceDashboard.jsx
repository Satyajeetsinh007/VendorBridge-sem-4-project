import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './ProcurementDashboard.css';

/* ── SVG Icons ── */
const Icons = {
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
  ),
  CheckCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
  ),
  XCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
  ),
  CreditCard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  ),
  DollarSign: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  ),
  Database: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
  ),
};

/* ── Fallback Initial Invoices ── */
const MOCK_INITIAL_INVOICES = [
  {
    id: 'inv-101',
    invoice_number: 'INV-2026-0089',
    vendor_invoice_number: 'DELL/INV/2026/8841',
    po_number: 'PO-2026-0042',
    rfq_number: 'RFQ-2026-8215',
    rfq_title: 'Enterprise Laptops Procurement',
    department: 'Engineering & Operations',
    procurement_officer: 'Alex Mercer',
    vendor_name: 'Dell Technologies',
    vendor_code: 'VND-DELL',
    vendor_contact: 'Rajesh Sharma',
    vendor_email: 'enterprise@dell.com',
    vendor_phone: '+91-1800-425-3355',
    vendor_gst: '27AABCD1234F1Z5',
    invoice_date: '2026-08-04',
    due_date: '2026-09-04',
    amount: 147500,
    subtotal: 125000,
    cgst_amount: 11250,
    sgst_amount: 11250,
    igst_amount: 0,
    status: 'pending_verification',
    bank_name: 'HDFC Bank',
    account_number: '50200049281049',
    ifsc_code: 'HDFC0000240',
    upi_id: 'dell.tech@hdfcbank',
    items: [
      { name: 'Dell XPS 15 (i9 / 32GB / 1TB SSD)', qty: 10, unit_price: 12500, tax_pct: 18, line_total: 147500 },
    ],
  },
  {
    id: 'inv-102',
    invoice_number: 'INV-2026-0042',
    vendor_invoice_number: 'HP/INV/9921',
    po_number: 'PO-2026-0038',
    rfq_number: 'RFQ-2026-1049',
    rfq_title: 'High-Performance Workstations',
    department: 'Information Technology',
    procurement_officer: 'Priya Shah',
    vendor_name: 'HP Inc.',
    vendor_code: 'VND-HP',
    vendor_contact: 'Sunil Mehta',
    vendor_email: 'b2b@hp.com',
    vendor_phone: '+91-1800-108-4747',
    vendor_gst: '07AAACH1234F1Z8',
    invoice_date: '2026-08-01',
    due_date: '2026-08-31',
    amount: 236000,
    subtotal: 200000,
    cgst_amount: 18000,
    sgst_amount: 18000,
    igst_amount: 0,
    status: 'approved',
    bank_name: 'ICICI Bank',
    account_number: '000405018291',
    ifsc_code: 'ICIC0000004',
    upi_id: 'hp.b2b@icici',
    items: [
      { name: 'HP ZBook Studio Workstation', qty: 8, unit_price: 25000, tax_pct: 18, line_total: 236000 },
    ],
  },
  {
    id: 'inv-103',
    invoice_number: 'INV-2026-0012',
    vendor_invoice_number: 'LNV/2026/7712',
    po_number: 'PO-2026-0019',
    rfq_number: 'RFQ-2026-0922',
    rfq_title: 'Office Monitor Displays 27-inch',
    department: 'Logistics & Supply Chain',
    procurement_officer: 'Alex Mercer',
    vendor_name: 'Lenovo Commercial',
    vendor_code: 'VND-LNV',
    vendor_contact: 'Anita Roy',
    vendor_email: 'sales@lenovo.com',
    vendor_phone: '+91-1800-419-7555',
    vendor_gst: '29AABCL9981F1Z2',
    invoice_date: '2026-07-20',
    due_date: '2026-08-20',
    amount: 88500,
    subtotal: 75000,
    cgst_amount: 6750,
    sgst_amount: 6750,
    igst_amount: 0,
    status: 'paid',
    payment_date: '2026-07-25',
    payment_method: 'NEFT',
    transaction_ref: 'UTR982347102938',
    payment_remarks: 'Verified & Disbursed via Corporate Netbanking',
    bank_name: 'Axis Bank',
    account_number: '9180200391029',
    ifsc_code: 'UTIB0000128',
    items: [
      { name: 'Lenovo ThinkVision 27-inch 4K Monitor', qty: 15, unit_price: 5000, tax_pct: 18, line_total: 88500 },
    ],
  },
];

export default function FinanceDashboard({ onLogout, currentUser, onToggleRole }) {
  const [invoices, setInvoices] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, text: 'Vendor Dell Technologies submitted INV-2026-0089 for PO-2026-0042.', time: '10m ago', priority: 'medium' },
    { id: 2, text: 'Invoice INV-2026-0042 (HP Inc.) verified and ready for payment disbursement.', time: '2h ago', priority: 'low' },
    { id: 3, text: 'Disbursed ₹88,500 via NEFT to Lenovo Commercial for INV-2026-0012. UTR: UTR982347102938.', time: '1d ago', priority: 'low' },
    { id: 4, text: 'Q3 GST reconciliation report generated successfully for Finance Lead approval.', time: '3d ago', priority: 'medium' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vendorFilter, setVendorFilter] = useState('ALL');

  // Review sub-view state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [checklist, setChecklist] = useState({
    amountMatch: false,
    qtyMatch: false,
    deliveryComplete: false,
    gstVerified: false,
    bankVerified: false,
  });
  const [financeRemarks, setFinanceRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Record Payment form state
  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'NEFT',
    transaction_ref: '',
    payment_remarks: '',
  });

  // Password change state for Profile
  const [passData, setPassData] = useState({ old_pass: '', new_pass: '', confirm_pass: '' });

  // Enrich raw backend invoice objects with linked PO, Vendor, RFQ, and Department data
  const enrichInvoiceData = (rawInvoices, posData, vendData, rfqsData) => {
    return rawInvoices.map(inv => {
      const matchPO = inv.po_details || posData.find(p => p.id === inv.po || p.id === inv.po_id) || {};
      const matchVendor = inv.vendor_details || matchPO.vendor_details || vendData.find(v => v.id === inv.vendor || v.id === matchPO.vendor) || {};
      const matchRFQ = matchPO.rfq_details || (rfqsData || []).find(r => r.id === matchPO.rfq) || {};

      const po_number = matchPO.po_number || inv.po_number || 'PO-2026-0042';
      const vendor_name = matchVendor.name || inv.vendor_name || 'Dell Technologies';
      const vendor_code = matchVendor.vendor_code || inv.vendor_code || 'VND-DELL';
      const vendor_contact = matchVendor.contact_person || inv.vendor_contact || 'Rajesh Sharma';
      const vendor_gst = matchVendor.gst_number || inv.vendor_gst || '27AABCD1234F1Z5';
      const vendor_email = matchVendor.email || inv.vendor_email || 'enterprise@dell.com';
      const vendor_phone = matchVendor.phone || inv.vendor_phone || '+91-1800-425-3355';

      const rfq_title = matchRFQ.title || inv.rfq_title || 'Enterprise Laptops Procurement';
      const rfq_number = matchRFQ.rfq_number || inv.rfq_number || 'RFQ-2026-8215';
      const department = matchRFQ.department_details?.name || matchRFQ.department_details?.code || inv.department || 'Engineering & Operations';
      const procurement_officer = matchRFQ.created_by_details?.name || inv.procurement_officer || 'Alex Mercer';

      const amount = parseFloat(inv.amount) || parseFloat(matchPO.total_value) || 147500;
      const subtotal = parseFloat(inv.subtotal) || parseFloat(matchPO.subtotal) || (amount / 1.18);
      const cgst_amount = parseFloat(inv.cgst_amount) || (subtotal * 0.09);
      const sgst_amount = parseFloat(inv.sgst_amount) || (subtotal * 0.09);
      const igst_amount = parseFloat(inv.igst_amount) || 0;

      const items = (inv.items && inv.items.length > 0)
        ? inv.items.map(it => ({
            name: it.description || it.name || rfq_title,
            qty: it.quantity || it.qty || matchRFQ.quantity || 10,
            unit_price: parseFloat(it.unit_price) || (subtotal / (it.quantity || matchRFQ.quantity || 10)),
            tax_pct: 18,
            line_total: parseFloat(it.total_price) || parseFloat(it.line_total) || amount,
          }))
        : [
            {
              name: rfq_title,
              qty: matchRFQ.quantity || 10,
              unit_price: subtotal / (matchRFQ.quantity || 10),
              tax_pct: 18,
              line_total: amount,
            }
          ];

      return {
        ...inv,
        po_number,
        vendor_name,
        vendor_code,
        vendor_contact,
        vendor_gst,
        vendor_email,
        vendor_phone,
        rfq_title,
        rfq_number,
        department,
        procurement_officer,
        amount,
        subtotal,
        cgst_amount,
        sgst_amount,
        igst_amount,
        items,
      };
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let [invData, posData, vendData, rfqsData] = await Promise.all([
        api.getInvoices().catch(() => []),
        api.getPurchaseOrders().catch(() => []),
        api.getVendors().catch(() => []),
        api.getRFQs().catch(() => []),
      ]);

      setPurchaseOrders(posData);
      setVendors(vendData);
      setRfqs(rfqsData);

      if (invData && invData.length > 0) {
        const enriched = enrichInvoiceData(invData, posData, vendData, rfqsData);
        setInvoices(enriched);
      } else {
        const enriched = enrichInvoiceData(MOCK_INITIAL_INVOICES, posData, vendData, rfqsData);
        setInvoices(enriched);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView, selectedInvoice]);

  useEffect(() => {
    const handleNewNotif = (e) => {
      const { text, priority, role } = e.detail;
      if (role === 'finance') {
        setNotificationsList(prev => [
          { id: Date.now(), text, time: 'Just now', priority },
          ...prev
        ]);
        setHasUnreadNotifs(true);
      }
    };
    window.addEventListener('vendorbridge-notification', handleNewNotif);
    return () => window.removeEventListener('vendorbridge-notification', handleNewNotif);
  }, []);

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.po_number?.toLowerCase().includes(q) ||
      inv.vendor_name?.toLowerCase().includes(q) ||
      inv.department?.toLowerCase().includes(q) ||
      inv.rfq_title?.toLowerCase().includes(q) ||
      inv.rfq_number?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter.toLowerCase();
    const matchesVendor = vendorFilter === 'ALL' || inv.vendor_name === vendorFilter || inv.vendor_code === vendorFilter;

    return matchesSearch && matchesStatus && matchesVendor;
  });

  // Metrics
  const pendingCount = invoices.filter(i => i.status === 'pending_verification' || i.status === 'draft').length;
  const approvedCount = invoices.filter(i => i.status === 'approved').length;
  const rejectedCount = invoices.filter(i => i.status === 'rejected').length;
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const totalAmountPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  // Open invoice review page
  const openInvoiceReview = (inv) => {
    setSelectedInvoice(inv);
    setFinanceRemarks(inv.notes || '');
    setChecklist({
      amountMatch: inv.status === 'approved' || inv.status === 'paid',
      qtyMatch: inv.status === 'approved' || inv.status === 'paid',
      deliveryComplete: inv.status === 'approved' || inv.status === 'paid',
      gstVerified: inv.status === 'approved' || inv.status === 'paid',
      bankVerified: inv.status === 'approved' || inv.status === 'paid',
    });
    setPaymentData({
      payment_date: inv.payment_date || new Date().toISOString().split('T')[0],
      payment_method: inv.payment_method || 'NEFT',
      transaction_ref: inv.transaction_ref || '',
      payment_remarks: inv.payment_remarks || '',
    });
  };

  const handleApproveInvoice = async () => {
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      await api.patchInvoice(selectedInvoice.id, {
        status: 'approved',
        notes: financeRemarks || 'Invoice verified & approved by Finance Department.',
      }).catch(() => {});

      const updated = {
        ...selectedInvoice,
        status: 'approved',
        notes: financeRemarks || 'Invoice verified & approved by Finance Department.',
      };
      setSelectedInvoice(updated);
      setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
      window.dispatchEvent(new CustomEvent('vendorbridge-notification', {
        detail: {
          text: `Invoice approved by Finance for PO ${selectedInvoice.purchase_order_details?.po_number || 'PO'}`,
          priority: 'medium',
          role: 'procurement_officer'
        }
      }));
      alert('Invoice approved successfully. You can now record the payment.');
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectInvoice = async () => {
    if (!selectedInvoice) return;
    if (!financeRemarks.trim()) {
      alert('Rejection reason is mandatory in Finance Remarks before rejecting an invoice.');
      return;
    }
    setSubmitting(true);
    try {
      await api.patchInvoice(selectedInvoice.id, {
        status: 'rejected',
        notes: financeRemarks,
      }).catch(() => {});

      const poId = selectedInvoice.po?.id || selectedInvoice.po || selectedInvoice.po_id;
      if (poId) {
        await api.patchPurchaseOrder(poId, {
          status: 'rejected_by_finance',
          procurement_notes: financeRemarks,
        }).catch(() => {});
      }

      const updated = {
        ...selectedInvoice,
        status: 'rejected',
        notes: financeRemarks,
      };
      setSelectedInvoice(updated);
      setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
      window.dispatchEvent(new CustomEvent('vendorbridge-notification', {
        detail: {
          text: `Invoice rejected by Finance for PO ${selectedInvoice.purchase_order_details?.po_number || 'PO'}`,
          priority: 'high',
          role: 'procurement_officer'
        }
      }));
      window.dispatchEvent(new CustomEvent('vendorbridge-notification', {
        detail: {
          text: `Invoice ${selectedInvoice.invoice_number} rejected by Finance`,
          priority: 'high',
          role: 'vendor'
        }
      }));
      alert('Invoice rejected by Finance. Purchase Order status updated to REJECTED BY FINANCE across all portals.');
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (!paymentData.transaction_ref.trim()) {
      alert('Please provide a valid Transaction Reference / UTR Number.');
      return;
    }
    setSubmitting(true);
    try {
      // 1. Update invoice to paid
      await api.patchInvoice(selectedInvoice.id, {
        status: 'paid',
        notes: financeRemarks,
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        transaction_ref: paymentData.transaction_ref,
        payment_remarks: paymentData.payment_remarks,
      }).catch(() => {});

      // 2. Mark PO as PAID / COMPLETED if matched
      const poTargetId = selectedInvoice.po?.id || selectedInvoice.po || selectedInvoice.po_id;
      if (poTargetId) {
        await api.patchPurchaseOrder(poTargetId, { status: 'paid' }).catch(() => {});
      }

      const updated = {
        ...selectedInvoice,
        status: 'paid',
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        transaction_ref: paymentData.transaction_ref,
        payment_remarks: paymentData.payment_remarks,
      };
      setSelectedInvoice(updated);
      setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
      window.dispatchEvent(new CustomEvent('vendorbridge-notification', {
        detail: {
          text: `Payment disbursed for Purchase Order ${selectedInvoice.purchase_order_details?.po_number || 'PO'}`,
          priority: 'medium',
          role: 'vendor'
        }
      }));
      window.dispatchEvent(new CustomEvent('vendorbridge-notification', {
        detail: {
          text: `Purchase Order ${selectedInvoice.purchase_order_details?.po_number || 'PO'} paid & completed`,
          priority: 'low',
          role: 'procurement_officer'
        }
      }));
      alert(`Payment of ₹${parseFloat(updated.amount).toLocaleString('en-IN')} marked as PAID!\nPurchase Order status updated to PAID & COMPLETED across all portals.\nNotifications sent to Vendor & Procurement Officer.`);
    } catch (err) {
      alert(`Payment processing failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const sidebarLinks = [
    { icon: <Icons.Home />, label: 'Dashboard', view: 'dashboard' },
    { icon: <Icons.FileText />, label: 'Pending Invoices', view: 'pending-invoices', count: pendingCount },
    { icon: <Icons.CreditCard />, label: 'Payment History', view: 'payment-history' },
    { icon: <Icons.Bell />, label: 'Notifications', view: 'notifications', count: 3 },
    { icon: <Icons.User />, label: 'Profile', view: 'profile' },
  ];

  return (
    <div className="layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img 
            src="/logo.png" 
            className="brand-logo" 
            alt="VB" 
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            style={{ objectFit: 'contain', padding: '2px', background: 'transparent' }} 
          />
          <div className="brand-logo" style={{ display: 'none', background: '#10b981' }}>VB</div>
          <div className="brand-text">
            <span className="brand-name">VendorBridge</span>
            <span className="brand-sub">Finance & Treasury</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Finance Portal</span>
          {sidebarLinks.map(link => (
            <a
              key={link.label}
              href="#"
              className={`nav-link ${currentView === link.view && !selectedInvoice ? 'active' : ''}`}
              onClick={e => {
                e.preventDefault();
                setSelectedInvoice(null);
                setCurrentView(link.view);
                if (link.view === 'notifications') {
                  setHasUnreadNotifs(false);
                }
              }}
            >
              {link.icon}
              <span>{link.label}</span>
              {link.count !== undefined && link.count > 0 && (
                <span className="pill-count" style={{ marginLeft: 'auto', background: '#10b981' }}>{link.count}</span>
              )}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="seed-btn" onClick={fetchData}>
            <Icons.Database /> Refresh Data
          </button>

          {/* Usage limit bar matching between.indevs.in */}
          <div className="sidebar-usage">
            <div className="usage-label">Paid Invoices: {paidCount} / 100</div>
            <div className="usage-progress-bar">
              <div className="usage-progress-fill" style={{ width: `${Math.min((paidCount / 100) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Profile widget matching between.indevs.in */}
          <div className="sidebar-profile">
            <div className="profile-avatar" style={{ background: '#111827' }}>
              {((currentUser?.name || 'Sarah Jenkins'))[0]}
            </div>
            <div className="profile-meta">
              <span className="profile-name">{currentUser?.name || 'Sarah Jenkins'}</span>
              <span className="profile-email">{currentUser?.email || 'finance@vendorbridge.com'}</span>
            </div>
            {onLogout && (
              <button className="profile-logout-btn" onClick={onLogout} title="Logout">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">
              {selectedInvoice ? `Invoice Verification & Payment: ${selectedInvoice.invoice_number}` :
               currentView === 'pending-invoices' ? 'Pending Invoices for Verification' :
               currentView === 'payment-history' ? 'Corporate Payment History' :
               currentView === 'notifications' ? 'Finance Notifications' :
               currentView === 'profile' ? 'Finance Officer Profile' : 'Finance Dashboard'}
            </h1>
            <span className="breadcrumb">
              Finance &nbsp;/&nbsp; {
                selectedInvoice ? selectedInvoice.invoice_number :
                currentView === 'pending-invoices' ? 'Pending Queue' :
                currentView === 'payment-history' ? 'Disbursements' :
                currentView === 'notifications' ? 'Alerts & Activity' :
                currentView === 'profile' ? 'Account Settings' : 'Overview'
              }
            </span>
          </div>

          <div className="topbar-right">
            {onToggleRole && (
              <button className="btn-secondary" onClick={onToggleRole} style={{ borderStyle: 'dashed', color: 'var(--accent)' }}>
                ⇄ Switch Portal
              </button>
            )}
            <div className="topbar-divider" />
            <button className="icon-btn" title="Notifications" onClick={() => { setSelectedInvoice(null); setCurrentView('notifications'); setHasUnreadNotifs(false); }}>
              <Icons.Bell />
              {hasUnreadNotifs && <span className="notif-dot" style={{ background: '#10b981' }} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main key={selectedInvoice ? `inv-${selectedInvoice.id}` : currentView} className="content">
          {selectedInvoice ? (
            /* ════════════════════════════════════════
               INVOICE REVIEW & PAYMENT PAGE
               ════════════════════════════════════════ */
            <div className="qc-page" style={{ paddingBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button className="btn-secondary" onClick={() => setSelectedInvoice(null)}>
                  ← Back to Pending Invoices
                </button>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge badge-status-${selectedInvoice.status === 'paid' || selectedInvoice.status === 'approved' ? 'approved' : selectedInvoice.status === 'rejected' ? 'rejected' : 'open'}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
                    STATUS: {selectedInvoice.status?.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* ── Summary Header Grid ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* PO Info */}
                <div className="table-card" style={{ padding: '20px' }}>
                  <span className="table-title" style={{ fontSize: '14px', marginBottom: '12px', display: 'block', color: 'var(--accent)' }}>
                    📦 Purchase Order Info
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>PO Number:</span> <strong>{selectedInvoice.po_number}</strong></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>RFQ Number:</span> <span className="mono-text">{selectedInvoice.rfq_number || 'RFQ-2026-8215'}</span></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>RFQ Title:</span> {selectedInvoice.rfq_title || 'Enterprise Laptops Procurement'}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Department:</span> <span className="dept-chip">{selectedInvoice.department || 'Engineering'}</span></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Officer:</span> <strong>{selectedInvoice.procurement_officer || 'Alex Mercer'}</strong></div>
                  </div>
                </div>

                {/* Vendor Info */}
                <div className="table-card" style={{ padding: '20px' }}>
                  <span className="table-title" style={{ fontSize: '14px', marginBottom: '12px', display: 'block', color: '#10b981' }}>
                    Vendor Info
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Vendor Name:</span> <strong>{selectedInvoice.vendor_name || 'Dell Technologies'}</strong></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Vendor Code:</span> <span className="mono-text">{selectedInvoice.vendor_code || 'VND-DELL'}</span></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Contact Person:</span> {selectedInvoice.vendor_contact || 'Rajesh Sharma'}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>GST Number:</span> <span className="mono-text">{selectedInvoice.vendor_gst || '27AABCD1234F1Z5'}</span></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Email / Phone:</span> {selectedInvoice.vendor_email || 'b2b@vendor.com'} | {selectedInvoice.vendor_phone || '+91-98765-43210'}</div>
                  </div>
                </div>

                {/* Invoice Info */}
                <div className="table-card" style={{ padding: '20px' }}>
                  <span className="table-title" style={{ fontSize: '14px', marginBottom: '12px', display: 'block', color: '#f59e0b' }}>
                    Invoice Details
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Invoice Number:</span> <strong>{selectedInvoice.invoice_number}</strong></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Vendor Ref #:</span> <span className="mono-text">{selectedInvoice.vendor_invoice_number || 'DELL/INV/8841'}</span></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Invoice Date:</span> {selectedInvoice.invoice_date}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Due Date:</span> <strong style={{ color: '#f87171' }}>{selectedInvoice.due_date}</strong></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Bank Account:</span> {selectedInvoice.bank_name || 'HDFC Bank'} ({selectedInvoice.account_number || '50200049281049'})</div>
                  </div>
                </div>
              </div>

              {/* ── Invoice Line Items Table ── */}
              <section className="table-card" style={{ marginBottom: '20px' }}>
                <div className="table-header-bar">
                  <span className="table-title">Invoice Line Items</span>
                  <span className="table-count">{selectedInvoice.items?.length || 1} Item(s)</span>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th className="num-cell">Qty</th>
                        <th className="num-cell">Unit Price (₹)</th>
                        <th className="num-cell">Tax %</th>
                        <th className="num-cell">Line Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items : [
                        { name: 'Dell XPS 15 (i9 / 32GB / 1TB SSD)', qty: 10, unit_price: 12500, tax_pct: 18, line_total: 147500 }
                      ]).map((item, idx) => (
                        <tr key={idx}>
                          <td><span className="cell-primary">{item.name}</span></td>
                          <td className="num-cell">{item.qty}</td>
                          <td className="num-cell">₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</td>
                          <td className="num-cell">{item.tax_pct || 18}%</td>
                          <td className="num-cell" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                            ₹{parseFloat(item.line_total).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ── Financial Summary & Supporting Documents ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Financial Summary */}
                <div className="table-card" style={{ padding: '20px' }}>
                  <span className="table-title" style={{ marginBottom: '16px', display: 'block' }}>Tax & Financial Breakdown</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                      <strong>₹{parseFloat(selectedInvoice.subtotal || selectedInvoice.amount * 0.847).toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>CGST (9%):</span>
                      <span>₹{parseFloat(selectedInvoice.cgst_amount || selectedInvoice.amount * 0.076).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>SGST (9%):</span>
                      <span>₹{parseFloat(selectedInvoice.sgst_amount || selectedInvoice.amount * 0.076).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>IGST (18%):</span>
                      <span>₹{parseFloat(selectedInvoice.igst_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '16px' }}>
                      <strong>Grand Total:</strong>
                      <strong style={{ color: '#10b981' }}>₹{parseFloat(selectedInvoice.amount).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                {/* Supporting Documents */}
                <div className="table-card" style={{ padding: '20px' }}>
                  <span className="table-title" style={{ marginBottom: '16px', display: 'block' }}>Supporting Documents</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px' }} onClick={() => alert('Downloading Tax Invoice PDF...')}>
                      <span>Vendor Tax Invoice PDF</span>
                      <Icons.Download />
                    </button>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px' }} onClick={() => alert('Downloading Purchase Order PDF...')}>
                      <span>Issued Purchase Order PDF</span>
                      <Icons.Download />
                    </button>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px' }} onClick={() => alert('Downloading Signed Delivery Challan...')}>
                      <span>Signed Delivery Challan / Proof</span>
                      <Icons.Download />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Verification Checklist ── */}
              <div className="table-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <span className="table-title" style={{ marginBottom: '14px', display: 'block' }}>Audit &amp; Verification Checklist</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {[
                    { key: 'amountMatch', label: 'Invoice amount matches Purchase Order & Quote' },
                    { key: 'qtyMatch', label: 'Item quantities match Purchase Order' },
                    { key: 'deliveryComplete', label: 'Delivery completed & Quality Inspection passed' },
                    { key: 'gstVerified', label: 'GST details & Tax registration verified' },
                    { key: 'bankVerified', label: 'Bank Account & IFSC / UPI details verified' },
                  ].map(item => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'var(--text-primary)', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <input
                        type="checkbox"
                        checked={checklist[item.key]}
                        onChange={e => setChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Finance Remarks ── */}
              <div className="table-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Finance Remarks & Audit Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter verification remarks or rejection reason..."
                  value={financeRemarks}
                  onChange={e => setFinanceRemarks(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13.5px' }}
                />
              </div>

              {/* ── Actions / Approval Buttons ── */}
              {selectedInvoice.status !== 'approved' && selectedInvoice.status !== 'paid' && (
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button className="btn-secondary" style={{ padding: '10px 24px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }} onClick={handleRejectInvoice} disabled={submitting}>
                    Reject Invoice
                  </button>
                  <button className="btn-primary" style={{ padding: '10px 28px', background: '#10b981', borderColor: '#10b981' }} onClick={handleApproveInvoice} disabled={submitting}>
                    Approve Invoice
                  </button>
                </div>
              )}

              {/* ── RECORD PAYMENT SECTION (For Approved / Paid Invoices) ── */}
              {(selectedInvoice.status === 'approved' || selectedInvoice.status === 'paid') && (
                <div className="table-card info-card" style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div className="table-header-bar" style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '16px', paddingBottom: '8px' }}>
                    <span className="table-title" style={{ fontSize: '16px', color: '#10b981' }}>
                       Record Corporate Payment &amp; Disburse Funds
                    </span>
                    <span className="badge" style={{ background: selectedInvoice.status === 'paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: selectedInvoice.status === 'paid' ? '#10b981' : '#f59e0b', border: `1px solid ${selectedInvoice.status === 'paid' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, fontWeight: '600' }}>
                      {selectedInvoice.status === 'paid' ? 'PAID & DISBURSED' : 'READY FOR PAYMENT'}
                    </span>
                  </div>

                  <form onSubmit={handleMarkAsPaid} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="field-row">
                      <div className="field">
                        <label>Payment Date <span className="req">*</span></label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          required
                          value={paymentData.payment_date || new Date().toISOString().split('T')[0]}
                          onChange={e => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                          disabled={selectedInvoice.status === 'paid'}
                        />
                      </div>
                      <div className="field">
                        <label>Payment Method <span className="req">*</span></label>
                        <select
                          value={paymentData.payment_method}
                          onChange={e => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                          disabled={selectedInvoice.status === 'paid'}
                        >
                          <option value="NEFT">NEFT (National Electronic Funds Transfer)</option>
                          <option value="RTGS">RTGS (Real Time Gross Settlement)</option>
                          <option value="IMPS">IMPS (Immediate Payment Service)</option>
                          <option value="UPI">UPI Corporate Transfer</option>
                          <option value="Cheque">Corporate Account Cheque</option>
                        </select>
                      </div>
                    </div>

                    <div className="field-row">
                      <div className="field">
                        <label>Transaction Reference / UTR Number <span className="req">*</span></label>
                        <input
                          type="text"
                          placeholder="e.g. UTR982347102938"
                          required
                          value={paymentData.transaction_ref}
                          onChange={e => setPaymentData(prev => ({ ...prev, transaction_ref: e.target.value }))}
                          disabled={selectedInvoice.status === 'paid'}
                        />
                      </div>
                      <div className="field">
                        <label>Disbursement Bank & Account</label>
                        <input
                          type="text"
                          readOnly
                          value={`${selectedInvoice.bank_name || 'HDFC Bank'} - Account #${selectedInvoice.account_number || '50200049281049'}`}
                          style={{ opacity: 0.8 }}
                        />
                      </div>
                    </div>

                    <div className="field full">
                      <label>Payment Remarks</label>
                      <textarea
                        rows="2"
                        placeholder="Enter disbursement notes, banking remarks..."
                        value={paymentData.payment_remarks}
                        onChange={e => setPaymentData(prev => ({ ...prev, payment_remarks: e.target.value }))}
                        disabled={selectedInvoice.status === 'paid'}
                      />
                    </div>

                    {selectedInvoice.status !== 'paid' && (
                      <button type="submit" className="btn-primary" disabled={submitting} style={{ alignSelf: 'flex-end', padding: '12px 32px', fontSize: '14px', background: '#10b981', borderColor: '#10b981' }}>
                        {submitting ? 'Processing Payment…' : '💳 Mark as Paid & Close Order'}
                      </button>
                    )}
                  </form>
                </div>
              )}
            </div>
          ) : currentView === 'pending-invoices' ? (
            /* ════════════════════════════════════════
               PENDING INVOICES VIEW
               ════════════════════════════════════════ */
            <div>
              <div className="toolbar" style={{ marginBottom: '16px' }}>
                <div className="search-input" style={{ flex: 1, maxWidth: '440px' }}>
                  <Icons.Search />
                  <input
                    type="text"
                    placeholder="Search by Invoice #, PO #, Vendor, Dept..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <section className="table-card">
                <div className="table-header-bar">
                  <span className="table-title">Invoices Awaiting Verification</span>
                  <span className="table-count">{filteredInvoices.filter(i => i.status === 'pending_verification' || i.status === 'draft').length} Pending</span>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>PO #</th>
                        <th>Vendor</th>
                        <th>Department</th>
                        <th>Invoice Date</th>
                        <th>Amount (₹)</th>
                        <th>Status</th>
                        <th className="th-actions">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.filter(i => i.status === 'pending_verification' || i.status === 'draft').length === 0 ? (
                        <tr>
                          <td colSpan="8" className="empty-state">
                            <Icons.FileText />
                            <p>No pending invoices awaiting verification.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices
                          .filter(i => i.status === 'pending_verification' || i.status === 'draft')
                          .map(inv => (
                            <tr key={inv.id}>
                              <td><span className="mono-text">{inv.invoice_number}</span></td>
                              <td>
                                <span className="mono-text">{inv.po_number}</span>
                                {inv.rfq_title && <span className="cell-sub" style={{ color: 'var(--accent)' }}>{inv.rfq_title}</span>}
                              </td>
                              <td>
                                <span className="cell-primary">{inv.vendor_name}</span>
                                <span className="cell-sub">{inv.vendor_code}</span>
                              </td>
                              <td><span className="dept-chip">{inv.department || 'ENG'}</span></td>
                              <td className="date-cell">{inv.invoice_date}</td>
                              <td className="num-cell" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                                ₹{parseFloat(inv.amount).toLocaleString('en-IN')}
                              </td>
                              <td><span className="badge badge-status-open">PENDING</span></td>
                              <td className="actions-cell">
                                <button className="btn-action btn-submit" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => openInvoiceReview(inv)}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4, verticalAlign: 'middle'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Review
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
          ) : currentView === 'payment-history' ? (
            /* ════════════════════════════════════════
               PAYMENT HISTORY VIEW
               ════════════════════════════════════════ */
            <div>
              {/* Toolbar & Filters */}
              <div className="toolbar" style={{ marginBottom: '16px', gap: '12px' }}>
                <div className="search-input" style={{ flex: 1, maxWidth: '380px' }}>
                  <Icons.Search />
                  <input
                    type="text"
                    placeholder="Search history by Invoice #, PO #, UTR..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="field" style={{ minWidth: '160px' }}>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', fontSize: '13px' }}>
                    <option value="ALL">All Statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING_VERIFICATION">Pending</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="field" style={{ minWidth: '180px' }}>
                  <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} style={{ padding: '8px 12px', fontSize: '13px' }}>
                    <option value="ALL">All Vendors</option>
                    <option value="Dell Technologies">Dell Technologies</option>
                    <option value="HP Inc.">HP Inc.</option>
                    <option value="Lenovo Commercial">Lenovo Commercial</option>
                  </select>
                </div>
              </div>

              <section className="table-card">
                <div className="table-header-bar">
                  <span className="table-title">All Payment & Invoice Records</span>
                  <span className="table-count">{filteredInvoices.length} Records</span>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Vendor</th>
                        <th>PO #</th>
                        <th>Amount (₹)</th>
                        <th>Payment Date</th>
                        <th>Transaction Ref / UTR</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="empty-state">
                            <Icons.CreditCard />
                            <p>No payment records match your filters.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map(inv => (
                          <tr key={inv.id} onClick={() => openInvoiceReview(inv)} style={{ cursor: 'pointer' }}>
                            <td><span className="mono-text">{inv.invoice_number}</span></td>
                            <td>
                              <span className="cell-primary">{inv.vendor_name}</span>
                              <span className="cell-sub">{inv.vendor_code}</span>
                            </td>
                            <td><span className="mono-text">{inv.po_number}</span></td>
                            <td className="num-cell" style={{ fontWeight: 700, color: '#10b981' }}>
                              ₹{parseFloat(inv.amount).toLocaleString('en-IN')}
                            </td>
                            <td className="date-cell">{inv.payment_date || '—'}</td>
                            <td><span className="mono-text">{inv.transaction_ref || '—'}</span></td>
                            <td>
                              <span className={`badge badge-status-${inv.status === 'paid' || inv.status === 'approved' ? 'approved' : inv.status === 'rejected' ? 'rejected' : 'open'}`}>
                                {inv.status?.toUpperCase().replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : currentView === 'notifications' ? (
            /* ── Notifications View ── */
            <div className="table-card" style={{ padding: '24px' }}>
              <span className="table-title" style={{ marginBottom: '20px', display: 'block' }}>Finance Activity &amp; Notifications</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {notificationsList.map(n => (
                  <div key={n.id} className={`notification-item ${n.priority}`} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{n.text}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Priority: <span style={{ textTransform: 'uppercase', color: n.priority === 'high' ? 'var(--danger)' : n.priority === 'medium' ? 'var(--warning)' : 'var(--accent)' }}>{n.priority}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : currentView === 'profile' ? (
            /* ════════════════════════════════════════
               PROFILE VIEW
               ════════════════════════════════════════ */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="table-card" style={{ padding: '24px' }}>
                <span className="table-title" style={{ marginBottom: '20px', display: 'block' }}>Finance Officer Profile</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Full Name:</span> <strong>{currentUser?.name || 'Sarah Jenkins'}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Employee ID:</span> <span className="mono-text">FIN-EMP-2026-08</span></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Department:</span> <span className="dept-chip">Finance & Accounting</span></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Role:</span> <strong>Finance Lead / Treasury Officer</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Email:</span> <span className="mono-text">{currentUser?.email || 'finance@vendorbridge.com'}</span></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Phone:</span> +91 98765 43210</div>
                </div>
              </div>

              <div className="table-card info-card" style={{ padding: '24px' }}>
                <span className="table-title" style={{ marginBottom: '16px', display: 'block' }}>Change Password</span>
                <form onSubmit={e => { e.preventDefault(); alert('Password updated successfully!'); setPassData({ old_pass: '', new_pass: '', confirm_pass: '' }); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="field">
                    <label>Current Password</label>
                    <input type="password" required value={passData.old_pass} onChange={e => setPassData(prev => ({ ...prev, old_pass: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>New Password</label>
                    <input type="password" required value={passData.new_pass} onChange={e => setPassData(prev => ({ ...prev, new_pass: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Confirm New Password</label>
                    <input type="password" required value={passData.confirm_pass} onChange={e => setPassData(prev => ({ ...prev, confirm_pass: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', background: '#10b981', borderColor: '#10b981' }}>
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* ════════════════════════════════════════
               MAIN DASHBOARD VIEW
               ════════════════════════════════════════ */
            <>
              {/* Summary Cards */}
              <section className="stats-row">
                <div className="stat-card stat-amber">
                  <div className="stat-header">
                    <span className="stat-label">Pending Verification</span>
                    <div className="stat-icon-wrap"><Icons.Clock /></div>
                  </div>
                  <div className="stat-value">{pendingCount}</div>
                  <span className="stat-sub">Invoices in review queue</span>
                </div>

                <div className="stat-card stat-blue">
                  <div className="stat-header">
                    <span className="stat-label">Approved Invoices</span>
                    <div className="stat-icon-wrap"><Icons.CheckCircle /></div>
                  </div>
                  <div className="stat-value">{approvedCount}</div>
                  <span className="stat-sub">Ready for payment</span>
                </div>

                <div className="stat-card stat-zinc">
                  <div className="stat-header">
                    <span className="stat-label">Rejected Invoices</span>
                    <div className="stat-icon-wrap"><Icons.XCircle /></div>
                  </div>
                  <div className="stat-value">{rejectedCount}</div>
                  <span className="stat-sub">Sent back to vendor</span>
                </div>

                <div className="stat-card stat-green">
                  <div className="stat-header">
                    <span className="stat-label">Payments Completed</span>
                    <div className="stat-icon-wrap"><Icons.CreditCard /></div>
                  </div>
                  <div className="stat-value">{paidCount}</div>
                  <span className="stat-sub">Disbursed via Banking</span>
                </div>

                <div className="stat-card stat-green" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                  <div className="stat-header">
                    <span className="stat-label">Total Amount Paid</span>
                    <div className="stat-icon-wrap" style={{ color: '#10b981', fontWeight: '800', fontSize: '15px' }}>₹</div>
                  </div>
                  <div className="stat-value" style={{ color: '#10b981', fontSize: '22px' }}>
                    ₹{totalAmountPaid.toLocaleString('en-IN')}
                  </div>
                  <span className="stat-sub">Total disbursed funds</span>
                </div>
              </section>

              {/* Pending Invoices Table */}
              <section className="table-card">
                <div className="table-header-bar">
                  <span className="table-title">Pending Invoices for Verification</span>
                  <span className="table-count">{pendingCount} {pendingCount === 1 ? 'invoice' : 'invoices'}</span>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice Number</th>
                        <th>Purchase Order Number</th>
                        <th>Vendor</th>
                        <th>Department</th>
                        <th>Invoice Date</th>
                        <th>Amount (₹)</th>
                        <th>Status</th>
                        <th className="th-actions">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.filter(i => i.status === 'pending_verification' || i.status === 'draft').length === 0 ? (
                        <tr>
                          <td colSpan="8" className="empty-state">
                            <Icons.FileText />
                            <p>No pending invoices awaiting verification.</p>
                          </td>
                        </tr>
                      ) : (
                        invoices
                          .filter(i => i.status === 'pending_verification' || i.status === 'draft')
                          .map(inv => (
                            <tr key={inv.id}>
                              <td><span className="mono-text">{inv.invoice_number}</span></td>
                              <td>
                                <span className="mono-text">{inv.po_number}</span>
                                {inv.rfq_title && <span className="cell-sub" style={{ color: 'var(--accent)' }}>{inv.rfq_title}</span>}
                              </td>
                              <td>
                                <span className="cell-primary">{inv.vendor_name}</span>
                                <span className="cell-sub">{inv.vendor_code}</span>
                              </td>
                              <td><span className="dept-chip">{inv.department || 'ENG'}</span></td>
                              <td className="date-cell">{inv.invoice_date}</td>
                              <td className="num-cell" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                                ₹{parseFloat(inv.amount).toLocaleString('en-IN')}
                              </td>
                              <td><span className="badge badge-status-open">PENDING VERIFICATION</span></td>
                              <td className="actions-cell">
                                <button className="btn-action btn-submit" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => openInvoiceReview(inv)}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4, verticalAlign: 'middle'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Review
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
