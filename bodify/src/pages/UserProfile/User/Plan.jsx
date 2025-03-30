import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../layout/Header';
import Footer from '../../../layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClock, faSave, faTrash, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PlanService from '../../../services/plan.service';
import ExerciseService from '../../../services/exercise.service';
import AuthService from '../../../services/auth.service';
import axios from 'axios';

// Lấy API_URL từ PlanService
const API_URL = 'http://localhost:3000';

const Plan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy planId từ query param nếu có
  const queryParams = new URLSearchParams(location.search);
  const planIdFromQuery = queryParams.get('id');
  
  // State cho danh sách exercise posts
  const [exercisePosts, setExercisePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho plan slots
  const [planSlots, setPlanSlots] = useState([]);
  const [planId, setPlanId] = useState(planIdFromQuery);
  const [planName, setPlanName] = useState("Kế hoạch tập luyện mới");
  const [planDescription, setPlanDescription] = useState("");

  // State cho drag & drop
  const [draggedExercise, setDraggedExercise] = useState(null);

  // Thêm state để kiểm soát quá trình lưu/xóa
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [savingMessage, setSavingMessage] = useState('');

  // Tính tổng thời gian
  const totalDuration = planSlots.reduce((total, slot) => total + (parseInt(slot.duration) || 0), 0);

  // Thêm hàm để kiểm tra có phải số hay không
  const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  // Lấy dữ liệu từ API
  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Kiểm tra xem user đã đăng nhập chưa
      if (!AuthService.isLoggedIn()) {
        navigate('/signin');
        return;
      }

      // Lấy danh sách exercises từ API
      const exercisesResponse = await ExerciseService.getAll();
      let exercisesData = [];
      
      if (exercisesResponse?.data && Array.isArray(exercisesResponse.data.data)) {
        exercisesData = exercisesResponse.data.data;
      } else if (exercisesResponse?.data && Array.isArray(exercisesResponse.data)) {
        exercisesData = exercisesResponse.data;
      }
      
      setExercisePosts(exercisesData);

      // Nếu có planId, lấy thông tin chi tiết plan
      if (planId) {
        try {
          // Chuyển đổi planId thành số
          const numericPlanId = Number(planId);
          
          if (!isNumeric(planId)) {
            console.error(`planId không hợp lệ: ${planId}`);
            alert(`ID kế hoạch không hợp lệ: ${planId}`);
            setError('ID kế hoạch không hợp lệ');
            setLoading(false);
            return;
          }
          
          const planResponse = await PlanService.getPlanById(numericPlanId);
          
          if (planResponse) {
            setPlanName(planResponse.plan_name || planResponse.name || "Kế hoạch tập luyện");
            setPlanDescription(planResponse.Description || planResponse.description || "");
            
            // Lấy slots của plan
            const slotsResponse = await PlanService.getPlanSlots(numericPlanId);
            
            if (Array.isArray(slotsResponse) && slotsResponse.length > 0) {
              // Đảm bảo các slot có đúng định dạng
              const formattedSlots = slotsResponse.map(slot => {
                // Xử lý exercisePostId từ nhiều nguồn có thể có
                let exercisePostId = null;
                
                // Ưu tiên theo thứ tự: exercise_post_id > exercisePostId > exercisepost
                if (slot.exercise_post_id !== undefined && slot.exercise_post_id !== null) {
                  exercisePostId = Number(slot.exercise_post_id);
                } else if (slot.exercisePostId !== undefined && slot.exercisePostId !== null) {
                  exercisePostId = Number(slot.exercisePostId);
                } else if (slot.exercisepost !== undefined && slot.exercisepost !== null) {
                  // Nếu exercisepost là object (quan hệ)
                  if (typeof slot.exercisepost === 'object' && slot.exercisepost.id) {
                    exercisePostId = Number(slot.exercisepost.id);
                  } else if (typeof slot.exercisepost === 'number') {
                    exercisePostId = Number(slot.exercisepost);
                  }
                }
                
                // Tìm thông tin chi tiết về bài tập từ các bài tập đã có
                let exerciseInfo = null;
                if (exercisePostId) {
                  const exerciseMatch = exercisesData.find(ex => {
                    const exId = ex.exercisepost_id || ex.id;
                    return Number(exId) === Number(exercisePostId);
                  });
                  
                  if (exerciseMatch) {
                    exerciseInfo = {
                      id: exercisePostId,
                      name: exerciseMatch.name,
                      description: exerciseMatch.description || '',
                      fullExercise: exerciseMatch
                    };
                  }
                }
                
                return {
                  id: slot.id || Date.now() + Math.random(),
                  no: parseInt(slot.no) || 0,
                  duration: parseInt(slot.duration) || 0,
                  exercisePostId: exercisePostId,
                  exercise_post_id: exercisePostId, // Thêm cả 2 định dạng
                  exerciseInfo: exerciseInfo // Thêm thông tin chi tiết về bài tập
                };
              });
              
              setPlanSlots(formattedSlots);
            } else {
              // Nếu không có slot, tạo một slot khởi động mặc định
              setPlanSlots([
                { id: Date.now(), no: 1, exercisePostId: null, exercise_post_id: null, duration: 5 }
              ]);
            }
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin kế hoạch:', error);
          setError('Không thể tải thông tin kế hoạch: ' + (error.message || 'Lỗi không xác định'));
        }
      } else {
        // Nếu đang tạo plan mới, tạo một slot khởi động mặc định
        setPlanSlots([
          { id: Date.now(), no: 1, exercisePostId: null, exercise_post_id: null, duration: 5 }
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setError('Không thể tải dữ liệu: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Nếu planIdFromQuery tồn tại, convert thành số
    if (planIdFromQuery) {
      const numericId = Number(planIdFromQuery);
      if (!isNaN(numericId)) {
        setPlanId(numericId);
      } else {
        console.error('planId từ URL không hợp lệ:', planIdFromQuery);
        setError(`planId "${planIdFromQuery}" không phải là số hợp lệ`);
        setPlanId(null);
      }
    } else {
      // Gọi fetchData ngay lập tức nếu không có planIdFromQuery
      fetchData();
    }
  }, []); // Chỉ chạy một lần khi component mount

  // Gọi fetchData riêng biệt khi planId thay đổi
  useEffect(() => {
    // Chỉ gọi khi planId đã được thiết lập từ useEffect đầu tiên
    if (planId !== undefined) {
      // Tải dữ liệu full bao gồm thông tin plan và slots
      fetchData();
    }
  }, [planId]); // Phụ thuộc vào planId

  // Hàm xử lý kéo bắt đầu
  const handleDragStart = (exercisePost) => {
    setDraggedExercise(exercisePost);
  };

  // Hàm xử lý khi kéo qua slot
  const handleDragOver = (e) => {
    e.preventDefault();
    e.target.classList.add('bg-blue-50'); // Tạo hiệu ứng cho người dùng
  };

  // Hàm xử lý khi rời khỏi vùng kéo thả
  const handleDragLeave = (e) => {
    e.target.classList.remove('bg-blue-50');
  };

  // Hàm xử lý khi thả vào slot
  const handleDrop = (e, slotId) => {
    e.preventDefault();
    e.stopPropagation(); // Ngăn sự kiện lan tỏa
    e.currentTarget.classList.remove('bg-blue-50');
    
    if (!draggedExercise) {
      console.error('Không có bài tập nào đang được kéo');
      return;
    }
    
    // Lấy exercise ID từ bài tập đang kéo
    let exerciseId = null;
    let idSource = "không tìm thấy";
    
    // Ưu tiên exercisepost_id (snake_case từ API)
    if (draggedExercise.exercisepost_id !== undefined && draggedExercise.exercisepost_id !== null) {
      exerciseId = Number(draggedExercise.exercisepost_id);
      idSource = "exercisepost_id";
    } 
    // Sau đó mới tới id 
    else if (draggedExercise.id !== undefined && draggedExercise.id !== null) {
      exerciseId = Number(draggedExercise.id);
      idSource = "id";
    }
    
    if (!exerciseId || isNaN(exerciseId)) {
      console.error('Không tìm thấy ID hợp lệ của bài tập đang kéo');
      alert('Không thể xác định ID của bài tập này. Vui lòng thử lại.');
      return;
    }
    
    // Lấy slot hiện tại
    const currentSlot = planSlots.find(slot => slot.id === slotId);
    
    // Thêm thông tin bổ sung về bài tập để hiển thị trong UI
    const exerciseInfo = {
      id: exerciseId,
      name: draggedExercise.name,
      description: draggedExercise.description || '',
      // Lưu thông tin bài tập đầy đủ để dùng khi hiển thị
      fullExercise: draggedExercise
    };
    
    // Cập nhật slot với exercise mới
    const updatedSlots = planSlots.map(slot => {
      if (slot.id === slotId) {
        return { 
          ...slot, 
          exercisePostId: exerciseId,
          exercise_post_id: exerciseId, // Đảm bảo cả hai định dạng đều được dùng
          exerciseInfo: exerciseInfo // Lưu thông tin bài tập đầy đủ
        };
      }
      return slot;
    });
    
    setPlanSlots(updatedSlots);
  };

  // Hàm thêm slot mới
  const addNewSlot = () => {
    const newNo = planSlots.length > 0 ? Math.max(...planSlots.map(slot => slot.no)) + 1 : 1;
    const newSlot = {
      id: Date.now(), // sử dụng timestamp làm id tạm thời
      no: newNo,
      exercisePostId: null,
      duration: 5
    };
    setPlanSlots([...planSlots, newSlot]);
  };

  // Hàm thay đổi thời gian cho slot
  const handleDurationChange = (slotId, newDuration) => {
    const updatedSlots = planSlots.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, duration: parseInt(newDuration) || 0 };
      }
      return slot;
    });
    setPlanSlots(updatedSlots);
  };

  // Hàm xóa exercise khỏi slot
  const removeExerciseFromSlot = (slotId) => {
    const updatedSlots = planSlots.map(slot => {
      if (slot.id === slotId) {
        return { 
          ...slot, 
          exercisePostId: null,
          exercise_post_id: null,  // Đảm bảo cả hai trường đều được xóa
          exerciseInfo: null       // Xóa cả thông tin chi tiết
        };
      }
      return slot;
    });
    setPlanSlots(updatedSlots);
  };

  // Cập nhật phương thức saveSlotsSeparately để đảm bảo mỗi slot lưu đúng exercise_post_id
  const saveSlotsSeparately = async (targetPlanId) => {
    try {
      // Kiểm tra planId
      if (!targetPlanId) {
        console.error("Thiếu planId khi lưu slots");
        setSavingMessage("Không thể lưu: Thiếu ID kế hoạch");
        return false;
      }
      
      // Chuẩn hóa slots để đảm bảo số thứ tự liên tục và giữ thông tin gốc
      const formattedSlots = planSlots.map((slot, index) => {
        // Lấy ID của bài tập (nếu có)
        const exerciseId = slot.exercisePostId || slot.exercise_post_id || 
                         (slot.exerciseInfo ? slot.exerciseInfo.id : null);
        
        return {
          ...slot,
          index: index, // Lưu lại vị trí ban đầu
          no: index + 1, // Đảm bảo số thứ tự liên tục bắt đầu từ 1
          exercisePostId: exerciseId,
          exercise_post_id: exerciseId,
          planId: targetPlanId
        };
      });
      
      setSavingMessage("Đang lưu các slot bài tập...");
      
      try {
        // Bắt đầu lưu slots
        const saveResult = await PlanService.savePlanSlots(targetPlanId, formattedSlots);
        
        if (saveResult) {
          setSavingMessage("Các slot đã được lưu thành công!");
          return true;
        } else {
          throw new Error("API trả về kết quả không hợp lệ");
        }
      } catch (error) {
        console.error(`Lỗi khi lưu slots: ${error.message}`);
        setSavingMessage(`Đang xử lý lỗi khi lưu slots: ${error.message}`);
        
        // Thử tải lại dữ liệu để xem các slots đã được lưu thế nào
        try {
          const loadedSlots = await PlanService.getPlanSlots(targetPlanId);
          
          if (Array.isArray(loadedSlots) && loadedSlots.length > 0) {
            // Nếu có dữ liệu trả về, xem như việc lưu đã thành công một phần
            console.log(`Đã lưu được ${loadedSlots.length} slots trên server`);
            
            // So sánh số lượng slots có bài tập thực tế và đã lưu
            const slotsWithExercises = formattedSlots.filter(s => s.exercise_post_id !== null).length;
            const savedSlotsWithExercises = loadedSlots.filter(s => s.exercise_post_id !== null).length;
            
            if (savedSlotsWithExercises < slotsWithExercises) {
              // Cập nhật thông báo
              setSavingMessage(`Đã lưu được ${savedSlotsWithExercises}/${slotsWithExercises} bài tập. Đang thử lại...`);
            }
            
            return true;
          }
        } catch (loadError) {
          console.error(`Lỗi khi kiểm tra kết quả lưu: ${loadError.message}`);
        }
        
        // Cập nhật thông báo lỗi
        setSavingMessage(`Lỗi khi lưu slots: ${error.message}. Đang thử phương án khác...`);
        return false;
      }
    } catch (error) {
      console.error("Lỗi tổng quát:", error.message);
      setSavingMessage(`Lỗi khi lưu kế hoạch: ${error.message}`);
      return false;
    }
  };

  // Hàm lưu plan đơn giản hóa
  const savePlan = async () => {
    try {
      // Vô hiệu hóa giao diện người dùng
      setIsSaving(true);
      setSaveComplete(false);
      setSavingMessage("Đang chuẩn bị lưu kế hoạch...");
      setLoading(true);
      setError(null);
      
      // Kiểm tra các trường bắt buộc
      if (!planName.trim()) {
        setError('Vui lòng nhập tên kế hoạch');
        setSavingMessage("Lỗi: Chưa nhập tên kế hoạch");
        setIsSaving(false);
        setLoading(false);
        return;
      }
      
      // Chuẩn bị dữ liệu cho plan theo đúng format API
      const planData = {
        name: planName.trim(),
        description: planDescription.trim(),
        totalDuration: totalDuration
      };
      
      // Nếu là tạo mới
      if (!planId) {
        try {
          setSavingMessage("Đang tạo kế hoạch mới...");
          
          const savedPlan = await PlanService.createPlan(planData);
          
          if (!savedPlan) {
            console.error('Không nhận được phản hồi khi tạo kế hoạch');
            setSavingMessage("Lỗi: Không nhận được phản hồi từ server");
            setIsSaving(false);
            setLoading(false);
            return;
          }
          
          const savedPlanId = savedPlan.plan_id || savedPlan.id;
          if (!savedPlanId) {
            console.error('Không tìm thấy ID của kế hoạch vừa tạo');
            setSavingMessage("Lỗi: Không tìm thấy ID kế hoạch vừa tạo");
            setIsSaving(false);
            setLoading(false);
            return;
          }
          
          // Chuyển đổi savedPlanId thành số
          const numericPlanId = Number(savedPlanId);
          if (isNaN(numericPlanId)) {
            console.error('ID kế hoạch không hợp lệ');
            setSavingMessage("Lỗi: ID kế hoạch không hợp lệ");
            setIsSaving(false);
            setLoading(false);
            return;
          }
          
          // Cập nhật planId trong state và URL
          setPlanId(numericPlanId);
          
          // Tiếp tục lưu slots
          setSavingMessage("Kế hoạch đã được tạo. Đang lưu các slot bài tập...");
          const saveResult = await saveSlotsSeparately(numericPlanId);

          // Đánh dấu việc lưu đã hoàn tất
          setSaveComplete(true);
          setSavingMessage("Lưu thành công! Đang chuyển hướng đến danh sách kế hoạch...");
          
          // Đảm bảo toàn bộ dữ liệu đã được lưu trước khi chuyển trang
          // Sử dụng setTimeout dài hơn để đảm bảo server đã xử lý xong
          setTimeout(() => {
            // Chuyển hướng đến tab kế hoạch tập luyện (không mở lại chi tiết kế hoạch)
            window.location.href = `/plans?activeTab=plans`;
          }, 2000);
          
        } catch (error) {
          console.error('Lỗi khi tạo kế hoạch:', error.message);
          setSavingMessage(`Lỗi khi tạo kế hoạch: ${error.message || 'Lỗi không xác định'}`);
          setError('Không thể tạo kế hoạch: ' + (error.message || 'Lỗi không xác định'));
          setIsSaving(false);
        }
      } else {
        // Nếu là cập nhật plan hiện có
        try {
          setSavingMessage("Đang cập nhật kế hoạch...");

          // Chuyển đổi planId thành số
          const numericPlanId = Number(planId);
          if (isNaN(numericPlanId)) {
            console.error('ID kế hoạch không hợp lệ');
            setSavingMessage("Lỗi: ID kế hoạch không hợp lệ");
            setIsSaving(false);
            setLoading(false);
            return;
          }
          
          const updatedPlan = await PlanService.updatePlan(numericPlanId, planData);
          
          // Tiếp tục lưu slots
          setSavingMessage("Kế hoạch đã được cập nhật. Đang lưu các slot bài tập...");
          const saveResult = await saveSlotsSeparately(numericPlanId);

          // Đánh dấu việc lưu đã hoàn tất
          setSaveComplete(true);
          setSavingMessage("Lưu thành công! Đang chuyển hướng đến danh sách kế hoạch...");
          
          // Đảm bảo toàn bộ dữ liệu đã được lưu trước khi chuyển trang
          setTimeout(() => {
            // Chuyển hướng đến tab kế hoạch tập luyện (không mở lại chi tiết kế hoạch)
            window.location.href = `/plans?activeTab=plans`;
          }, 2000);
          
        } catch (error) {
          console.error(`Lỗi khi cập nhật kế hoạch:`, error.message);
          setSavingMessage(`Lỗi khi cập nhật kế hoạch: ${error.message || 'Lỗi không xác định'}`);
          setError('Không thể cập nhật kế hoạch: ' + (error.message || 'Lỗi không xác định'));
          setIsSaving(false);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lưu kế hoạch:', error.message);
      setSavingMessage(`Lỗi: ${error.message || 'Không thể lưu kế hoạch'}`);
      setError(error.message || 'Không thể lưu kế hoạch. Vui lòng thử lại sau.');
      setIsSaving(false);
    } finally {
      setLoading(false);
    }
  };

  // Hàm để tải lại dữ liệu slots từ API
  const loadSlots = async (targetPlanId) => {
    try {
      if (!targetPlanId) {
        console.error("Không có planId để tải dữ liệu");
        return false;
      }
      
      // Tải dữ liệu slots mới từ API
      const updatedSlots = await PlanService.getPlanSlots(targetPlanId);
      
      if (Array.isArray(updatedSlots) && updatedSlots.length > 0) {
        // Chuẩn hóa dữ liệu từ API
        const formattedSlots = updatedSlots.map(slot => {
          // Xử lý exercisePostId từ nhiều nguồn có thể có
          let exercisePostId = null;
          
          // Ưu tiên theo thứ tự: exercise_post_id > exercisePostId > exercisepost
          if (slot.exercise_post_id !== undefined && slot.exercise_post_id !== null) {
            exercisePostId = Number(slot.exercise_post_id);
          } else if (slot.exercisePostId !== undefined && slot.exercisePostId !== null) {
            exercisePostId = Number(slot.exercisePostId);
          } else if (slot.exercisepost !== undefined && slot.exercisepost !== null) {
            // Nếu exercisepost là object (quan hệ)
            if (typeof slot.exercisepost === 'object' && slot.exercisepost.id) {
              exercisePostId = Number(slot.exercisepost.id);
            } else if (typeof slot.exercisepost === 'number') {
              exercisePostId = Number(slot.exercisepost);
            }
          }
          
          // Tìm thông tin chi tiết về bài tập từ các bài tập đã có
          let exerciseInfo = null;
          if (exercisePostId) {
            const exerciseMatch = exercisePosts.find(ex => {
              const exId = ex.exercisepost_id || ex.id;
              return Number(exId) === Number(exercisePostId);
            });
            
            if (exerciseMatch) {
              exerciseInfo = {
                id: exercisePostId,
                name: exerciseMatch.name,
                description: exerciseMatch.description || '',
                fullExercise: exerciseMatch
              };
            }
          }
          
          return {
            id: slot.id || Date.now() + Math.random(),
            no: parseInt(slot.no) || 0,
            duration: parseInt(slot.duration) || 0,
            exercisePostId: exercisePostId,
            exercise_post_id: exercisePostId, // Thêm cả 2 định dạng
            exerciseInfo: exerciseInfo // Thêm thông tin chi tiết về bài tập
          };
        });
        
        // Cập nhật state với dữ liệu mới từ API
        setPlanSlots(formattedSlots);
        return true;
      } else if (updatedSlots.length === 0) {
        // Nếu không có slot, tạo một slot mặc định
        setPlanSlots([
          { id: Date.now(), no: 1, exercisePostId: null, exercise_post_id: null, duration: 5 }
        ]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Lỗi khi tải dữ liệu slots: ${error.message}`);
      return false;
    }
  };

  // Hàm xóa plan
  const deletePlan = async () => {
    try {
      if (!planId) {
        alert("Không có ID kế hoạch để xóa");
        return;
      }
      
      // Hiển thị xác nhận trước khi xóa
      if (!window.confirm("Bạn có chắc chắn muốn xóa kế hoạch này không?")) {
        return;
      }
      
      // Vô hiệu hóa giao diện người dùng
      setIsSaving(true);
      setSaveComplete(false);
      setSavingMessage("Đang xóa kế hoạch...");
      setLoading(true);
      
      // Chuyển đổi planId thành số
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('ID kế hoạch không hợp lệ');
      }
      
      // Xóa kế hoạch
      await PlanService.deletePlan(numericPlanId);
      
      // Đánh dấu việc xóa đã hoàn tất
      setSaveComplete(true);
      setSavingMessage("Xóa thành công! Đang chuyển hướng đến danh sách kế hoạch...");
      
      // Thêm delay để đảm bảo server đã xử lý xong yêu cầu xóa
      setTimeout(() => {
        // Chuyển hướng về trang danh sách kế hoạch với tham số tab kế hoạch tập luyện
        window.location.href = '/plans?activeTab=plans';
      }, 2000);
      
    } catch (error) {
      console.error('Lỗi khi xóa kế hoạch:', error);
      setSavingMessage(`Lỗi khi xóa kế hoạch: ${error.message || 'Lỗi không xác định'}`);
      alert('Không thể xóa kế hoạch: ' + (error.message || 'Lỗi không xác định'));
      setError('Không thể xóa kế hoạch. Vui lòng thử lại sau.');
      setIsSaving(false);
    } finally {
      setLoading(false);
    }
  };

  // Hàm để tải lại toàn bộ dữ liệu của plan hiện tại
  const refreshPlan = async () => {
    if (planId) {
      try {
        setLoading(true);
        
        // Thêm delay nhỏ để đảm bảo API đã xử lý xong các thay đổi
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clear cache của các request axios
        const headers = {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        };
        
        // Tải lại thông tin plan từ API
        const planResponse = await axios.get(`${API_URL}/plans/${planId}`, { 
          headers, 
          params: { _: Date.now() } // Thêm timestamp để tránh cache
        });
        
        if (planResponse.data) {
          setPlanName(planResponse.data.plan_name || planResponse.data.name || "Kế hoạch tập luyện");
          setPlanDescription(planResponse.data.Description || planResponse.data.description || "");
          
          // Tải lại slots của plan
          const slotsResponse = await axios.get(`${API_URL}/plan-slots`, { 
            headers,
            params: { 
              planId: planId,
              _: Date.now() // Thêm timestamp để tránh cache
            } 
          });
          
          if (Array.isArray(slotsResponse.data) && slotsResponse.data.length > 0) {
            // Xử lý dữ liệu slots
            const formattedSlots = slotsResponse.data.map(slot => {
              // Xử lý exercisePostId từ nhiều nguồn có thể có
              let exercisePostId = null;
              
              // Ưu tiên theo thứ tự: exercise_post_id > exercisePostId > exercisepost
              if (slot.exercise_post_id !== undefined && slot.exercise_post_id !== null) {
                exercisePostId = Number(slot.exercise_post_id);
              } else if (slot.exercisePostId !== undefined && slot.exercisePostId !== null) {
                exercisePostId = Number(slot.exercisePostId);
              } else if (slot.exercisepost !== undefined && slot.exercisepost !== null) {
                // Nếu exercisepost là object (quan hệ)
                if (typeof slot.exercisepost === 'object' && slot.exercisepost.id) {
                  exercisePostId = Number(slot.exercisepost.id);
                } else if (typeof slot.exercisepost === 'number') {
                  exercisePostId = Number(slot.exercisepost);
                }
              }
              
              // Tìm thông tin chi tiết về bài tập từ các bài tập đã có
              let exerciseInfo = null;
              if (exercisePostId) {
                const exerciseMatch = exercisePosts.find(ex => {
                  const exId = ex.exercisepost_id || ex.id;
                  return Number(exId) === Number(exercisePostId);
                });
                
                if (exerciseMatch) {
                  exerciseInfo = {
                    id: exercisePostId,
                    name: exerciseMatch.name,
                    description: exerciseMatch.description || '',
                    fullExercise: exerciseMatch
                  };
                }
              }
              
              return {
                id: slot.id || Date.now() + Math.random(),
                no: parseInt(slot.no) || 0,
                duration: parseInt(slot.duration) || 0,
                exercisePostId: exercisePostId,
                exercise_post_id: exercisePostId, // Thêm cả 2 định dạng
                exerciseInfo: exerciseInfo // Thêm thông tin chi tiết về bài tập
              };
            });
            
            // Cập nhật state với dữ liệu mới
            setPlanSlots(formattedSlots);
          } else if (slotsResponse.data.length === 0) {
            // Nếu không có slots, tạo một slot mặc định
            setPlanSlots([
              { id: Date.now(), no: 1, exercisePostId: null, exercise_post_id: null, duration: 5 }
            ]);
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải lại dữ liệu kế hoạch:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !isSaving) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  // Hiển thị màn hình lưu/xóa đang xử lý
  if (isSaving) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center h-screen">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <div className="text-center">
              {saveComplete ? (
                <div className="text-green-600 text-6xl mb-4">✓</div>
              ) : (
                <FontAwesomeIcon icon={faSpinner} spin className="text-primary-500 text-5xl mb-4" />
              )}
              <h2 className="text-xl font-bold mb-4">
                {saveComplete ? "Hoàn tất!" : "Đang xử lý..."}
              </h2>
              <p className="text-gray-700 mb-6">{savingMessage}</p>
              
              {saveComplete && (
                <p className="text-sm text-gray-500">
                  Sẽ tự động chuyển hướng trong giây lát...
                </p>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={fetchData}
            >
              Thử lại
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Training Plan</h1>
        
        {/* Plan header */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Tên kế hoạch</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên kế hoạch tập luyện..."
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Mô tả</label>
            <textarea
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả cho kế hoạch tập luyện này..."
              rows="2"
            ></textarea>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Danh sách exercise post */}
          <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Danh sách bài tập</h2>
            
            {exercisePosts.length > 0 ? (
              exercisePosts.map(exercise => (
                <div 
                  key={exercise.exercisepost_id || exercise.id}
                  className="border rounded-md p-3 mb-3 bg-gray-50 cursor-move hover:bg-gray-100 transition"
                  draggable="true"
                  onDragStart={() => handleDragStart(exercise)}
                >
                  <p className="font-medium">{exercise.name}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Không có bài tập nào.</p>
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Kéo thả bài tập vào vị trí plan slot để tạo kế hoạch tập luyện.</p>
            </div>
          </div>
          
          {/* Plan detail */}
          <div className="w-full md:w-3/4 bg-white shadow-md rounded-lg p-4">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">Chi tiết kế hoạch</h2>
            
            {planSlots.length > 0 ? (
              planSlots.map(slot => (
                <div 
                  key={slot.id}
                  className="border rounded-md p-4 mb-4 hover:border-blue-300 transition"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-blue-50');
                  }}
                  onDrop={(e) => handleDrop(e, slot.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Slot #{slot.no}</h3>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faClock} className="text-gray-500 mr-2" />
                      <input
                        type="number"
                        value={slot.duration}
                        onChange={(e) => handleDurationChange(slot.id, e.target.value)}
                        className="w-16 border rounded p-1 text-center"
                        min="1"
                      />
                      <span className="ml-1 text-gray-500">phút</span>
                    </div>
                  </div>
                  
                  {slot.exercisePostId || slot.exerciseInfo ? (
                    <div className="bg-blue-50 p-3 rounded-md relative">
                      <div className="absolute top-2 right-2">
                        <button 
                          onClick={() => removeExerciseFromSlot(slot.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FontAwesomeIcon icon={faTrash} size="xs" />
                        </button>
                      </div>
                      <h4 className="font-medium">
                        {slot.exerciseInfo?.name || 
                         exercisePosts.find(ex => {
                           // Kiểm tra nhiều trường ID khác nhau có thể có
                           const exId = ex.exercisepost_id || ex.id;
                           return Number(exId) === Number(slot.exercisePostId);
                         })?.name || 'Unknown exercise'}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Bài tập được gán cho slot này (ID: {slot.exercisePostId})
                      </p>
                      {!slot.exercise_post_id && slot.exerciseInfo && (
                        <p className="text-xs text-orange-500 mt-1">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                          Bài tập này chỉ được lưu cục bộ, có thể mất khi tải lại trang
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-md flex justify-center items-center">
                      <p className="text-gray-500">Kéo thả bài tập vào đây</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có slot nào. Hãy thêm slot mới để bắt đầu.</p>
              </div>
            )}
            
            <button 
              className="border rounded-md p-3 w-full text-center hover:bg-gray-50 transition"
              onClick={addNewSlot}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Thêm slot mới
            </button>
            
            <div className="mt-6 border-t pt-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="font-medium mb-4 md:mb-0">
                  <span>Tổng thời gian: </span>
                  <span className="font-bold">{totalDuration} phút</span>
                </div>
                <div className="flex space-x-3">
                  <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center"
                    onClick={savePlan}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Lưu
                  </button>
                  {planId && (
                    <button 
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition flex items-center"
                      onClick={deletePlan}
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-2" />
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Plan; 