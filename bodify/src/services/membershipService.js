import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Lấy danh sách membership theo gym owner
const getMembershipsByGym = async (gymId) => {
  const response = await axios.get(`${API_URL}/membership/gym/${gymId}`);
  return response.data;
};

// Lấy chi tiết một membership
const getMembershipById = async (id) => {
  const response = await axios.get(`${API_URL}/membership/${id}`);
  return response.data;
};

// Tạo membership mới
const createMembership = async (membershipData) => {
  const response = await axios.post(`${API_URL}/membership`, membershipData);
  return response.data;
};

// Cập nhật membership
const updateMembership = async (id, membershipData) => {
  const response = await axios.put(`${API_URL}/membership/${id}`, membershipData);
  return response.data;
};

// Xóa membership
const deleteMembership = async (id) => {
  const response = await axios.delete(`${API_URL}/membership/${id}`);
  return response.data;
};

export {
  getMembershipsByGym,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership
}; 