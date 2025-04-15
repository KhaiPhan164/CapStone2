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

  async createExercisePost(data, file) {
    const formData = new FormData();
    
    // Các trường cơ bản
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('video_rul', data.video_rul || '');

    // Xử lý ảnh chính của bài tập
    if (file) {
      formData.append('imgUrl', file);
    }

    // Xử lý steps nếu có
    if (data.steps && data.steps.length > 0) {
      formData.append('steps', JSON.stringify(data.steps));
    } else {
      formData.append('steps', JSON.stringify([]));
    }

    // Xử lý tagIds nếu có
    if (data.tagIds && data.tagIds.length > 0) {
      formData.append('tagIds', JSON.stringify(data.tagIds));
    } else {
      formData.append('tagIds', JSON.stringify([]));
    }

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAllExercisePosts() {
    return axios.get(API_URL);
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
      },
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