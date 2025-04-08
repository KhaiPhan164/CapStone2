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

  getAuthHeader() {
    const token = localStorage.getItem('token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
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
      // Thay vì gọi API trực tiếp, trả về dữ liệu từ localStorage
      console.log('Sử dụng dữ liệu từ localStorage thay vì gọi API getMyProfile');
      const storedProfileStr = localStorage.getItem('profile');
      const storedUser = localStorage.getItem('user');
      
      if (storedProfileStr) {
        try {
          const profile = JSON.parse(storedProfileStr);
          return { data: profile };
        } catch (e) {
          console.error('Lỗi khi parse profile từ localStorage:', e);
        }
      }
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          return { data: user };
        } catch (e) {
          console.error('Lỗi khi parse user từ localStorage:', e);
        }
      }
      
      throw new Error('Không tìm thấy dữ liệu người dùng trong localStorage');
      
      // Bỏ comment dòng dưới nếu API hoạt động trở lại
      // return axios.get(`${API_URL}/profile/me`);
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

  async getPTsByGym(gymName) {
    try {
      const response = await axios.get(`${API_URL}/gym/pts`, {
        params: {
          role_id: 3,
          status_id: 1
        }
      });
      
      // Transform data to match the expected format
      return response.data.map(pt => ({
        id: pt.user_id,
        username: pt.username,
        name: pt.name,
        email: pt.email,
        phoneNum: pt.phoneNum,
        gym: pt.gym,
        role_id: pt.role_id,
        Status_id: pt.Status_id,
        certificate: pt.certificate || []
      }));
    } catch (error) {
      console.error('Error fetching PTs by gym:', error);
      throw error;
    }
  }

  async approvePT(ptId) {
    try {
      const response = await axios.patch(`${API_URL}/approve/${ptId}`, {
        Status_id: 2 // Set status to active
      }, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error approving PT:', error);
      throw error;
    }
  }

  async rejectPT(ptId) {
    try {
      const response = await axios.delete(`${API_URL}/${ptId}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting PT:', error);
      throw error;
    }
  }
}

export default new UserService();