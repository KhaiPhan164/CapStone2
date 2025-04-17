import axios from 'axios';

const API_URL = 'http://localhost:3000/exercise-post';

class ExerciseService {
  constructor() {
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

  // Lấy tất cả bài tập
  async getAll() {
    return axios.get(API_URL);
  }

  // Tìm bài tập theo tên tag (OR condition) và loại trừ tags
  async searchByTagNames(includeTags = [], excludeTags = []) {
    try {
      // Nếu không có tag nào được chọn, trả về tất cả bài tập
      if (!includeTags?.length && !excludeTags?.length) {
        return this.getAll();
      }

      let url = `${API_URL}/search/bytags`;
      const params = new URLSearchParams();

      // Thêm include tags nếu có
      if (includeTags?.length > 0) {
        params.append('includeTags', includeTags.join(','));
      }

      // Thêm exclude tags nếu có
      if (excludeTags?.length > 0) {
        params.append('excludeTags', excludeTags.join(','));
      }

      // Thêm params vào URL nếu có
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('Sending request to:', url);
      const response = await axios.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error searching exercises by tag names:', error);
      throw error;
    }
  }

  async createExercisePost(data) {
    return axios.post(API_URL, data);
  }

  async getExercisePostById(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  async updateExercisePost(id, data, file) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    if (data.tagIds) {
      formData.append('tagIds', JSON.stringify(data.tagIds));
    }
    if (data.steps) {
      formData.append('steps', JSON.stringify(data.steps));
    }
    if (file) {
      formData.append('imgUrl', file);
    }
    if (data.video_rul) {
      formData.append('video_rul', data.video_rul);
    }
    return axios.patch(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...this.getAuthHeader()
      }
    });
  }

  async updateExercisePostStatus(id, status_id) {
    return axios.patch(`${API_URL}/${id}/status`, { status_id }, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });
  }

  async deleteExercisePost(id) {
    return axios.delete(`${API_URL}/${id}`);
  }

  async getAllTags() {
    return axios.get(`${API_URL}-tag/tag`);
  }
}

export default new ExerciseService();