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
};
