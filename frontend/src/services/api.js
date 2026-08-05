const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rfqData),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(errData) || 'Failed to create RFQ');
    }
    return res.json();
  },

  updateRFQStatus: async (rfqId, status) => {
    const res = await fetch(`${API_BASE_URL}/rfqs/${rfqId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update RFQ status');
    return res.json();
  },

  patchRFQ: async (rfqId, data) => {
    const res = await fetch(`${API_BASE_URL}/rfqs/${rfqId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
};
