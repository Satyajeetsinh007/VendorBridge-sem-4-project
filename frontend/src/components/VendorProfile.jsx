import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

/* ── Per-vendor mock data ── */
const vendorMockData = {
  'VND-DELL': {
    stats: { rfqsInvited: 48, quotationsSubmitted: 42, quotationsWon: 28, purchaseOrders: 25, onTimeDelivery: 96, avgDeliveryDays: 12, totalBusinessValue: '₹2.85 Cr' },
    activity: [
      { rfq: 'RFQ-2026-3401', item: 'Dell Latitude 5540 Laptops', price: '₹62,500', result: 'Selected', date: '28 Jul 2026' },
      { rfq: 'RFQ-2026-3298', item: 'PowerEdge R760 Servers', price: '₹4,85,000', result: 'Selected', date: '22 Jul 2026' },
      { rfq: 'RFQ-2026-3190', item: 'Dell P2423D Monitors', price: '₹18,900', result: 'Rejected', date: '15 Jul 2026' },
      { rfq: 'RFQ-2026-3042', item: 'OptiPlex 7010 Desktops', price: '₹54,200', result: 'Selected', date: '08 Jul 2026' },
      { rfq: 'RFQ-2026-2955', item: 'Dell EMC Storage Units', price: '₹7,20,000', result: 'Selected', date: '01 Jul 2026' },
    ],
    chartOrders: [3, 5, 4, 6, 5, 7, 4, 6, 5, 8, 6, 5],
    chartRevenue: [18, 32, 24, 38, 30, 42, 28, 36, 32, 48, 38, 34],
    ratingTrend: [4.2, 4.3, 4.4, 4.5, 4.5, 4.6, 4.6, 4.5, 4.7, 4.7, 4.8, 4.7],
  },
  'VND-HP': {
    stats: { rfqsInvited: 40, quotationsSubmitted: 35, quotationsWon: 22, purchaseOrders: 20, onTimeDelivery: 92, avgDeliveryDays: 14, totalBusinessValue: '₹1.92 Cr' },
    activity: [
      { rfq: 'RFQ-2026-3412', item: 'HP ProBook 450 G10', price: '₹58,200', result: 'Selected', date: '29 Jul 2026' },
      { rfq: 'RFQ-2026-3305', item: 'HP LaserJet Pro Printers', price: '₹24,500', result: 'Selected', date: '23 Jul 2026' },
      { rfq: 'RFQ-2026-3200', item: 'HP Z4 Workstations', price: '₹1,85,000', result: 'Rejected', date: '16 Jul 2026' },
      { rfq: 'RFQ-2026-3088', item: 'HP EliteDisplay Monitors', price: '₹16,800', result: 'Selected', date: '09 Jul 2026' },
      { rfq: 'RFQ-2026-2962', item: 'HP Networking Switches', price: '₹42,000', result: 'Rejected', date: '02 Jul 2026' },
    ],
    chartOrders: [2, 4, 3, 5, 4, 5, 3, 4, 5, 6, 4, 4],
    chartRevenue: [12, 22, 18, 28, 24, 30, 16, 24, 28, 36, 26, 24],
    ratingTrend: [4.0, 4.1, 4.2, 4.3, 4.3, 4.4, 4.4, 4.5, 4.5, 4.5, 4.5, 4.5],
  },
  'VND-LNV': {
    stats: { rfqsInvited: 35, quotationsSubmitted: 30, quotationsWon: 18, purchaseOrders: 16, onTimeDelivery: 88, avgDeliveryDays: 16, totalBusinessValue: '₹1.45 Cr' },
    activity: [
      { rfq: 'RFQ-2026-3420', item: 'ThinkPad T14s Gen 4', price: '₹72,000', result: 'Selected', date: '30 Jul 2026' },
      { rfq: 'RFQ-2026-3312', item: 'Lenovo Tab M10 Tablets', price: '₹15,800', result: 'Rejected', date: '24 Jul 2026' },
      { rfq: 'RFQ-2026-3205', item: 'ThinkCentre M70q Desktops', price: '₹38,500', result: 'Selected', date: '17 Jul 2026' },
      { rfq: 'RFQ-2026-3095', item: 'IdeaPad Flex 5 Notebooks', price: '₹48,200', result: 'Rejected', date: '10 Jul 2026' },
      { rfq: 'RFQ-2026-2970', item: 'ThinkVision T27h Monitors', price: '₹22,000', result: 'Selected', date: '03 Jul 2026' },
    ],
    chartOrders: [2, 3, 2, 4, 3, 4, 2, 3, 4, 5, 3, 3],
    chartRevenue: [10, 16, 12, 22, 18, 24, 14, 18, 22, 30, 20, 18],
    ratingTrend: [4.0, 4.0, 4.1, 4.2, 4.1, 4.2, 4.3, 4.2, 4.3, 4.3, 4.3, 4.3],
  },
  'VND-GDJ': {
    stats: { rfqsInvited: 30, quotationsSubmitted: 26, quotationsWon: 20, purchaseOrders: 18, onTimeDelivery: 94, avgDeliveryDays: 21, totalBusinessValue: '₹1.68 Cr' },
    activity: [
      { rfq: 'RFQ-2026-3415', item: 'Executive Office Chairs', price: '₹12,800', result: 'Selected', date: '29 Jul 2026' },
      { rfq: 'RFQ-2026-3308', item: 'Conference Table Set', price: '₹1,45,000', result: 'Selected', date: '23 Jul 2026' },
      { rfq: 'RFQ-2026-3195', item: 'Modular Workstations (50)', price: '₹8,50,000', result: 'Selected', date: '15 Jul 2026' },
      { rfq: 'RFQ-2026-3080', item: 'Filing Cabinets (Steel)', price: '₹6,200', result: 'Rejected', date: '08 Jul 2026' },
      { rfq: 'RFQ-2026-2950', item: 'Reception Furniture Set', price: '₹2,20,000', result: 'Selected', date: '01 Jul 2026' },
    ],
    chartOrders: [1, 2, 3, 2, 3, 4, 3, 3, 4, 4, 3, 4],
    chartRevenue: [8, 14, 18, 14, 20, 28, 20, 22, 28, 30, 24, 28],
    ratingTrend: [4.3, 4.3, 4.4, 4.4, 4.5, 4.5, 4.5, 4.6, 4.6, 4.6, 4.6, 4.6],
  },
  'VND-DRN': {
    stats: { rfqsInvited: 22, quotationsSubmitted: 18, quotationsWon: 10, purchaseOrders: 9, onTimeDelivery: 85, avgDeliveryDays: 25, totalBusinessValue: '₹78 L' },
    activity: [
      { rfq: 'RFQ-2026-3418', item: 'Ergonomic Desk Chairs', price: '₹9,500', result: 'Selected', date: '30 Jul 2026' },
      { rfq: 'RFQ-2026-3310', item: 'Wooden Bookshelves', price: '₹18,000', result: 'Rejected', date: '24 Jul 2026' },
      { rfq: 'RFQ-2026-3198', item: 'Cafeteria Tables & Chairs', price: '₹3,50,000', result: 'Selected', date: '16 Jul 2026' },
      { rfq: 'RFQ-2026-3085', item: 'Lounge Sofas', price: '₹45,000', result: 'Rejected', date: '09 Jul 2026' },
      { rfq: 'RFQ-2026-2958', item: 'Visitor Chairs (Pack 20)', price: '₹52,000', result: 'Selected', date: '02 Jul 2026' },
    ],
    chartOrders: [1, 1, 2, 1, 2, 2, 1, 2, 2, 3, 2, 2],
    chartRevenue: [4, 6, 10, 6, 12, 14, 8, 12, 14, 18, 12, 14],
    ratingTrend: [3.8, 3.9, 3.9, 4.0, 4.0, 4.0, 4.1, 4.0, 4.1, 4.1, 4.1, 4.1],
  },
  'VND-ABC': {
    stats: { rfqsInvited: 55, quotationsSubmitted: 48, quotationsWon: 32, purchaseOrders: 30, onTimeDelivery: 90, avgDeliveryDays: 5, totalBusinessValue: '₹42 L' },
    activity: [
      { rfq: 'RFQ-2026-3425', item: 'A4 Copier Paper (500 reams)', price: '₹1,25,000', result: 'Selected', date: '31 Jul 2026' },
      { rfq: 'RFQ-2026-3315', item: 'Ink Cartridges (HP/Canon)', price: '₹38,000', result: 'Selected', date: '25 Jul 2026' },
      { rfq: 'RFQ-2026-3210', item: 'Whiteboard Markers (bulk)', price: '₹8,500', result: 'Rejected', date: '18 Jul 2026' },
      { rfq: 'RFQ-2026-3100', item: 'Desk Organizers (200 pcs)', price: '₹24,000', result: 'Selected', date: '11 Jul 2026' },
      { rfq: 'RFQ-2026-2968', item: 'Stationery Kit (Annual)', price: '₹1,80,000', result: 'Selected', date: '04 Jul 2026' },
    ],
    chartOrders: [4, 5, 6, 5, 7, 6, 5, 6, 7, 8, 6, 7],
    chartRevenue: [3, 4, 5, 4, 6, 5, 4, 5, 6, 7, 5, 6],
    ratingTrend: [3.6, 3.7, 3.7, 3.8, 3.8, 3.9, 3.9, 3.8, 3.9, 3.9, 3.9, 3.9],
  },
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ── Simple bar chart ── */
function MiniBarChart({ data, color = '#3b82f6', label }) {
  const max = Math.max(...data);
  return (
    <div className="mini-chart">
      <span className="mini-chart-label">{label}</span>
      <div className="mini-chart-bars">
        {data.map((val, i) => (
          <div key={i} className="mini-bar-wrap" title={`${months[i]}: ${val}`}>
            <div className="mini-bar" style={{ height: `${(val / max) * 100}%`, background: color }} />
            <span className="mini-bar-month">{months[i].charAt(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Line chart ── */
function MiniLineChart({ data, color = '#22c55e', label }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 80;
  const w = 240;
  const points = data.map((val, i) =>
    `${(i / (data.length - 1)) * w},${h - ((val - min) / range) * (h - 10)}`
  ).join(' ');

  return (
    <div className="mini-chart">
      <span className="mini-chart-label">{label}</span>
      <svg viewBox={`0 0 ${w} ${h + 5}`} style={{ width: '100%', height: '90px' }}>
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {data.map((val, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((val - min) / range) * (h - 10)} r="3" fill={color}>
            <title>{months[i]}: {val}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

export default function VendorProfile({ vendor, vendors, onVendorSwitch }) {
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [editData, setEditData] = useState({
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
    contact_person: vendor?.contact_person || '',
  });

  useEffect(() => {
    setEditData({
      email: vendor?.email || '',
      phone: vendor?.phone || '',
      address: vendor?.address || '',
      contact_person: vendor?.contact_person || '',
    });
  }, [vendor?.id]);

  const mock = vendorMockData[vendor?.vendor_code] || vendorMockData['VND-DELL'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patchVendor(vendor.id, editData);
      setSuccessMsg('Contact details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getLogoInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'VN';
  };

  const logoColors = {
    'VND-DELL': 'linear-gradient(135deg, #0076CE, #00A3E0)',
    'VND-HP': 'linear-gradient(135deg, #0096D6, #0073AA)',
    'VND-LNV': 'linear-gradient(135deg, #E2231A, #FF4444)',
    'VND-GDJ': 'linear-gradient(135deg, #4A154B, #7C3AED)',
    'VND-DRN': 'linear-gradient(135deg, #B45309, #D97706)',
    'VND-ABC': 'linear-gradient(135deg, #059669, #10B981)',
  };

  return (
    <div className="vendor-profile-page">

      {/* Vendor Switcher */}
      {vendors && vendors.length > 1 && (
        <div className="vendor-switcher">
          {vendors.map(v => (
            <button
              key={v.id}
              className={`vendor-switch-btn ${v.id === vendor?.id ? 'active' : ''}`}
              onClick={() => onVendorSwitch(v)}
            >
              <div className="vsw-logo" style={{ background: logoColors[v.vendor_code] || 'var(--accent)' }}>
                {getLogoInitials(v.name)}
              </div>
              <span>{v.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Company Header */}
      <div className="vendor-hero">
        <div className="vendor-hero-left">
          <div className="vendor-logo-lg" style={{ background: logoColors[vendor?.vendor_code] || 'var(--accent)' }}>
            {getLogoInitials(vendor?.name)}
          </div>
          <div className="vendor-hero-info">
            <h2 className="vendor-hero-name">{vendor?.name}</h2>
            <div className="vendor-hero-meta">
              <span className="mono-text">{vendor?.vendor_code}</span>
              <span className="dept-chip">{vendor?.category || 'General'}</span>
              <span className={`badge badge-status-${vendor?.status === 'verified' ? 'open' : 'draft'}`}>
                {vendor?.status?.toUpperCase()}
              </span>
            </div>
            <div className="vendor-hero-contact">
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:'middle'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{vendor?.contact_person || '—'}</span>
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:'middle'}}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{vendor?.email}</span>
              <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:5,verticalAlign:'middle'}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.36 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>{vendor?.phone}</span>
            </div>
          </div>
        </div>
        <div className="vendor-hero-right">
          <div className="vendor-rating-box">
            <span className="rating-value"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{marginRight:4,verticalAlign:'middle',color:'#f59e0b'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{vendor?.rating || '0.00'}</span>
            <span className="rating-label">Overall Rating</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <section className="stats-row vendor-stats-row">
        <div className="stat-card stat-blue stat-sm">
          <span className="stat-label">RFQs Invited</span>
          <div className="stat-value">{mock.stats.rfqsInvited}</div>
        </div>
        <div className="stat-card stat-amber stat-sm">
          <span className="stat-label">Quotations Submitted</span>
          <div className="stat-value">{mock.stats.quotationsSubmitted}</div>
        </div>
        <div className="stat-card stat-green stat-sm">
          <span className="stat-label">Quotations Won</span>
          <div className="stat-value">{mock.stats.quotationsWon}</div>
        </div>
        <div className="stat-card stat-zinc stat-sm">
          <span className="stat-label">Purchase Orders</span>
          <div className="stat-value">{mock.stats.purchaseOrders}</div>
        </div>
        <div className="stat-card stat-blue stat-sm">
          <span className="stat-label">On-time Delivery</span>
          <div className="stat-value">{mock.stats.onTimeDelivery}%</div>
        </div>
        <div className="stat-card stat-amber stat-sm">
          <span className="stat-label">Avg. Delivery</span>
          <div className="stat-value">{mock.stats.avgDeliveryDays}d</div>
        </div>
        <div className="stat-card stat-green stat-sm">
          <span className="stat-label">Total Business</span>
          <div className="stat-value">{mock.stats.totalBusinessValue}</div>
        </div>
      </section>

      {/* Charts Row */}
      <div className="vendor-charts-grid">
        <div className="table-card chart-card">
          <div className="table-header-bar"><span className="table-title">Orders Won Over Time</span></div>
          <div style={{ padding: '16px' }}>
            <MiniBarChart data={mock.chartOrders} color="#3b82f6" label="Monthly orders" />
          </div>
        </div>
        <div className="table-card chart-card">
          <div className="table-header-bar"><span className="table-title">Monthly Business Value (₹L)</span></div>
          <div style={{ padding: '16px' }}>
            <MiniBarChart data={mock.chartRevenue} color="#10b981" label="Revenue in Lakhs" />
          </div>
        </div>
        <div className="table-card chart-card">
          <div className="table-header-bar"><span className="table-title">Delivery Performance</span></div>
          <div style={{ padding: '16px' }}>
            <MiniBarChart data={mock.chartOrders.map((v, i) => Math.round(80 + Math.random() * 18))} color="#f59e0b" label="On-time %" />
          </div>
        </div>
        <div className="table-card chart-card">
          <div className="table-header-bar"><span className="table-title">Rating Trend</span></div>
          <div style={{ padding: '16px' }}>
            <MiniLineChart data={mock.ratingTrend} color="#8b5cf6" label="Rating (out of 5)" />
          </div>
        </div>
      </div>

      {/* Company Details + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Info Card */}
        <div className="table-card info-card">
          <div className="table-header-bar">
            <span className="table-title">Company Details</span>
          </div>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">Company Name</span>
              <span className="info-val">{vendor?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Vendor Code</span>
              <span className="info-val mono-text">{vendor?.vendor_code}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Category</span>
              <span className="info-val">{vendor?.category || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Contact Person</span>
              <span className="info-val">{vendor?.contact_person || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-val">{vendor?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-val">{vendor?.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">GST Number</span>
              <span className="info-val mono-text">{vendor?.gst_number || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Website</span>
              <span className="info-val">
                {vendor?.website ? <a href={vendor.website} target="_blank" rel="noreferrer" className="download-link">{vendor.website}</a> : '—'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Address</span>
              <span className="info-val">{vendor?.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Registered</span>
              <span className="info-val">{vendor?.created_at ? new Date(vendor.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="table-card">
          <div className="table-header-bar">
            <span className="table-title">Recent Procurement Activity</span>
            <span className="table-count">{mock.activity.length} records</span>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>RFQ Number</th>
                  <th>Item</th>
                  <th>Quoted Price</th>
                  <th>Result</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {mock.activity.map((a, i) => (
                  <tr key={i}>
                    <td><span className="mono-text">{a.rfq}</span></td>
                    <td><span className="cell-primary">{a.item}</span></td>
                    <td className="num-cell">{a.price}</td>
                    <td>
                      <span className={`badge badge-status-${a.result === 'Selected' ? 'open' : 'rejected'}`}>
                        {a.result}
                      </span>
                    </td>
                    <td className="date-cell">{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Editable Contact & Password */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="table-card info-card">
          <div className="table-header-bar"><span className="table-title">Edit Contact Details</span></div>
          <form onSubmit={handleSaveContact} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {successMsg && (
              <div className="state-banner info" style={{ padding: '8px 12px', margin: 0 }}>{successMsg}</div>
            )}
            <div className="field-row">
              <div className="field">
                <label>Contact Person</label>
                <input type="text" name="contact_person" value={editData.contact_person} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" name="email" value={editData.email} onChange={handleChange} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Phone</label>
                <input type="text" name="phone" value={editData.phone} onChange={handleChange} />
              </div>
              <div className="field full" style={{ flex: 2 }}>
                <label>Address</label>
                <input type="text" name="address" value={editData.address} onChange={handleChange} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-end' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="table-card decision-card">
          <div className="table-header-bar"><span className="table-title">Change Password</span></div>
          <form className="decision-body" style={{ gap: '14px', display: 'flex', flexDirection: 'column' }}>
            <div className="field"><label>Current Password</label><input type="password" /></div>
            <div className="field"><label>New Password</label><input type="password" /></div>
            <div className="field"><label>Confirm Password</label><input type="password" /></div>
            <button type="button" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
