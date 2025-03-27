import ApiService from './plan.service';

class AuthService {
  getCurrentUser() {
    return ApiService.getCurrentUser();
  }

  isLoggedIn() {
    const user = this.getCurrentUser();
    return !!user;
  }

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  login(username, password) {
    return ApiService.login(username, password);
  }

  logout() {
    return ApiService.logout();
  }

  register(userData) {
    return ApiService.register(userData);
  }

  async getProfile() {
    try {
      const currentUser = this.getCurrentUser();
      // Sửa để sử dụng user_id thay vì id
      if (!currentUser?.user_id && !currentUser?.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const userId = currentUser.user_id || currentUser.id;
      
      return await ApiService.getUserById(userId);
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
      return await ApiService.updateUserProfile(userId, updateData);
    } catch (error) {
      throw this.handleError(error);
    }
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
}

export default new AuthService();