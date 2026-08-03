import React, { useState } from 'react';

export default function ManagerProfile({ manager }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    setSuccessMsg('Password updated successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="profile-container">
      <div className="review-grid">
        {/* Profile Card */}
        <div className="review-main-panel">
          <div className="table-card info-card">
            <div className="table-header-bar">
              <span className="table-title">Personal Profile Information</span>
            </div>
            
            <div className="info-grid profile-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-val">{manager?.name || 'Jane Doe'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Work Email</span>
                <span className="info-val">{manager?.email || 'manager@vendorbridge.com'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-val dept-chip">{manager?.department_details?.name || 'Engineering & Operations'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role Classification</span>
                <span className="info-val">Executive / Authorized Manager</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Reset Card */}
        <div className="review-sidebar-panel">
          <div className="table-card decision-card">
            <div className="table-header-bar">
              <span className="table-title">Update Credentials</span>
            </div>
            
            <form onSubmit={handlePasswordChange} className="decision-body" style={{ gap: '14px', display: 'flex', flexDirection: 'column' }}>
              {successMsg && (
                <div className="state-banner info" style={{ padding: '8px 12px', margin: 0 }}>
                  {successMsg}
                </div>
              )}

              <div className="field">
                <label>Current Password</label>
                <input 
                  type="password" 
                  required 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                />
              </div>

              <div className="field">
                <label>New Password</label>
                <input 
                  type="password" 
                  required 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                />
              </div>

              <div className="field">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
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
