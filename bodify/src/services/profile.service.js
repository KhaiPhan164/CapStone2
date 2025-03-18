import axios from 'axios';

const API_URL = 'http://localhost:3000/profiles';

class ProfileService {
  async getProfile() {
    return axios.get(`${API_URL}/me`);
  }

  async updateProfile(data) {
    return axios.put(`${API_URL}/me`, data);
  }

  async updatePrivacySettings(settings) {
    return axios.put(`${API_URL}/me/privacy`, settings);
  }
}

export default new ProfileService(); 