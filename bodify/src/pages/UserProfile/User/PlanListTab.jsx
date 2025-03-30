import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { SectionTitle } from '../../../components/Title/SectionTitle';
import PlanService from '../../../services/plan.service';
import AuthService from '../../../services/auth.service';

const PlanListTab = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const autoOpenProcessed = useRef(false);
  const autoOpenTimer = useRef(null);

  const fetchPlans = async (checkAutoOpen = true) => {
    try {
      if (redirecting) return; // Không làm gì nếu đang chuyển hướng
      
      setLoading(true);
      setError(null);

      // Kiểm tra xem user đã đăng nhập chưa
      if (!AuthService.isLoggedIn()) {
        setError('Vui lòng đăng nhập để xem danh sách kế hoạch');
        setLoading(false);
        return;
      }

      console.log('Đang tải danh sách kế hoạch...');
      
      // Lấy danh sách plans từ API
      const plansData = await PlanService.getUserPlans();
      
      if (Array.isArray(plansData)) {
        // Đảm bảo mỗi plan có ID là số
        const formattedPlans = plansData.map(plan => ({
          ...plan,
          plan_id: plan.plan_id ? Number(plan.plan_id) : (plan.id ? Number(plan.id) : null),
          // Đảm bảo các trường khác
          plan_name: plan.plan_name || plan.name || 'Kế hoạch không tên',
          Description: plan.Description || plan.description || '',
          total_duration: Number(plan.total_duration) || 0
        }));
        
        console.log(`Đã tải ${formattedPlans.length} kế hoạch`);
        setPlans(formattedPlans);

        // Kiểm tra xem có tham số autoOpen không và chưa được xử lý
        if (checkAutoOpen && !autoOpenProcessed.current) {
          const queryParams = new URLSearchParams(location.search);
          const autoOpenPlanId = queryParams.get('autoOpen');
          
          // Nếu có tham số autoOpen và giá trị hợp lệ, tự động mở kế hoạch tương ứng
          if (autoOpenPlanId && !isNaN(Number(autoOpenPlanId))) {
            // Xóa timer cũ nếu có
            if (autoOpenTimer.current) {
              clearTimeout(autoOpenTimer.current);
            }
            
            const planToOpen = formattedPlans.find(p => 
              (p.plan_id === Number(autoOpenPlanId)) || (p.id === Number(autoOpenPlanId))
            );
            
            if (planToOpen) {
              // Đánh dấu là đã xử lý autoOpen để không lặp lại
              autoOpenProcessed.current = true;
              
              // Hiển thị thông báo chuyển hướng
              setRedirecting(true);
              setRedirectMessage(`Đang mở kế hoạch: ${planToOpen.plan_name || planToOpen.name}`);
              
              console.log(`Đang chuẩn bị mở kế hoạch ID: ${autoOpenPlanId}`);
              
              // Sử dụng window.location.href thay vì navigate để đảm bảo trang được tải lại hoàn toàn
              autoOpenTimer.current = setTimeout(() => {
                console.log(`Chuyển hướng đến /plan?id=${autoOpenPlanId}`);
                window.location.href = `/plan?id=${autoOpenPlanId}`;
              }, 1500);
              
              return; // Thoát sớm để không thiết lập loading = false
            } else {
              console.log(`Không tìm thấy kế hoạch với ID: ${autoOpenPlanId}`);
            }
          }
        }
      } else {
        console.log('Không có kế hoạch nào');
        setPlans([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kế hoạch:', error);
      setError('Không thể tải danh sách kế hoạch. Vui lòng thử lại sau.');
    } finally {
      if (!redirecting) {
        setLoading(false);
      }
    }
  };

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (autoOpenTimer.current) {
        clearTimeout(autoOpenTimer.current);
      }
    };
  }, []);

  // Reset flag autoOpenProcessed khi location.search thay đổi
  useEffect(() => {
    // Reset flag để có thể xử lý lại nếu URL thay đổi
    autoOpenProcessed.current = false;
    
    // Xóa timer cũ nếu có
    if (autoOpenTimer.current) {
      clearTimeout(autoOpenTimer.current);
      autoOpenTimer.current = null;
    }
    
    // Reset trạng thái chuyển hướng
    setRedirecting(false);
    setRedirectMessage('');
  }, [location.search]);

  // Fetch plans khi component được tải hoặc khi location.search thay đổi
  useEffect(() => {
    fetchPlans();
  }, [location.search]);

  // Hiển thị thông báo chuyển hướng
  if (redirecting) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FontAwesomeIcon icon={faSpinner} spin className="text-primary-500 text-4xl mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">{redirectMessage}</p>
        <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={() => fetchPlans()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle title="Workout Plan List" />
        <Link 
          to="/plan" 
          className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-primary-500 transition flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create a new plan
        </Link>
      </div>
      
      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <Link 
              key={plan.plan_id || plan.id} 
              to={`/plan?id=${plan.plan_id || plan.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              onClick={(e) => {
                // Sử dụng window.location.href để đảm bảo trang được tải lại hoàn toàn
                e.preventDefault();
                window.location.href = `/plan?id=${plan.plan_id || plan.id}`;
              }}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{plan.plan_name || plan.name}</h3>
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                  {plan.Description || plan.description || 'Không có mô tả'}
                </p>
                <div className="flex items-center text-gray-500 text-sm">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  <span>{plan.total_duration || 0} phút</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-4 italic">You don't have any workout plan yet.</p>
          <Link 
            to="/plan" 
            className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-primary-500 transition inline-flex items-center"
            onClick={(e) => {
              // Sử dụng window.location.href để đảm bảo trang được tải lại hoàn toàn
              e.preventDefault();
              window.location.href = '/plan';
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create first plan
          </Link>
        </div>
      )}
    </div>
  );
};

export default PlanListTab; 