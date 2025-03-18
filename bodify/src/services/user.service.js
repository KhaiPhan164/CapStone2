import axios from 'axios';

const API_URL = 'http://localhost:3000/users';

class UserService {
  async getUserProfile(userId) {
    return axios.get(`${API_URL}/${userId}`);
  }

  async updateUserProfile(userId, userData) {
    return axios.put(`${API_URL}/${userId}`, userData);
  }

  async updateUserAvatar(userId, imageFile) {
    const formData = new FormData();
    formData.append('avatar', imageFile);
    return axios.put(`${API_URL}/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export default new UserService();
