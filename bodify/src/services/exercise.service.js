import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const EXERCISE_POSTS_URL = `${BASE_URL}/exercise-posts`;
const STEPS_URL = `${BASE_URL}/steps`;
const EXERCISE_POST_TAG_URL = `${BASE_URL}/exercise-post-tag`;

class ExerciseService {
  // Lấy tất cả exercise posts
  async getAllExercises() {
    return axios.get(EXERCISE_POSTS_URL);
  }

  // Lấy chi tiết một exercise post
  async getExerciseById(id) {
    return axios.get(`${EXERCISE_POSTS_URL}/${id}`);
  }

  // Lấy các steps của một exercise post
  async getExerciseSteps(exercisePostId) {
    return axios.get(`${STEPS_URL}/exercise/${exercisePostId}`);
  }

  // Lấy tags của một exercise post
  async getExerciseTags(exercisePostId) {
    return axios.get(`${EXERCISE_POST_TAG_URL}/exercise-post/${exercisePostId}`);
  }

  // Tạo mới exercise post
  async createExercise(exerciseData) {
    // Điều chỉnh dữ liệu để phù hợp với BE
    const formattedData = {
      name: exerciseData.name,
      description: exerciseData.description,
      imgUrl: exerciseData.imgUrl,
      videoUrl: exerciseData.videoUrl,
      steps: exerciseData.steps?.map(step => ({
        stepNumber: step.stepNumber,
        instruction: step.instruction,
        imgUrl: step.imgUrl
      })),
      tagIds: exerciseData.tagIds
    };
    
    return axios.post(EXERCISE_POSTS_URL, formattedData);
  }

  // Cập nhật exercise post
  async updateExercise(id, updateData) {
    // Điều chỉnh dữ liệu để phù hợp với BE
    const formattedData = {
      name: updateData.name,
      description: updateData.description,
      imgUrl: updateData.imgUrl,
      videoUrl: updateData.videoUrl,
      steps: updateData.steps?.map(step => ({
        stepNumber: step.stepNumber,
        instruction: step.instruction,
        imgUrl: step.imgUrl
      })),
      tagIds: updateData.tagIds
    };
    
    return axios.patch(`${EXERCISE_POSTS_URL}/${id}`, formattedData);
  }

  // Xóa exercise post
  async deleteExercise(id) {
    return axios.delete(`${EXERCISE_POSTS_URL}/${id}`);
  }

  // Thêm step cho exercise post
  async addStep(exercisePostId, stepData) {
    // Điều chỉnh dữ liệu để phù hợp với BE
    const formattedData = {
      exercisepost_id: exercisePostId, // Sử dụng snake_case phù hợp với BE
      step_number: stepData.stepNumber,
      instruction: stepData.instruction,
      img_url: stepData.imgUrl
    };
    
    return axios.post(STEPS_URL, formattedData);
  }

  // Thêm nhiều steps cùng lúc
  async addManySteps(exercisePostId, stepsData) {
    // Điều chỉnh dữ liệu để phù hợp với BE
    const formattedData = stepsData.map(step => ({
      exercisepost_id: exercisePostId, // Sử dụng snake_case phù hợp với BE
      step_number: step.stepNumber,
      instruction: step.instruction,
      img_url: step.imgUrl
    }));
    
    return axios.post(`${STEPS_URL}/bulk`, formattedData);
  }

  // Thêm tag cho exercise post
  async addTag(exercisePostId, tagId) {
    const tagData = {
      exercisePostId: exercisePostId // Sử dụng camelCase phù hợp với DTO
    };
    
    if (typeof tagId === 'object') {
      // Nếu truyền vào là object (có thể là tên tag mới)
      if (tagId.tagName) {
        // Tạo tag mới
        const createTagResponse = await axios.post(`${EXERCISE_POST_TAG_URL}/tag`, {
          tagName: tagId.tagName
        });
        tagData.tagId = createTagResponse.data.tag_id;
      }
    } else {
      // Nếu truyền vào là ID
      tagData.tagId = tagId;
    }
    
    return axios.post(EXERCISE_POST_TAG_URL, tagData);
  }

  // Thêm nhiều tags cùng lúc
  async addManyTags(exercisePostId, tagIds) {
    const tagsData = tagIds.map(tagId => ({
      exercisePostId: exercisePostId,
      tagId: tagId
    }));
    
    return axios.post(`${EXERCISE_POST_TAG_URL}/many`, tagsData);
  }

  // Xóa step của exercise post
  async deleteStep(exercisePostId, stepNumber) {
    return axios.delete(`${STEPS_URL}/${exercisePostId}/${stepNumber}`);
  }

  // Xóa tất cả steps của exercise post
  async deleteAllSteps(exercisePostId) {
    return axios.delete(`${STEPS_URL}/exercise/${exercisePostId}`);
  }

  // Xóa tag của exercise post
  async deleteTag(exercisePostId, tagId) {
    return axios.delete(`${EXERCISE_POST_TAG_URL}/${exercisePostId}/${tagId}`);
  }

  // Xóa tất cả tags của exercise post
  async deleteAllTags(exercisePostId) {
    return axios.delete(`${EXERCISE_POST_TAG_URL}/exercise-post/${exercisePostId}`);
  }
  
  // Lấy tất cả tags
  async getAllTags() {
    return axios.get(`${EXERCISE_POST_TAG_URL}/tag`);
  }
  
  // Tạo tag mới
  async createTag(tagName) {
    return axios.post(`${EXERCISE_POST_TAG_URL}/tag`, { tagName });
  }
}

export default new ExerciseService();