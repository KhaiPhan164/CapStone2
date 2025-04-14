import axios from 'axios';

const API_URL = 'http://localhost:3000/users';

class RecommendService {
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

  // Lấy health analysis của user
  async getHealthAnalysis(userId) {
    try {
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) {
        throw new Error('User ID phải là một số');
      }

      const response = await axios.get(`${API_URL}/${numericUserId}/health-analysis`);
      
      if (response.data.status === 'success') {
        return {
          status: 'success',
          data: {
            analysis: {
              workout_tags: response.data.data.recommended_tags || [],
              health_info_tags: response.data.data.health_info_tags || [],
              illness_tags: response.data.data.illness_tags || [],
              exclude_tags: response.data.data.exclude_tags || []
            },
            userId: numericUserId,
            healthInfo: response.data.data.healthInfo || '',
            illness: response.data.data.illness || '',
            message: response.data.data.message || ''
          }
        };
      }

      return {
        status: 'error',
        message: response.data.message || 'Không thể lấy được thông tin phân tích sức khỏe'
      };

    } catch (error) {
      console.error('Error in getHealthAnalysis:', error);
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi phân tích thông tin sức khỏe');
    }
  }
}

export default new RecommendService();