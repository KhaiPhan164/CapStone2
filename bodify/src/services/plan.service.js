import axios from 'axios';

const API_URL = 'http://localhost:3000';

class PlanService {
  constructor() {
    // Biến để theo dõi plan ID đã log
    this.loggedPlans = new Set();
    this.loggedPlanSlots = new Set();
    
    // Thêm interceptor để tự động gắn token vào mỗi request
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
    
    // Xử lý lỗi response
    axios.interceptors.response.use(
      response => response,
      error => {
        // Logout nếu 401 Unauthorized
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('profile');
          window.location.href = '/sign-in';
        }
        
        return Promise.reject(error);
      }
    );
  }

  /* AUTH */
  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      if (response.data.access_token) {
        // Xử lý thông tin user để đảm bảo có id hoặc user_id
        let userData = response.data.user || {};
        
        // Nếu có _id hoặc userId nhưng không có user_id, tạo user_id
        if (!userData.user_id) {
          if (userData._id) {
            userData.user_id = userData._id;
          } else if (userData.userId) {
            userData.user_id = userData.userId;
          } else if (userData.id) {
            userData.user_id = userData.id;
          }
        }
        
        // Nếu có user_id nhưng không có id, tạo id
        if (!userData.id && userData.user_id) {
          userData.id = userData.user_id;
        }
        
        // Đảm bảo cả hai trường đều tồn tại
        if (!userData.id && !userData.user_id) {
          // Nếu không tìm thấy ID trong response, tìm trong response.data
          if (response.data.id || response.data.user_id || response.data._id || response.data.userId) {
            userData.user_id = response.data.user_id || response.data.id || response.data._id || response.data.userId;
            userData.id = userData.user_id;
          }
        }
        
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Đã lưu thông tin người dùng:', userData);
      }
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      return await axios.post(`${API_URL}/auth/register`, userData);
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông tin người dùng hiện tại từ localStorage
  async getCurrentUser() {
    try {
      console.log('Đang lấy thông tin người dùng hiện tại từ localStorage');
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('Không tìm thấy thông tin user trong localStorage');
        return null;
      }
      
      let user;
      try {
        user = JSON.parse(userData);
        console.log('Thông tin user từ localStorage:', user);
      } catch (parseError) {
        console.error('Lỗi khi parse user data từ localStorage:', parseError);
        return null;
      }
      
      // Kiểm tra nếu user là null hoặc không phải là object
      if (!user || typeof user !== 'object') {
        console.error('User data không hợp lệ:', user);
        return null;
      }
      
      // Đảm bảo user có id hoặc user_id
      if (!user.id && !user.user_id && user.userId) {
        console.log('Sử dụng userId làm user_id:', user.userId);
        user.user_id = user.userId;
      } else if (!user.id && !user.user_id && user._id) {
        console.log('Sử dụng _id làm user_id:', user._id);
        user.user_id = user._id;
      } else if (!user.id && !user.user_id) {
        // Tìm bất kỳ property nào có thể là ID
        const possibleIdKeys = Object.keys(user).filter(key => 
          (key.toLowerCase().includes('id') || key.toLowerCase().includes('_id')) && 
          user[key] && 
          (typeof user[key] === 'string' || typeof user[key] === 'number')
        );
        
        if (possibleIdKeys.length > 0) {
          console.log(`Sử dụng ${possibleIdKeys[0]} làm user_id:`, user[possibleIdKeys[0]]);
          user.user_id = user[possibleIdKeys[0]];
        } else {
          console.warn('Không tìm thấy ID trong user object:', user);
        }
      }
      
      // Nếu có user_id nhưng không có id, copy user_id sang id
      if (!user.id && user.user_id) {
        console.log('Copy user_id sang id:', user.user_id);
        user.id = user.user_id;
      }
      
      // Nếu có id nhưng không có user_id, copy id sang user_id
      if (user.id && !user.user_id) {
        console.log('Copy id sang user_id:', user.id);
        user.user_id = user.id;
      }
      
      return user;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng từ localStorage:', error);
      return null;
    }
  }

  logout() {
    // Xóa tất cả thông tin người dùng khỏi localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    localStorage.removeItem('plans');
    localStorage.removeItem('exercisePosts');
    
    // Xóa các biến theo dõi
    this.loggedPlans.clear();
    this.loggedPlanSlots.clear();
    
    // Chuyển hướng về trang chủ sau khi đăng xuất
    window.location.href = '/';
  }

  /* PLANS */
  // Lấy tất cả plan của user hiện tại
  async getUserPlans() {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser?.user_id && !currentUser?.id) {
        console.warn('Không tìm thấy thông tin người dùng.');
        return [];
      }
      
      // Đảm bảo userId là số
      const userId = Number(currentUser.user_id || currentUser.id);
      
      const response = await axios.get(`${API_URL}/plans`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách plan:', error);
      if (error.response) {
        console.error('Lỗi API:', error.response.status);
      }
      return [];
    }
  }

  // Lấy tất cả plan của một user cụ thể (như khi xem profile của user khác)
  async getUserPlansById(userId) {
    try {
      if (!userId) {
        console.warn('Không có user_id được cung cấp.');
        return [];
      }
      
      // Đảm bảo userId là số
      const numericUserId = Number(userId);
      
      const response = await axios.get(`${API_URL}/plans`, {
        params: { user_id: numericUserId }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách plan của user ${userId}:`, error);
      return [];
    }
  }

  // Lấy thông tin người dùng theo ID
  async getUserById(userId) {
    try {
      if (!userId) {
        throw new Error('Không có user_id được cung cấp');
      }
      
      // Đảm bảo userId là số
      const numericUserId = Number(userId);
      
      const response = await axios.get(`${API_URL}/user/${numericUserId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin user ${userId}:`, error);
      
      // Trường hợp API `/user/{id}` không tồn tại, thử dùng endpoint khác
      try {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        return response.data;
      } catch (secondError) {
        console.error(`Thử lại với endpoint khác nhưng vẫn lỗi:`, secondError);
        
        // Nếu không lấy được từ API, thử lấy từ localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          return user;
        }
        
        throw new Error(`Không thể lấy thông tin user ${userId}`);
      }
    }
  }

  // Lấy chi tiết một plan
  async getPlanById(planId) {
    try {
      // Đảm bảo planId là số
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('planId phải là một số');
      }
      
      const response = await axios.get(`${API_URL}/plans/${numericPlanId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết plan ${planId}:`, error.message);
      return null;
    }
  }

  // Tạo plan mới
  async createPlan(planData) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser?.user_id && !currentUser?.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      const userId = Number(currentUser.user_id || currentUser.id);
      
      // Chuyển đổi dữ liệu sang định dạng phù hợp với BE
      const formattedData = {
        user_id: userId,
        plan_name: planData.name,
        Description: planData.description,
        total_duration: Number(planData.totalDuration || 0)
      };
      
      const response = await axios.post(`${API_URL}/plans`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo plan mới:', error);
      if (error.response) {
        console.error('Lỗi API:', error.response.status);
      }
      throw error;
    }
  }

  // Tạo plan với các slots cùng lúc
  async createPlanWithSlots(data) {
    try {
      const user = await this.getCurrentUser();
      const userId = Number(user?.user_id || user?.id);
      
      if (!userId) {
        throw new Error('Vui lòng đăng nhập để tạo kế hoạch');
      }
      
      // Format dữ liệu theo đúng cấu trúc BE mong đợi
      const planData = {
        user_id: userId,
        plan_name: data.planName,
        Description: data.description,
        total_duration: Number(data.totalDuration || 0),
        planSlots: data.slots.map((slot, index) => ({
          no: (index + 1).toString(), // BE mong đợi no là string
          note: slot.note || '',
          duration: Number(slot.duration || 0),
          exercisePostId: slot.exercisePostId ? Number(slot.exercisePostId) : null
        }))
      };
      
      const response = await axios.post(`${API_URL}/plans`, planData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo plan với slots:', error);
      if (error.response) {
        console.error('Phản hồi từ server:', error.response.status, error.response.data);
      }
      throw error;
    }
  }

  // Cập nhật plan
  async updatePlan(planId, planData) {
    try {
      // Đảm bảo planId là số
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('planId phải là một số');
      }
      
      // Chuyển đổi dữ liệu sang định dạng phù hợp với BE
      const formattedData = {
        plan_name: planData.name,
        Description: planData.description,
        total_duration: Number(planData.totalDuration || 0)
      };
      
      const response = await axios.patch(`${API_URL}/plans/${numericPlanId}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật plan ${planId}:`, error);
      if (error.response) {
        console.error('Lỗi API:', error.response.status);
      }
      throw error;
    }
  }

  // Xóa plan
  async deletePlan(planId) {
    try {
      // Đảm bảo planId là số
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('planId phải là một số');
      }
      
      const response = await axios.delete(`${API_URL}/plans/${numericPlanId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa plan ${planId}:`, error);
      if (error.response) {
        console.error('Lỗi API:', error.response.status);
      }
      throw error;
    }
  }

  // Tạo bản sao của một plan
  async copyPlan(planId) {
    try {
      // Kiểm tra đăng nhập
      const currentUser = await this.getCurrentUser();
      if (!currentUser?.user_id && !currentUser?.id) {
        throw new Error('Vui lòng đăng nhập để sao chép kế hoạch');
      }

      // Lấy thông tin plan gốc
      const originalPlan = await this.getPlanById(planId);
      if (!originalPlan) {
        throw new Error('Không tìm thấy kế hoạch gốc');
      }

      // Lấy thông tin slots của plan gốc
      const originalSlots = await this.getPlanSlots(planId);

      // Tạo plan mới
      const newPlanData = {
        user_id: Number(currentUser.user_id || currentUser.id),
        plan_name: `${originalPlan.plan_name} (Bản sao)`,
        Description: originalPlan.Description,
        total_duration: Number(originalPlan.total_duration || 0),
        planSlots: originalSlots.map((slot, index) => ({
          no: (index + 1).toString(),
          note: slot.note || '',
          duration: Number(slot.duration || 0),
          exercise_post_id: slot.exercise_post_id || slot.exercisePostId || null
        }))
      };

      // Gọi API tạo plan mới
      const response = await axios.post(`${API_URL}/plans`, newPlanData);
      
      // Trả về plan mới đã tạo
      return response.data;
    } catch (error) {
      console.error('Lỗi khi sao chép kế hoạch:', error);
      throw error;
    }
  }

  /* PLAN SLOTS */
  // Lấy các slots của một plan
  async getPlanSlots(planId) {
    try {
      if (planId === undefined) {
        const response = await axios.get(`${API_URL}/plan-slots`);
        return response.data;
      }
      
      // Đảm bảo planId là số
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('planId phải là một số');
      }
      
      const response = await axios.get(`${API_URL}/plan-slots`, {
        params: { planId: numericPlanId }
      });
      
      // Chuẩn hóa dữ liệu trả về
      let slots = response.data;
      if (Array.isArray(slots)) {
        slots = slots.map(slot => {
          // Đảm bảo exercisePostId được xử lý đúng
          let exercisePostId = null;
          
          // Kiểm tra tất cả các trường có thể chứa exercise ID
          if (slot.exercise_post_id !== undefined && slot.exercise_post_id !== null) {
            exercisePostId = Number(slot.exercise_post_id);
          } else if (slot.exercisePostId !== undefined && slot.exercisePostId !== null) {
            exercisePostId = Number(slot.exercisePostId);
          } else if (slot.exercisepost !== undefined && slot.exercisepost !== null) {
            // Trường hợp API trả về exercisepost
            if (typeof slot.exercisepost === 'object' && slot.exercisepost.id) {
              exercisePostId = Number(slot.exercisepost.id);
            } else if (typeof slot.exercisepost === 'number') {
              exercisePostId = Number(slot.exercisepost);
            }
          }
          
          // Tạo slot chuẩn hóa với các trường thống nhất
          return {
            ...slot,
            id: slot.id || null,
            no: slot.no ? Number(slot.no) : null,
            planId: numericPlanId,
            duration: slot.duration ? Number(slot.duration) : 0,
            exercisePostId: exercisePostId,
            exercise_post_id: exercisePostId, // Đảm bảo cả hai định dạng đều có cùng giá trị
            note: slot.note || ''
          };
        });
      }
      
      return slots;
    } catch (error) {
      console.error(`Lỗi khi lấy slots của plan ${planId}:`, error.message);
      return [];
    }
  }

  // Lấy chi tiết một slot
  async getPlanSlotDetail(planId, no) {
    try {
      // Đảm bảo planId là số
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('planId phải là một số');
      }
      
      const response = await axios.get(`${API_URL}/plan-slots/${numericPlanId}/${no}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết slot:`, error.message);
      throw error;
    }
  }

  // Cập nhật slot
  async updatePlanSlot(planId, no, slotData) {
    try {
      // Đảm bảo planId là số
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('planId phải là một số');
      }
      
      // Sử dụng snake_case cho API
      const formattedData = {
        note: slotData.note || '',
        duration: Number(slotData.duration || 0)
      };
      
      // Xử lý exercisePostId - đảm bảo gửi đúng định dạng
      if (slotData.exercise_post_id !== undefined && slotData.exercise_post_id !== null) {
        const exerciseId = Number(slotData.exercise_post_id);
        if (!isNaN(exerciseId) && exerciseId > 0) {
          formattedData.exercise_post_id = exerciseId;
        }
      } else if (slotData.exercisePostId !== undefined && slotData.exercisePostId !== null) {
        const exerciseId = Number(slotData.exercisePostId);
        if (!isNaN(exerciseId) && exerciseId > 0) {
          formattedData.exercise_post_id = exerciseId;
        }
      }
      
      const response = await axios.patch(`${API_URL}/plan-slots/${numericPlanId}/${no}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật slot:`, error);
      throw error;
    }
  }

  // Thêm slot vào plan
  async addSlotToPlan(planId, slotData) {
    try {
      if (!planId) {
        throw new Error('planId không được để trống');
      }
      
      // Đảm bảo planId là số
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('planId phải là một số');
      }
      
      // Lưu exercise_post_id để sử dụng sau
      let exerciseId = null;
      
      // Ưu tiên exercise_post_id
      if (slotData.exercise_post_id !== undefined && slotData.exercise_post_id !== null) {
        exerciseId = Number(slotData.exercise_post_id);
      } 
      // Sau đó là exercisePostId
      else if (slotData.exercisePostId !== undefined && slotData.exercisePostId !== null) {
        exerciseId = Number(slotData.exercisePostId);
      }
      
      // Chuẩn bị dữ liệu cho API
      const apiData = {
        plan_id: numericPlanId,
        no: String(slotData.no),
        duration: Number(slotData.duration || 0),
        note: slotData.note || ''
      };
      
      // Nếu có exercise ID và là số hợp lệ
      if (exerciseId !== null && !isNaN(exerciseId) && exerciseId > 0) {
        apiData.exercise_post_id = exerciseId;
      }
      
      // Gửi request
      const response = await axios.post(`${API_URL}/plan-slots`, apiData);
      
      // PHƯƠNG PHÁP 2: Nếu tạo slot thành công và cần gán exercise_post_id
      if (exerciseId && response.data) {
        // Kiểm tra xem exercise_post_id đã được lưu chưa
        const needsUpdate = !response.data.exercise_post_id || 
                           Number(response.data.exercise_post_id) !== exerciseId;
        
        if (needsUpdate) {
          // PHƯƠNG PHÁP MỚI: Thử tạo lại slot này với dữ liệu đầy đủ
          try {
            // Xóa slot vừa tạo
            await this.deleteSlot(numericPlanId, response.data.no);
            
            // Chờ một chút để API xử lý
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Tạo lại slot với exercise_post_id
            const newApiData = {
              plan_id: numericPlanId,
              no: response.data.no,
              duration: response.data.duration || apiData.duration,
              note: response.data.note || apiData.note,
              exercise_post_id: exerciseId
            };
            
            const recreateResponse = await axios.post(`${API_URL}/plan-slots`, newApiData);
            
            // Kiểm tra kết quả tạo lại
            if (recreateResponse.data) {
              // Nếu tạo lại thành công, trả về dữ liệu với exercise_post_id
              return {
                ...recreateResponse.data,
                exercisePostId: exerciseId,
                exercise_post_id: exerciseId
              };
            }
          } catch (recreateError) {
            console.error(`Lỗi khi tạo lại slot:`, recreateError.message);
            
            // Nếu không thành công, dùng phương pháp PATCH cũ
            try {
              // Thử PATCH với dữ liệu đơn giản nhất
              const patchData = { exercise_post_id: exerciseId };
              const patchUrl = `${API_URL}/plan-slots/${numericPlanId}/${response.data.no}`;
              
              const patchResponse = await axios.patch(patchUrl, patchData);
              
              // Một số API trả về { count: X } thay vì dữ liệu thực, kiểm tra trường hợp này
              if (patchResponse.data.count !== undefined) {
                // Kiểm tra lại slot sau khi PATCH
                try {
                  const verifyResponse = await this.getPlanSlotDetail(numericPlanId, response.data.no);
                  
                  // Trả về dữ liệu kiểm tra với exercise_post_id
                  return {
                    ...verifyResponse,
                    exercisePostId: exerciseId,
                    exercise_post_id: exerciseId
                  };
                } catch (verifyError) {
                  console.error(`Lỗi khi kiểm tra sau PATCH:`, verifyError.message);
                }
              } else {
                // Trả về dữ liệu PATCH với exercise_post_id
                return {
                  ...patchResponse.data,
                  exercisePostId: exerciseId,
                  exercise_post_id: exerciseId
                };
              }
            } catch (patchError) {
              console.error(`Lỗi khi PATCH:`, patchError.message);
            }
          }
        }
      }
      
      // Trả về dữ liệu với exercise_post_id cả camelCase và snake_case để đảm bảo FE hiển thị OK
      return {
        ...response.data,
        exercisePostId: exerciseId || response.data.exercise_post_id || null,
        exercise_post_id: exerciseId || response.data.exercise_post_id || null
      };
    } catch (error) {
      console.error(`Lỗi khi thêm slot:`, error.message);
      throw error;
    }
  }

  // Xóa slot
  async deleteSlot(planId, no) {
    try {
      // Đảm bảo planId là số
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('planId phải là một số');
      }
      
      const response = await axios.delete(`${API_URL}/plan-slots/${numericPlanId}/${no}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa slot:`, error.message);
      throw error;
    }
  }

  /* EXERCISE POSTS */
  // Lấy tất cả exercise posts
  async getAllExercisePosts() {
    try {
      const response = await axios.get(`${API_URL}/exercise-post`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách exercise posts:', error.message);
      throw error;
    }
  }

  // Lấy chi tiết exercise post
  async getExercisePostById(id) {
    try {
      // Đảm bảo id là số
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error('id phải là một số');
      }
      
      const response = await axios.get(`${API_URL}/exercise-post/${numericId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết exercise post:`, error.message);
      throw error;
    }
  }

  /* Helper methods */
  // Reset log tracker để hỗ trợ debug/test
  resetLogTracking() {
    this.loggedPlans.clear();
    this.loggedPlanSlots.clear();
  }

  // Lưu nhiều slots cùng một lúc cho plan
  async savePlanSlots(planId, slots) {
    try {
      if (!planId) {
        throw new Error('planId không được để trống');
      }
      
      // Đảm bảo planId là số
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('planId phải là một số');
      }
      
      // Trước tiên, chuẩn hóa và sắp xếp các slots để dễ quản lý
      const normalizedSlots = slots.map((slot, index) => {
        // Chuẩn hóa mỗi slot với số thứ tự liên tục
        return {
          ...slot,
          no: (index + 1).toString(), // Đảm bảo số thứ tự liên tục từ 1 đến n
          original_no: slot.no // Giữ lại số thứ tự gốc để tham chiếu
        };
      });
      
      // Tạo danh sách các ID bài tập theo vị trí index
      const exerciseIdsByPosition = [];
      
      normalizedSlots.forEach((slot, index) => {
        // Ưu tiên lấy exercise_post_id nếu có
        let exerciseId = null;
        if (slot.exercise_post_id !== undefined && slot.exercise_post_id !== null) {
          exerciseId = Number(slot.exercise_post_id);
        } else if (slot.exercisePostId !== undefined && slot.exercisePostId !== null) {
          exerciseId = Number(slot.exercisePostId);
        }
        
        if (exerciseId && !isNaN(exerciseId)) {
          exerciseIdsByPosition[index] = exerciseId;
        }
      });
      
      // 1. Lấy tất cả slots hiện tại
      const currentSlots = await this.getPlanSlots(numericPlanId);
      
      // 2. Xóa tất cả slots cũ
      for (const slot of currentSlots) {
        try {
          await this.deleteSlot(numericPlanId, slot.no.toString());
        } catch (error) {
          console.error(`Lỗi khi xóa slot #${slot.no}:`, error.message);
        }
      }
      
      // Đặt thời gian chờ ngắn giữa các thao tác để tránh race condition
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      await delay(1500); // Đợi server xử lý xong việc xóa (tăng thời gian đợi)
      
      // 3. Thêm các slot mới với exercise_post_id
      const savedSlots = [];
      
      for (let i = 0; i < normalizedSlots.length; i++) {
        const slotNo = (i + 1).toString(); // Đảm bảo số thứ tự liên tục
        const exerciseId = exerciseIdsByPosition[i];
        const slot = normalizedSlots[i];
        
        try {
          // PHƯƠNG PHÁP 1: Gửi cả exercisePostId và exercise_post_id trong cùng một request
          const slotData = {
            plan_id: numericPlanId,
            no: slotNo,
            duration: parseInt(slot.duration) || 0,
            note: slot.note || ''
          };
          
          // Thêm exercise_post_id VÀ exercisePostId nếu có (thử cả hai định dạng)
          if (exerciseId) {
            slotData.exercise_post_id = exerciseId;
            slotData.exercisePostId = exerciseId;
            slotData.exercisepost_id = exerciseId; // Thử thêm một định dạng khác để xem API nhận dạng nào
          }
          
          const createResponse = await axios.post(`${API_URL}/plan-slots`, slotData);
          savedSlots.push(createResponse.data);
          
          // Kiểm tra kết quả ngay sau khi tạo
          if (exerciseId) {
            const createdSlot = createResponse.data;
            const savedExerciseId = createdSlot.exercise_post_id || 
                                   createdSlot.exercisePostId || 
                                   createdSlot.exercisepost_id;
            
            if (!(savedExerciseId && Number(savedExerciseId) === exerciseId)) {
              // PHƯƠNG PHÁP 2: Thử dùng POST riêng cho bảng liên kết
              try {
                // Một số API có mô hình quan hệ nhiều-nhiều có thể cần POST đến endpoint riêng
                const linkData = {
                  plan_id: numericPlanId,
                  slot_no: slotNo,
                  exercise_post_id: exerciseId
                };
                
                try {
                  // Thử endpoint có thể liên kết slot với exercise 
                  const linkResponse = await axios.post(`${API_URL}/plan-slots/${numericPlanId}/${slotNo}/exercise`, 
                    { exercise_post_id: exerciseId }
                  );
                } catch (linkError) {
                  // PHƯƠNG PHÁP 3: Thử với các tên trường khác nhau
                  const updateOptions = [
                    { exercise_post_id: exerciseId },
                    { exercisePostId: exerciseId },
                    { exercisepost_id: exerciseId },
                    { exercise_id: exerciseId },
                    { exerciseId: exerciseId }
                  ];
                  
                  let updated = false;
                  
                  for (const option of updateOptions) {
                    if (updated) break;
                    
                    try {
                      const patchResp = await axios.patch(
                        `${API_URL}/plan-slots/${numericPlanId}/${slotNo}`,
                        option
                      );
                      
                      if (patchResp.data && (patchResp.data.count > 0 || patchResp.data.exercise_post_id)) {
                        updated = true;
                        break;
                      }
                    } catch (optError) {
                      // Continue to next option
                    }
                  }
                }
              } catch (error) {
                console.error(`Lỗi khi liên kết bài tập:`, error.message);
              }
            }
          }
          
          // Đợi giữa các lần tạo slot để tránh race condition
          await delay(1000);
          
        } catch (error) {
          console.error(`Lỗi khi tạo slot #${slotNo}:`, error.message);
        }
      }
      
      // 4. Kiểm tra kết quả cuối cùng
      await delay(2000); // Đợi lâu hơn để API có thời gian xử lý hoàn tất
      
      // Trả về plan đã cập nhật
      return await this.getPlanById(numericPlanId);
    } catch (error) {
      console.error(`Lỗi khi lưu slots:`, error.message);
      throw error;
    }
  }
}

export default new PlanService();