import ApiService from './plan.service';
import UserService from './user.service';
import axios from 'axios';

const API_URL = 'http://localhost:3000/auth';

class AuthService {
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Lỗi khi đọc thông tin người dùng từ localStorage:', e);
      return null;
    }
  }

  isLoggedIn() {
    const user = this.getCurrentUser();
    const token = localStorage.getItem('token');
    return !!user && !!token;
  }

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  login(username, password) {
    // Xóa dữ liệu người dùng cũ trước khi đăng nhập mới
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return ApiService.login(username, password);
  }

  logout() {
    // Xóa dữ liệu người dùng khi đăng xuất
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return ApiService.logout ? ApiService.logout() : Promise.resolve();
  }

  register(userData) {
    return ApiService.register(userData);
  }

  async getProfile() {
    try {
      // Lấy thông tin người dùng từ localStorage
      const currentUser = this.getCurrentUser();
      const token = localStorage.getItem('token');
      
      // Kiểm tra xem có thông tin người dùng không
      if (!currentUser) {
        console.warn('Không có thông tin người dùng trong localStorage');
        
        // Nếu có profile trong localStorage, sử dụng tạm thời
        const storedProfileStr = localStorage.getItem('profile');
        if (storedProfileStr) {
          try {
            const storedProfile = JSON.parse(storedProfileStr);
            console.warn('Sử dụng profile từ localStorage');
            return storedProfile;
          } catch (e) {
            console.error('Lỗi khi parse profile từ localStorage:', e);
          }
        }
        
        console.error('Không tìm thấy thông tin người dùng');
        return null;
      }

      // Tìm bất kỳ ID nào có thể sử dụng được
      const userId = currentUser.user_id || currentUser.id || currentUser.userId || currentUser._id;
      
      // Nếu không có ID, không thể gọi API theo userID
      if (!userId) {
        console.warn('Không tìm thấy ID người dùng trong các trường thông thường');
        
        // Sử dụng currentUser làm profile nếu không còn cách nào khác
        console.warn('Sử dụng currentUser làm profile do không tìm thấy ID');
        return currentUser;
      }
      
      console.log('Đang gọi API để lấy profile với ID:', userId);
      
      // Bỏ qua việc gọi getMyProfile vì nó gây ra lỗi 500
      
      // Sử dụng trực tiếp getUserProfile với userId
      try {
        console.log('Thử gọi API getUserProfile với ID:', userId);
        const response = await UserService.getUserProfile(userId);
        const profileData = response?.data;
        
        if (profileData) {
          console.log('Lấy profile thành công từ getUserProfile:', profileData);
          
          // Đảm bảo profile có cả user_id và id
          const updatedProfile = {
            ...profileData,
            user_id: profileData.user_id || userId,
            id: profileData.id || userId
          };
          
          // Lưu thông tin mới vào localStorage
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          return updatedProfile;
        }
      } catch (profileError) {
        console.error('Lỗi khi gọi API getUserProfile:', profileError);
      }
      
      // Nếu API thất bại, sử dụng dữ liệu từ localStorage
      console.warn('Không thể lấy profile từ API, thử dùng localStorage');
      
      // Kiểm tra profile trong localStorage
      const storedProfileStr = localStorage.getItem('profile');
      if (storedProfileStr) {
        try {
          const storedProfile = JSON.parse(storedProfileStr);
          console.warn('Sử dụng profile từ localStorage do API lỗi');
          
          // Đảm bảo profile có cả user_id và id
          return {
            ...storedProfile,
            user_id: storedProfile.user_id || userId,
            id: storedProfile.id || userId
          };
        } catch (e) {
          console.error('Lỗi khi parse profile từ localStorage:', e);
        }
      }
      
      // Cuối cùng, trả về thông tin user từ localStorage
      console.warn('Sử dụng thông tin từ currentUser làm profile');
      return currentUser;
    } catch (error) {
      console.error('Lỗi khi lấy profile:', error);
      
      // Cố gắng lấy thông tin profile từ localStorage nếu có
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        try {
          console.warn('Sử dụng profile từ localStorage do có lỗi');
          return JSON.parse(storedProfile);
        } catch (e) {
          console.error('Lỗi khi parse profile từ localStorage:', e);
        }
      }
      
      // Cố gắng lấy thông tin user từ localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          console.warn('Sử dụng user data từ localStorage do không có profile');
          return JSON.parse(userData);
        } catch (e) {
          console.error('Lỗi khi parse user data từ localStorage:', e);
        }
      }
      
      return null;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const response = await UserService.updateUserProfile(userId, updateData);
      
      // Cập nhật thông tin trong localStorage nếu cập nhật thành công
      if (response && response.data) {
        // Lưu thông tin mới vào localStorage
        localStorage.setItem('profile', JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'Có lỗi xảy ra';
      if (error.response.status === 500) {
        return new Error('Lỗi hệ thống, vui lòng thử lại sau');
      }
      if (error.response.status === 401) {
        // Xóa token và user nếu không có quyền truy cập
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      return new Error(message);
    }
    return error;
  }

  async getGyms() {
    try {
      const response = await axios.get(`${API_URL}/gyms`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async registerPT(formData) {
    try {
      // Log formData content for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post(`${API_URL}/register-pt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('RegisterPT error:', error.response || error);
      throw this.handleError(error);
    }
  }
}

export default new AuthService();