import axios from 'axios';
const API_URL = 'http://localhost:3000';

class AuthService {
  async register(username, name, password) {
    try {
      const response = await axios.post(`${API_URL}/users`, {
        username,
        name,
        password,
        roleId: 1
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      if (response.data.access_token) {
        this.setTokenCookie(response.data.access_token);
        const userData = {
          ...response.data.user,
          id: response.data.user.id
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  setTokenCookie(token) {
    document.cookie = `access_token=${token}; path=/; secure; samesite=strict; max-age=86400`;
  }

  getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }

  logout() {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu người dùng:', error);
      return null;
    }
  }

  async getProfile() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const response = await axios.get(`${API_URL}/users/${currentUser.id}`, {
        headers: this.getAuthHeader()
      });
      
      if (response.data) {
        // Lưu đầy đủ thông tin vào localStorage
        localStorage.setItem('profile', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      // Nếu API lỗi, thử lấy từ localStorage
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }
      throw this.handleError(error);
    }
  }

  async updateProfile(userId, updateData) {
    try {
      // Nếu là upload ảnh
      if (updateData instanceof FormData) {
        const formData = new FormData();
        formData.append('image', updateData.get('file')); // Key phải là 'image'

        const response = await axios.patch(
          `${API_URL}/users/profile/${userId}`,
          formData,
          { 
            headers: {
              ...this.getAuthHeader()
            }
          }
        );

        if (response.data) {
          const currentProfile = JSON.parse(localStorage.getItem('profile') || '{}');
          const updatedProfile = {
            ...currentProfile,
            ...response.data
          };
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
        }

        return response.data;
      } 
      
      // Nếu là update thông tin thường
      const response = await axios.patch(
        `${API_URL}/users/profile/${userId}`,
        updateData,
        {
          headers: {
            ...this.getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        const currentProfile = JSON.parse(localStorage.getItem('profile') || '{}');
        const updatedProfile = {
          ...currentProfile,
          ...response.data
        };
        localStorage.setItem('profile', JSON.stringify(updatedProfile));
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
}
  getAuthHeader() {
    const token = this.getTokenFromCookie();
    if (token) {
      return { 
        Authorization: `Bearer ${token}`
      };
    }
    return {};
  }

  handleError(error) {
    if (error.response) {
      const message = error.response.data.message || 'Có lỗi xảy ra';
      if (error.response.status === 500) {
        return new Error('Lỗi hệ thống, vui lòng thử lại sau');
      }
      return new Error(message);
    }
    return error;
  }

  isLoggedIn() {
    return !!this.getTokenFromCookie();
  }
}

export default new AuthService();