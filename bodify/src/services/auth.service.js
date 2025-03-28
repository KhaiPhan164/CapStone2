import ApiService from './plan.service';
import UserService from './user.service';

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
      // Trước tiên, kiểm tra nếu đã có profile trong localStorage
      const storedProfileStr = localStorage.getItem('profile');
      let storedProfile = null;
      
      // Nếu có profile trong localStorage, lưu lại để sử dụng trong trường hợp API lỗi
      if (storedProfileStr) {
        try {
          storedProfile = JSON.parse(storedProfileStr);
        } catch (e) {
          console.error('Lỗi khi parse profile từ localStorage:', e);
        }
      }
      
      const currentUser = this.getCurrentUser();
      
      // Kiểm tra nếu không có thông tin người dùng
      if (!currentUser) {
        console.warn('Không có thông tin người dùng trong localStorage');
        
        // Sử dụng profile từ localStorage nếu có
        if (storedProfile) {
          console.warn('Sử dụng profile từ localStorage');
          return storedProfile;
        }
        
        // Nếu không có thông tin, thử lấy từ token
        const token = localStorage.getItem('token');
        if (token) {
          // Token tồn tại nhưng không có user, cần đăng nhập lại
          console.warn('Có token nhưng không có thông tin user, cần đăng nhập lại');
        }
        
        console.error('Không tìm thấy thông tin người dùng');
        return null;
      }

      // Tìm bất kỳ ID nào có thể sử dụng được
      const userId = currentUser.user_id || currentUser.id || currentUser.userId || currentUser._id;
      
      // Kiểm tra ID sâu hơn nếu không tìm thấy ID thông thường
      if (!userId) {
        console.warn('Không tìm thấy ID người dùng trong các trường thông thường');
        
        // Nếu có profile cũ, sử dụng nó
        if (storedProfile) {
          console.warn('Sử dụng profile từ localStorage do không tìm thấy ID');
          return storedProfile;
        }
        
        // Sử dụng currentUser làm profile nếu không còn cách nào khác
        console.warn('Sử dụng currentUser làm profile do không tìm thấy ID');
        return currentUser;
      }
      
      // Thử lấy profile cá nhân (cần token)
      try {
        const response = await UserService.getMyProfile();
        const profileData = response?.data;
        
        // Lưu thông tin mới vào localStorage
        if (profileData) {
          localStorage.setItem('profile', JSON.stringify(profileData));
          return profileData;
        }
      } catch (myProfileError) {
        console.error('Lỗi khi gọi API getMyProfile:', myProfileError);
        
        // Thử gọi API getUserProfile với userId
        try {
          const response = await UserService.getUserProfile(userId);
          const profileData = response?.data;
          
          if (profileData) {
            localStorage.setItem('profile', JSON.stringify(profileData));
            return profileData;
          }
        } catch (profileError) {
          console.error('Lỗi khi gọi API getUserProfile:', profileError);
          
          // Nếu có lỗi khi gọi API, sử dụng thông tin từ localStorage
          if (storedProfile) {
            console.warn('Sử dụng profile từ localStorage do API lỗi');
            return storedProfile;
          }
          
          // Nếu không có trong localStorage, sử dụng thông tin từ currentUser
          console.warn('Sử dụng thông tin từ currentUser làm profile');
          return currentUser;
        }
      }
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
}

export default new AuthService();