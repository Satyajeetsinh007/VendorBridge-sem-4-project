const API_BASE_URL = 'http://localhost:8000/api';

const handleResponse = async (res) => {
  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    if (res.status === 404) {
      throw new Error(`Endpoint not found (404). Please ensure Django server is running on http://localhost:8000.`);
    }
    if (res.status >= 500) {
      throw new Error(`Server Error (${res.status}). Check Django server console for exception log.`);
    }
    throw new Error(`Backend server returned an HTML response (${res.status}). Please check if Django server is running on http://localhost:8000.`);
  }

  if (res.status === 403) {
    const err = new Error(json.message || json.error || 'Access denied');
    err.code = json.error;   // 'pending' | 'rejected'
    err.reason = json.reason || null;
    throw err;
  }

  if (!res.ok) {
    throw new Error(json.error || json.message || `Request failed with status ${res.status}`);
  }

  return json;
};

export const api = {
  // ── Auth ──────────────────────────────────────────
  signupUser: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup/user/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  signupVendor: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup/vendor/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  // ── Admin ──────────────────────────────────────────
  adminGetPendingUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/pending/users/`);
    if (!res.ok) throw new Error('Failed to fetch pending users');
    return res.json();
  },

  adminGetPendingVendors: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/pending/vendors/`);
    if (!res.ok) throw new Error('Failed to fetch pending vendors');
    return res.json();
  },

  adminGetAllAccounts: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/accounts/`);
    if (!res.ok) throw new Error('Failed to fetch all accounts');
    return res.json();
  },

  adminVerifyUser: async (userId, action, reason = '') => {
    const res = await fetch(`${API_BASE_URL}/admin/verify/user/${userId}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Verification failed');
    return json;
  },

  adminVerifyVendor: async (vendorId, action, reason = '') => {
    const res = await fetch(`${API_BASE_URL}/admin/verify/vendor/${vendorId}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Verification failed');
    return json;
  },

  // Seed initial data
  seedData: async () => {
    const res = await fetch(`${API_BASE_URL}/seed/`, { method: 'POST' });
    return res.json();
  },

  // Departments
  getDepartments: async () => {
    const res = await fetch(`${API_BASE_URL}/departments/`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users/`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // RFQs
  getRFQs: async () => {
    const res = await fetch(`${API_BASE_URL}/rfqs/`);
    if (!res.ok) throw new Error('Failed to fetch RFQs');
    return res.json();
  },

  createRFQ: async (rfqData) => {
    const res = await fetch(`${API_BASE_URL}/rfqs/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rfqData),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(errData) || 'Failed to create RFQ');
    }
    return res.json();
  },

  deleteRFQ: async (rfqId) => {
    const res = await fetch(`${API_BASE_URL}/rfqs/${rfqId}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete RFQ');
    return true;
  },

  updateRFQStatus: async (rfqId, status) => {
    const res = await fetch(`${API_BASE_URL}/rfqs/${rfqId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update RFQ status');
    return res.json();
  },

  patchRFQ: async (rfqId, data) => {
    const res = await fetch(`${API_BASE_URL}/rfqs/${rfqId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to patch RFQ details');
    return res.json();
  },

  getApprovals: async () => {
    const res = await fetch(`${API_BASE_URL}/approvals/`);
    if (!res.ok) throw new Error('Failed to fetch approvals');
    return res.json();
  },

  createApproval: async (approvalData) => {
    const res = await fetch(`${API_BASE_URL}/approvals/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalData),
    });
    if (!res.ok) throw new Error('Failed to log approval decision');
    return res.json();
  },

  // Vendors
  getVendors: async () => {
    const res = await fetch(`${API_BASE_URL}/vendors/`);
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
  },

  patchVendor: async (vendorId, data) => {
    const res = await fetch(`${API_BASE_URL}/vendors/${vendorId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  },

  // Quotations
  getQuotations: async () => {
    const res = await fetch(`${API_BASE_URL}/quotations/`);
    if (!res.ok) throw new Error('Failed to fetch quotations');
    return res.json();
  },

  createQuotation: async (data) => {
    const res = await fetch(`${API_BASE_URL}/quotations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(errData) || 'Failed to create quotation');
    }
    return res.json();
  },

  patchQuotation: async (quotationId, data) => {
    const res = await fetch(`${API_BASE_URL}/quotations/${quotationId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update quotation');
    return res.json();
  },

  // Purchase Orders
  getPurchaseOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/purchase-orders/`);
    if (!res.ok) throw new Error('Failed to fetch purchase orders');
    return res.json();
  },

  createPurchaseOrder: async (data) => {
    const res = await fetch(`${API_BASE_URL}/purchase-orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(errData) || 'Failed to create purchase order');
    }
    return res.json();
  },

  patchPurchaseOrder: async (poId, data) => {
    const res = await fetch(`${API_BASE_URL}/purchase-orders/${poId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update purchase order');
    return res.json();
  },

  // Invoices
  getInvoices: async () => {
    const res = await fetch(`${API_BASE_URL}/invoices/`);
    return handleResponse(res);
  },

  createInvoice: async (data) => {
    const res = await fetch(`${API_BASE_URL}/invoices/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(errData) || 'Failed to create invoice');
    }
    return res.json();
  },

  patchInvoice: async (invoiceId, data) => {
    const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update invoice');
    return res.json();
  },
};
