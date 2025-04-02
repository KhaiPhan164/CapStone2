import axios from 'axios';
import { API_URL } from '../config';

// Đăng ký PT mới
export const registerPT = async (formData) => {
  try {
    console.log('Sending registration request to:', `${API_URL}/api/auth/register-pt`);
    console.log('FormData content:');
    for (let pair of formData.entries()) {
      if (pair[0] === 'certificates') {
        console.log('Certificate file:', pair[1].name, pair[1].type, pair[1].size);
      } else {
        console.log(pair[0] + ': ' + pair[1]);
      }
    }

    const response = await axios.post(`${API_URL}/api/auth/register-pt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error details:', error.response?.data || error.message);
    throw error;
  }
};

// Lấy danh sách Gym Owners hoặc PTs theo gym
export const getUsersByRole = async (role_id, gymName = null) => {
  try {
    const params = { role_id };
    if (gymName) {
      params.gym = gymName;
    }
    
    console.log('Fetching users from:', `${API_URL}/api/users`, params);
    const response = await axios.get(`${API_URL}/api/users`, { params });
    
    if (response.data && Array.isArray(response.data)) {
      console.log('Users data:', response.data);
      return response.data.map(user => ({
        user_id: user.user_id,
        name: user.name
      }));
    } else {
      console.error('Invalid response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Lấy danh sách yêu cầu đăng ký PT đang chờ
export const getPendingPTRequests = async (role_id) => {
  const response = await axios.get(`${API_URL}/api/requests/pending`, {
    params: { role_id }
  });
  return response.data;
};

// Duyệt yêu cầu đăng ký PT
export const approvePTRequest = async (requestId) => {
  const response = await axios.put(`${API_URL}/api/requests/${requestId}/approve`, {
    status_id: 2 // Active status
  });
  return response.data;
};

// Từ chối yêu cầu đăng ký PT
export const rejectPTRequest = async (requestId) => {
  const response = await axios.put(`${API_URL}/api/requests/${requestId}/reject`, {
    status_id: 3 // Rejected status
  });
  return response.data;
}; 