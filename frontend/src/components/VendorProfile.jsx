import React, { useState } from 'react';
import { api } from '../services/api';

export default function VendorProfile({ vendor }) {
  const [editData, setEditData] = useState({
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    setSuccessMsg('Password updated successfully!');
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="profile-container">
      <div className="review-grid">
        {/* Company Info */}
        <div className="review-main-panel">
          <div className="table-card info-card">
            <div className="table-header-bar">
              <span className="table-title">Company Information</span>
              <span className="badge badge-status-open">{vendor?.status?.toUpperCase() || 'ACTIVE'}</span>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Company Name</span>
                <span className="info-val">{vendor?.name || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Vendor Code</span>
                <span className="info-val mono-text">{vendor?.vendor_code || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Rating</span>
                <span className="info-val">⭐ {vendor?.rating || '0.00'} / 5.00</span>
              </div>
              <div className="info-item">
                <span className="info-label">Registered Since</span>
                <span className="info-val">{vendor?.created_at ? new Date(vendor.created_at).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>

          {/* Editable Contact */}
          <div className="table-card info-card">
            <div className="table-header-bar">
              <span className="table-title">Contact Details</span>
            </div>
            <form onSubmit={handleSaveContact} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {successMsg && (
                <div className="state-banner info" style={{ padding: '8px 12px', margin: 0 }}>{successMsg}</div>
              )}
              <div className="field-row">
                <div className="field">
                  <label>Email</label>
                  <input type="email" name="email" value={editData.email} onChange={handleChange} />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input type="text" name="phone" value={editData.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="field full">
                <label>Address</label>
                <textarea name="address" rows="3" value={editData.address} onChange={handleChange} />
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-end' }}>
                {saving ? 'Saving…' : 'Save Contact Details'}
              </button>
            </form>
          </div>
        </div>

        {/* Password Card */}
        <div className="review-sidebar-panel">
          <div className="table-card decision-card">
            <div className="table-header-bar">
              <span className="table-title">Update Password</span>
            </div>
            <form onSubmit={handlePasswordChange} className="decision-body" style={{ gap: '14px', display: 'flex', flexDirection: 'column' }}>
              <div className="field">
                <label>Current Password</label>
                <input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div>
              <div className="field">
                <label>New Password</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
