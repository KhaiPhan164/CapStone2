import axios from 'axios';

const API_URL = 'http://localhost:3000/exercise-posts'; // Sửa endpoint cho đúng

class ExerciseService {
  // Lấy tất cả exercise posts
  async getAllExercises() {
    return axios.get(API_URL);
  }

  // Lấy chi tiết một exercise post
  async getExerciseById(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  // Lấy các steps của một exercise post
  async getExerciseSteps(exercisePostId) {
    return axios.get(`${API_URL}/${exercisePostId}/steps`);
  }

  // Lấy tags của một exercise post
  async getExerciseTags(exercisePostId) {
    return axios.get(`${API_URL}/${exercisePostId}/tags`);
  }

  // Tạo mới exercise post
  async createExercise(exerciseData) {
    return axios.post(API_URL, exerciseData);
  }

  // Cập nhật exercise post
  async updateExercise(id, updateData) {
    return axios.patch(`${API_URL}/${id}`, updateData);
  }

  // Xóa exercise post
  async deleteExercise(id) {
    return axios.delete(`${API_URL}/${id}`);
  }

  // Thêm step cho exercise post
  async addStep(exercisePostId, stepData) {
    return axios.post(`${API_URL}/${exercisePostId}/steps`, stepData);
  }

  // Thêm nhiều steps cùng lúc
  async addManySteps(exercisePostId, stepsData) {
    return axios.post(`${API_URL}/${exercisePostId}/steps/bulk`, stepsData);
  }

  // Thêm tag cho exercise post
  async addTag(exercisePostId, tagData) {
    return axios.post(`${API_URL}/${exercisePostId}/tags`, tagData);
  }

  // Thêm nhiều tags cùng lúc
  async addManyTags(exercisePostId, tagsData) {
    return axios.post(`${API_URL}/${exercisePostId}/tags/bulk`, tagsData);
  }

  // Xóa step của exercise post
  async deleteStep(exercisePostId, stepNumber) {
    return axios.delete(`${API_URL}/${exercisePostId}/steps/${stepNumber}`);
  }

  // Xóa tất cả steps của exercise post
  async deleteAllSteps(exercisePostId) {
    return axios.delete(`${API_URL}/${exercisePostId}/steps`);
  }

  // Xóa tag của exercise post
  async deleteTag(exercisePostId, tagId) {
    return axios.delete(`${API_URL}/${exercisePostId}/tags/${tagId}`);
  }

  // Xóa tất cả tags của exercise post
  async deleteAllTags(exercisePostId) {
    return axios.delete(`${API_URL}/${exercisePostId}/tags`);
  }
}

export default new ExerciseService();