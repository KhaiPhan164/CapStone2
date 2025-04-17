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
      
      // Sử dụng trực tiếp getUserProfile với userId
      try {
        console.log('Thử gọi API getUserProfile với ID:', userId);
        const response = await UserService.getUserProfile(userId);
        const profileData = response?.data;

        // Kiểm tra nếu profileData là array thì lấy phần tử đầu tiên
        if (Array.isArray(profileData)) {
          console.warn('API trả về mảng, lấy thông tin user hiện tại');
          // Tìm user có id trùng với userId trong mảng
          const userProfile = profileData.find(user => user.user_id === userId);
          if (userProfile) {
            // Nếu tìm thấy user trong mảng, sử dụng thông tin đó
            const updatedProfile = {
              ...userProfile,
              user_id: userId,
              id: userId
            };
            localStorage.setItem('profile', JSON.stringify(updatedProfile));
            return updatedProfile;
          }
          // Nếu không tìm thấy, sử dụng currentUser
          return currentUser;
        }

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
      return currentUser;
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