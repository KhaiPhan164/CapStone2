import axios from 'axios';

const API_URL = 'http://localhost:3000/users';

class UserService {
  constructor() {
    // Thêm interceptor để gắn token vào mỗi request
    axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  async getUserProfile(userId) {
    try {
      // Kiểm tra và chuyển đổi userId thành số
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) {
        throw new Error('User ID phải là một số');
      }
      
      // Sử dụng endpoint đúng theo backend
      return axios.get(`${API_URL}/${numericUserId}`);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin profile:', error);
      throw error;
    }
  }

  async getMyProfile() {
    try {
      // Endpoint để lấy profile của người dùng đăng nhập
      return axios.get(`${API_URL}/profile/me`);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin profile cá nhân:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, userData) {
    try {
      // Kiểm tra và chuyển đổi userId thành số
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) {
        throw new Error('User ID phải là một số');
      }

      if (userData instanceof FormData) {
        // Xử lý trường hợp FormData (upload file/avatar)
        return axios.patch(`${API_URL}/profile/${numericUserId}`, userData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else if (userData && userData.file) {
        // Xử lý trường hợp có file trong object
        const formData = new FormData();
        formData.append('image', userData.file); // Đảm bảo tên trường đúng với backend
        
        // Chỉ cập nhật các trường được chỉ định
        Object.keys(userData).forEach(key => {
          if (key !== 'file') {
            formData.append(key, userData[key]);
          }
        });
        
        return axios.patch(`${API_URL}/profile/${numericUserId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Xử lý trường hợp cập nhật thông tin thông thường
        console.log('Cập nhật thông tin người dùng:', numericUserId, userData);
        
        // Sử dụng endpoint profile đúng theo backend
        return axios.patch(`${API_URL}/profile/${numericUserId}`, userData);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      throw error;
    }
  }

  async updateUserAvatar(userId, imageFile) {
    try {
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) {
        throw new Error('User ID phải là một số');
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Sử dụng endpoint profile đúng theo backend
      return axios.patch(`${API_URL}/profile/${numericUserId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật avatar:', error);
      throw error;
    }
  }
}

export default new UserService();