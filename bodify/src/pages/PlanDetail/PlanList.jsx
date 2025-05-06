import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PlanService from "../../services/plan.service";
import AuthService from "../../services/auth.service";

// Simple encryption utils
const encryptionKey = 'bodify_secure_key'; // Simple key - can be more complex in production

// Decrypt Plan ID - copy từ file Chatbox
const decryptPlanId = (encryptedId) => {
  try {
    // Replace URL-safe chars and decode base64
    const base64 = encryptedId.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    
    // Reverse XOR operation
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedId;
  }
};

const PlanList = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(false);
  const [exercises, setExercises] = useState({});
  const location = useLocation();

  useEffect(() => {
    const fetchPlanDetail = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(location.search);
        let planId = queryParams.get('id');
        const isEncrypted = queryParams.get('e') === '1';

        if (!planId) {
          setError('Không tìm thấy ID kế hoạch');
          return;
        }

        // Kiểm tra và giải mã ID nếu cần thiết
        if (isEncrypted) {
          console.log('ID được mã hóa, đang giải mã:', planId);
          try {
            planId = decryptPlanId(planId);
            console.log('ID sau khi giải mã:', planId);
          } catch (decryptError) {
            console.error('Lỗi khi giải mã ID:', decryptError);
          }
        }

        // Nếu planId không phải là số, thử chuyển đổi
        if (isNaN(Number(planId))) {
          console.warn('planId không phải là số sau khi giải mã:', planId);
          // Thử đọc số từ chuỗi (ví dụ: "plan123" -> 123)
          const numberMatch = planId.match(/\d+/);
          if (numberMatch) {
            planId = numberMatch[0];
            console.log('Đã trích xuất số từ planId:', planId);
          } else {
            setError('ID kế hoạch không hợp lệ');
            return;
          }
        }

        const planData = await PlanService.getPlanById(planId);
        if (!planData) {
          setError('Không tìm thấy thông tin kế hoạch');
          return;
        }

        console.log('Plan Data:', planData);

        // Lấy thông tin chi tiết các slot
        const slotsData = await PlanService.getPlanSlots(planId);
        console.log('Slots Data:', slotsData);
        
        // Lấy thông tin chi tiết của các bài tập
        const exerciseDetails = {};
        for (const slot of slotsData || []) {
          console.log('Processing slot:', slot);
          // Kiểm tra tất cả các trường có thể chứa exercise ID
          const exerciseId = slot.exercise_post_id || slot.exercisePostId || 
                           (slot.exercisepost && slot.exercisepost.id) || 
                           (slot.exercise_post && slot.exercise_post.id);
          
          if (exerciseId) {
            try {
              console.log('Fetching exercise details for ID:', exerciseId);
              const exerciseData = await PlanService.getExercisePostById(exerciseId);
              console.log('Exercise Data:', exerciseData);
              if (exerciseData) {
                exerciseDetails[exerciseId] = exerciseData;
              }
            } catch (error) {
              console.error(`Lỗi khi lấy thông tin bài tập ${exerciseId}:`, error);
            }
          }
        }
        
        console.log('Exercise Details:', exerciseDetails);
        setExercises(exerciseDetails);
        const planWithSlots = {
          ...planData,
          planSlots: slotsData || []
        };

        setPlan(planWithSlots);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin kế hoạch:', error);
        setError('Không thể tải thông tin kế hoạch. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetail();
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Không tìm thấy thông tin kế hoạch</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-5">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            📋 {plan.plan_name}
            </h1>
          <p className="text-lg text-gray-600">{plan.Description}</p>
          </div>

          {/* Info Box */}
          <div className="flex justify-center gap-6 text-center mb-10">
            <div className="bg-white px-4 py-3 rounded-lg shadow text-gray-800">
              <div className="text-sm text-gray-500">🗓 Số buổi</div>
            <div className="text-lg font-bold">{plan.planSlots?.length || 0}</div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg shadow text-gray-800">
              <div className="text-sm text-gray-500">⏱ Tổng thời gian</div>
            <div className="text-lg font-bold">{plan.total_duration || 0} phút</div>
            </div>
          </div>

          {/* Danh sách buổi tập */}
          <div className="grid gap-6">
          {plan.planSlots?.map((slot) => {
            console.log('Rendering slot:', slot);
            // Kiểm tra tất cả các trường có thể chứa exercise ID
            const exerciseId = slot.exercise_post_id || slot.exercisePostId || 
                             (slot.exercisepost && slot.exercisepost.id) || 
                             (slot.exercise_post && slot.exercise_post.id);
            
            // Lấy thông tin bài tập từ exercises hoặc trực tiếp từ slot
            const exercise = exercises[exerciseId] || slot.exercisepost || slot.exercise_post;
            console.log('Exercise for slot:', exercise);

            return (
              <div
                key={slot.no}
                className="bg-white p-5 rounded-xl border-l-4 border-orange-400 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-semibold text-gray-800">
                    🔸 Buổi {slot.no}: {exercise?.title || exercise?.name || 'Chưa có bài tập'}
                  </h3>
                  <span className="text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    {slot.duration} phút
                  </span>
                </div>
                <p className="text-gray-600 italic">📝 {slot.note || 'Không có ghi chú'}</p>
                {exercise && (
                  <div className="mt-2 text-sm text-gray-500">
                    {(exercise.description || exercise.Description) && (
                      <p className="mb-1">{exercise.description || exercise.Description}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>

        {/* Chia sẻ */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">Bạn đã sẵn sàng để bắt đầu kế hoạch tập luyện này?</p>
          <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Đã sao chép liên kết!");
                  }}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md text-gray-800 transition-all"
                >
                  Sao chép link
                </button>
            <button
              onClick={async () => {
                try {
                  if (!AuthService.isLoggedIn()) {
                    alert("Vui lòng đăng nhập để bắt đầu kế hoạch!");
                    return;
                  }

                  setCopying(true);
                  const queryParams = new URLSearchParams(location.search);
                  const planId = queryParams.get('id');

                  // Tạo dữ liệu cho plan mới từ plan hiện tại
                  const planData = {
                    planName: `${plan.plan_name} (Bản sao)`,
                    description: plan.Description,
                    totalDuration: plan.total_duration,
                    slots: plan.planSlots.map((slot, index) => ({
                      no: (index + 1).toString(),
                      note: slot.note || '',
                      duration: slot.duration || 0,
                      exercisePostId: slot.exercise_post_id || slot.exercisePostId || null
                    }))
                  };

                  // Sử dụng createPlanWithSlots để tạo plan mới
                  const newPlan = await PlanService.createPlanWithSlots(planData);
                  
                  if (newPlan?.plan_id) {
                    alert("Đã thêm kế hoạch vào danh sách của bạn!");
                    window.location.href = `/plan?id=${newPlan.plan_id}`;
                  } else {
                    throw new Error("Không thể tạo kế hoạch mới");
                  }
                } catch (error) {
                  console.error("Lỗi khi tạo kế hoạch:", error);
                  alert("Có lỗi xảy ra khi thêm kế hoạch. Vui lòng thử lại sau!");
                } finally {
                  setCopying(false);
                }
              }}
              disabled={copying}
              className={`${
                copying 
                  ? "bg-orange-300 cursor-not-allowed" 
                  : "bg-orange-500 hover:bg-orange-600"
              } px-4 py-2 rounded-md text-white transition-all flex items-center gap-2`}
            >
              {copying ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                "Bắt đầu ngay"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanList;
