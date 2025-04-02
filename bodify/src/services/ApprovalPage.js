// src/services/approval.service.ts

import axios from 'axios';

const API_URL = 'http://localhost:3000/auth';

export const ApprovalService = {
  // Lấy danh sách PT chờ duyệt
  getPendingPTs: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/pending-pts`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Duyệt hoặc từ chối PT
  approvePT: async (userId: number, statusId: number) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `${API_URL}/approve-pt`,
      {
        user_id: userId,
        Status_id: statusId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};