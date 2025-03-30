import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../layout/Header';
import Footer from '../../../layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClock, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import PlanService from '../../../services/plan.service';
import AuthService from '../../../services/auth.service';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// Hàm kiểm tra có phải số hay không
const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

const PlanList = () => {
  const navigate = useNavigate();
  
  // State cho danh sách kế hoạch
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách kế hoạch từ API khi component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  // Hàm lấy danh sách kế hoạch
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      // Kiểm tra user đã đăng nhập chưa
      if (!AuthService.isLoggedIn()) {
        navigate('/signin');
        return;
      }

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
        setPlans(formattedPlans);
      } else {
        setPlans([]);
        console.warn('Định dạng dữ liệu plan không đúng:', plansData);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kế hoạch:', error);
      setError('Không thể tải danh sách kế hoạch. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa kế hoạch
  const handleDeletePlan = (planId) => {
    if (!isNumeric(planId)) {
      alert('ID kế hoạch không hợp lệ');
      return;
    }

    confirmAlert({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa kế hoạch này?',
      buttons: [
        {
          label: 'Có',
          onClick: async () => {
            try {
              const numericPlanId = Number(planId);
              await PlanService.deletePlan(numericPlanId);
              alert('Kế hoạch đã được xóa thành công');
              fetchPlans(); // Cập nhật lại danh sách
            } catch (error) {
              console.error('Lỗi khi xóa kế hoạch:', error);
              alert(`Không thể xóa kế hoạch: ${error.message || 'Đã xảy ra lỗi'}`);
            }
          }
        },
        {
          label: 'Không',
          onClick: () => {}
        }
      ]
    });
  };

  if (loading) {
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

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={fetchPlans}
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Danh sách kế hoạch tập luyện</h1>
          <Link 
            to="/plan" 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Tạo kế hoạch mới
          </Link>
        </div>
        
        {/* Danh sách kế hoạch */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {plans.length > 0 ? (
            plans.map(plan => (
              <div 
                key={plan.plan_id || plan.id} 
                className="w-full border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <Link 
                  to={`/plan?id=${plan.plan_id || plan.id}`}
                  className="block p-5"
                >
                  <h3 className="font-bold text-lg mb-2">{plan.plan_name || plan.name}</h3>
                  <p className="text-gray-600 mb-3 text-sm line-clamp-2">{plan.Description || plan.description}</p>
                  <div className="flex items-center text-gray-500">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    <span>{plan.total_duration || 0} phút</span>
                  </div>
                </Link>
                
                <div className="bg-gray-50 p-3 border-t flex justify-end space-x-4">
                  <Link 
                    to={`/plan?id=${plan.plan_id || plan.id}`}
                    className="text-green-500 hover:text-green-700 flex items-center"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    Sửa
                  </Link>
                  
                  <button 
                    onClick={() => handleDeletePlan(plan.plan_id || plan.id)}
                    className="text-red-500 hover:text-red-700 flex items-center"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4 text-lg">Bạn chưa có kế hoạch tập luyện nào.</p>
              <Link 
                to="/plan" 
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition inline-flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Tạo kế hoạch đầu tiên
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PlanList; 