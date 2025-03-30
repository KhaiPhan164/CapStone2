import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faDumbbell, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import PaymentService from './services/paymentservice';

const GymDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const handlePayment = async (membership) => {
    try {
      setSelectedMembership(membership);
      setShowPaymentModal(true);

      // Kiểm tra xem người dùng đã đăng nhập chưa
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Vui lòng đăng nhập để thực hiện thanh toán!');
        navigate('/login');
        return;
      }

      // Lấy thông tin user từ API profile
      const profileResponse = await axios.get('http://localhost:3000/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!profileResponse.data || !profileResponse.data.user_id) {
        throw new Error('Không thể lấy thông tin người dùng');
      }

      const userId = Number(profileResponse.data.user_id);
      const membershipId = Number(membership.membership_id);
      const amount = Number(membership.price);

      // Kiểm tra giá trị hợp lệ
      if (isNaN(userId) || isNaN(membershipId) || isNaN(amount)) {
        throw new Error('Dữ liệu không hợp lệ');
      }

      // Tạo payment data với dữ liệu đúng định dạng theo DTO
      const paymentData = {
        user_id: userId,
        membership_id: membershipId,
        amount_paid: amount,
        status_id: 1,
        payment_method: 'ZaloPay',
        order_id: `ORDER_${Date.now()}`
      };

      console.log('Payment data:', paymentData);

      // Gọi API tạo payment
      const response = await axios.post(
        'http://localhost:3000/payment',
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Payment Response:', response.data);

      if (response.data) {
        // Chuyển hướng đến trang thanh toán
        navigate('/payment-status', { 
          state: { 
            paymentId: response.data.payment_id,
            amount: amount,
            membershipName: membership.name,
            duration: membership.duration
          }
        });
      } else {
        throw new Error('Không nhận được thông tin thanh toán từ server');
      }
    } catch (error) {
      console.error('Lỗi khi tạo payment:', error);
      let errorMessage = 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.';
      
      if (error.response) {
        // Server trả về lỗi
        console.error('Server Error:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Không nhận được response từ server
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.';
      }
      
      alert(errorMessage);
      setShowPaymentModal(false);
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
                    onClick={() => handlePayment(membership)}
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
                onClick={() => {
                  setShowPaymentModal(false);
                  handlePayment(selectedMembership);
                }}
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