import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Lấy danh sách PT theo gym
export const getPTsByGym = async (gymName) => {
  const response = await axios.get(`${API_URL}/users`, {
    params: {
      role_id: 3,
      gym: gymName
    }
  });
  return response.data;
};

// Tạo PT mới
export const createPT = async (ptData) => {
  const response = await axios.post(`${API_URL}/users`, {
    ...ptData,
    role_id: 3,
    status_id: 2
  });
  return response.data;
};

// Cập nhật thông tin PT
export const updatePT = async (ptId, ptData) => {
  const response = await axios.put(`${API_URL}/users/${ptId}`, ptData);
  return response.data;
};

// Xóa PT
export const deletePT = async (ptId) => {
  const response = await axios.delete(`${API_URL}/users/${ptId}`);
  return response.data;
}; 