import axios from 'axios';

const API_URL = 'http://localhost:3000/exercise-details';

class ExerciseDetailService {
  async getExerciseDetail(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  async updateExerciseDetail(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  }

  async getExerciseComments(id) {
    return axios.get(`${API_URL}/${id}/comments`);
  }
}

export default new ExerciseDetailService(); 