import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faDumbbell, faArrowLeft, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PaymentService from './services/paymentservice';

const GymDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [gym, setGym] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Hàm xóa thông báo lỗi sau một khoảng thời gian
  const clearErrorAfterDelay = (delay = 5000) => {
    setTimeout(() => {
      setErrorMessage(null);
    }, delay);
  };
  
  // Bỏ qua lỗi Google Pay manifest trong console
  // Lỗi "Unable to download payment manifest" không ảnh hưởng đến chức năng ZaloPay
  useEffect(() => {
    // Định nghĩa lại console.error để bỏ qua lỗi Google Pay manifest
    const originalConsoleError = console.error;
    console.error = function(msg, ...args) {
      if (typeof msg === 'string' && msg.includes('payment manifest')) {
        // Bỏ qua lỗi liên quan đến payment manifest của Google Pay
        return;
      }
      originalConsoleError.apply(console, [msg, ...args]);
    };

    // Cleanup khi component unmount
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  
  // Kiểm tra xem có tham số query payment_status không (từ callback thanh toán)
  useEffect(() => {
    // Sử dụng phương thức handlePaymentResult của PaymentService để xử lý kết quả
    PaymentService.handlePaymentResult((result) => {
      if (result) {
        console.log("Kết quả thanh toán:", result);
        
        // Nếu có lỗi
        if (result.error) {
          setProcessingPayment(false);
          setErrorMessage(`Lỗi thanh toán: ${result.errorMessage}`);
          clearErrorAfterDelay();
          return;
        }
        
        // Xử lý theo trạng thái (chỉ có 2 trạng thái: thành công và thất bại)
        if (result.isSuccess) {
          alert(`Thanh toán thành công: ${result.status_description}`);
          navigate('/payment-status', { 
            state: { 
              paymentStatus: result,
              statusInfo: PaymentService.getPaymentStatusInfo(result.statusId)
            }
          });
        } else if (result.isFailed) {
          setErrorMessage(`Thanh toán thất bại: ${result.status_description}`);
          clearErrorAfterDelay();
        }
        
        setProcessingPayment(false);
      }
    });
  }, [location, navigate]);
  
  useEffect(() => {
    const fetchGymDetails = async () => {
      try {
        // Lấy thông tin phòng gym (user_id)
        const gymResponse = await axios.get(`http://localhost:3000/users/${id}`);
        setGym(gymResponse.data);

        // Lấy thông tin membership theo user_id của gym
        const membershipResponse = await axios.get(`http://localhost:3000/membership/gym/${id}`);
        setMemberships(membershipResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải thông tin gym:', err);
        setError('Không thể tải thông tin phòng gym. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchGymDetails();
  }, [id]);

  const handleSelectMembership = (membership) => {
    setSelectedMembership(membership);
    setShowPaymentModal(true);
  };
  
  /**
   * Xử lý quá trình thanh toán khi người dùng xác nhận trong modal
   * Trạng thái thanh toán:
   * - SUCCESS (1): Thanh toán thành công
   * - FAILED (2): Thanh toán thất bại (mặc định ban đầu)
   */
  const handlePayment = async () => {
    try {
      // Đảm bảo đã chọn membership
      if (!selectedMembership) {
        setErrorMessage('Vui lòng chọn gói membership!');
        clearErrorAfterDelay();
        return;
      }
      
      // Đóng modal
      setShowPaymentModal(false);

      // Hiển thị loading
      setProcessingPayment(true);

      // Kiểm tra xem người dùng đã đăng nhập chưa
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Vui lòng đăng nhập để thực hiện thanh toán!');
        clearErrorAfterDelay();
        navigate('/sign-in');
        return;
      }

      // Thử lấy thông tin user từ localStorage trước
      let userId = null;
      
      try {
        // Kiểm tra profile trong localStorage
        const storedProfileStr = localStorage.getItem('profile');
        if (storedProfileStr) {
          const profile = JSON.parse(storedProfileStr);
          if (profile && (profile.user_id || profile.id)) {
            userId = profile.user_id || profile.id;
            console.log('Lấy user_id từ profile trong localStorage:', userId);
          }
        }
        
        // Nếu không có trong profile, kiểm tra trong user
        if (!userId) {
          const storedUserStr = localStorage.getItem('user');
          if (storedUserStr) {
            const user = JSON.parse(storedUserStr);
            if (user && (user.user_id || user.id)) {
              userId = user.user_id || user.id;
              console.log('Lấy user_id từ user trong localStorage:', userId);
            }
          }
        }
      } catch (e) {
        console.error('Lỗi khi đọc thông tin từ localStorage:', e);
      }
      
      // Nếu không tìm thấy user_id trong localStorage, gọi API
      if (!userId) {
        console.log('Không tìm thấy user_id trong localStorage, gọi API');
        // Lấy thông tin user từ API profile
        const profileResponse = await axios.get('http://localhost:3000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!profileResponse.data || !profileResponse.data.user_id) {
          throw new Error('Không thể lấy thông tin người dùng');
        }

        userId = Number(profileResponse.data.user_id);
      }

      // Chuyển userId thành số nếu là chuỗi
      userId = Number(userId);
      const membershipId = Number(selectedMembership.membership_id);
      const amount = Number(selectedMembership.price);

      // Kiểm tra giá trị hợp lệ
      if (isNaN(userId) || isNaN(membershipId) || isNaN(amount)) {
        throw new Error('Dữ liệu không hợp lệ');
      }

      // Lưu thông tin về membership đã chọn vào localStorage để có thể hiển thị sau này
      localStorage.setItem('selectedMembership', JSON.stringify({
        membershipId: membershipId,
        membershipName: selectedMembership.name,
        amount: amount,
        duration: selectedMembership.duration,
        description: selectedMembership.description,
        gymId: gym.user_id,
        gymName: gym.name,
        timestamp: Date.now()
      }));

      // Tạo payment data với dữ liệu đúng định dạng theo DTO
      const paymentData = {
        user_id: userId,
        membership_id: membershipId,
        amount_paid: amount,
        status_id: 2, // Mặc định là FAILED (2) khi tạo payment, sẽ được backend cập nhật thành SUCCESS (1) khi thanh toán thành công
        payment_method: 'ZaloPay',
        order_id: `ORDER_${Date.now()}`
      };

      console.log('Payment data:', paymentData);

      try {
        // Sử dụng PaymentService để tạo thanh toán và tự động chuyển hướng
        const result = await PaymentService.createPayment(paymentData, false); // Không tự động redirect
        console.log('Payment Response:', result);

        if (result && result.payment_url) {
          // Sử dụng hàm redirectToPayment của PaymentService để chuyển hướng
          PaymentService.redirectToPayment(result);
        } else {
          // Nếu không có URL thanh toán, chuyển hướng đến trang payment-status
          navigate('/payment-status', { 
            state: { 
              paymentId: result.payment_id,
              amount: amount,
              membershipName: selectedMembership.name,
              duration: selectedMembership.duration,
              paymentStatus: {
                statusId: result.status_id,
                status: PaymentService.isPaymentSuccessful(result.status_id) ? 'SUCCESS' : 'FAILED',
                isSuccess: PaymentService.isPaymentSuccessful(result.status_id),
                isFailed: PaymentService.isPaymentFailed(result.status_id)
              }
            }
          });
        }
      } catch (paymentError) {
        // Xử lý lỗi cụ thể từ PaymentService
        console.error('Lỗi từ PaymentService:', paymentError);
        throw paymentError;
      }
    } catch (error) {
      console.error('Lỗi khi tạo payment:', error);
      let errorMsg = 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.';
      
      if (error.response) {
        // Server trả về lỗi
        console.error('Server Error:', error.response.data);
        errorMsg = error.response.data.message || errorMsg;
      } else if (error.request) {
        // Không nhận được response từ server
        errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.';
      } else if (error.message) {
        // Lỗi từ PaymentService hoặc các lỗi khác
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      clearErrorAfterDelay();
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDuration = (days) => {
    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} tháng`;
    }
    return `${days} ngày`;
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-lg">Đang tải thông tin phòng gym...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center text-red-500">
        <p className="text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  if (!gym) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center text-gray-600">
        <p className="text-lg">Không tìm thấy thông tin phòng gym.</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {processingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary-500 mb-4" />
            <p className="text-lg font-medium">Đang xử lý thanh toán...</p>
            <p className="text-sm text-gray-500 mt-2">Vui lòng không đóng trang này.</p>
          </div>
        </div>
      )}
      
      {/* Hiển thị thông báo lỗi */}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50 max-w-md animate-fade-in-down">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{errorMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setErrorMessage(null)}
                  className="inline-flex text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/gyms')}
        className="flex items-center text-gray-600 hover:text-primary-500 mb-6"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Quay lại danh sách
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center mb-6">
            {gym.imgUrl ? (
              <img 
                src={gym.imgUrl} 
                alt={gym.name} 
                className="w-24 h-24 rounded-full object-cover mr-6"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mr-6">
                <span className="text-gray-500 text-2xl">GYM</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{gym.name}</h1>
              <div className="flex items-center text-gray-600">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                {gym.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {gym.phoneNum && (
              <div className="flex items-center text-gray-600">
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                {gym.phoneNum}
              </div>
            )}
            {gym.address && (
              <div className="flex items-center text-gray-600">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                {gym.address}
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Giới thiệu</h2>
            <p className="text-gray-600 whitespace-pre-line">{gym.introduction || 'Chưa có mô tả'}</p>
          </div>
        </div>
      </div>

      {/* Membership Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Gói Membership</h2>
          
          {memberships.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Chưa có gói membership nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memberships.map((membership) => (
                <div key={membership.membership_id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{membership.name}</h3>
                    <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm">
                      {formatDuration(membership.duration)}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-primary-500">
                      {membership.price.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-gray-500 text-sm">/gói</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {membership.description && (
                      <div className="flex items-start text-gray-600">
                        <FontAwesomeIcon icon={faDumbbell} className="mt-1 mr-2" />
                        <p>{membership.description}</p>
                      </div>
                    )}
                    {membership.benefits && membership.benefits.length > 0 && (
                      <div className="space-y-2">
                        {membership.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center text-gray-600">
                            <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    className="w-full bg-primary-500 text-white px-4 py-2 rounded-full hover:bg-primary-600 transition-colors"
                    onClick={() => handleSelectMembership(membership)}
                  >
                    Đăng ký ngay
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Xác nhận thanh toán</h3>
            <div className="mb-4">
              <p className="font-semibold">Gói membership:</p>
              <p>{selectedMembership.name}</p>
            </div>
            <div className="mb-4">
              <p className="font-semibold">Thời hạn:</p>
              <p>{formatDuration(selectedMembership.duration)}</p>
            </div>
            <div className="mb-4">
              <p className="font-semibold">Giá:</p>
              <p className="text-2xl font-bold text-primary-500">
                {selectedMembership.price.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowPaymentModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600"
                onClick={handlePayment}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymDetail; 