import React, { useState, useEffect } from 'react';
import PaymentService from '../../../services/paymentservice';
import { getMembershipById } from '../../../services/membershipService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendarAlt, faDumbbell } from '@fortawesome/free-solid-svg-icons';

const UserMemberships = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberships, setMemberships] = useState([]);

  // Tính số ngày còn lại với khả năng stack membership
  const calculateRemainingDays = (payments, duration) => {
    if (!payments.length) return 0;

    const today = new Date();
    let totalRemainingDays = 0;

    // Duyệt qua từng payment theo thứ tự thời gian (cũ đến mới)
    const sortedPayments = [...payments].sort((a, b) => 
      new Date(a.payment_date) - new Date(b.payment_date)
    );

    // Tính ngày hết hạn của lần thanh toán cuối
    let lastExpiryDate = null;

    sortedPayments.forEach((payment) => {
      const paymentDate = new Date(payment.payment_date);
      
      // Nếu chưa có ngày hết hạn hoặc ngày thanh toán sau ngày hết hạn
      if (!lastExpiryDate || paymentDate > lastExpiryDate) {
        // Bắt đầu tính từ ngày thanh toán
        lastExpiryDate = new Date(paymentDate);
      }
      
      // Cộng thêm số ngày của lần thanh toán này
      lastExpiryDate.setDate(lastExpiryDate.getDate() + duration);
    });

    // Tính số ngày còn lại từ hôm nay đến ngày hết hạn cuối
    if (lastExpiryDate) {
      const remainingDays = Math.floor((lastExpiryDate - today) / (1000 * 60 * 60 * 24));
      return Math.max(0, remainingDays);
    }

    return 0;
  };

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Lấy tất cả payment
      const payments = await PaymentService.getMyPaymentHistory();
      console.log('Raw payments:', payments);

      // 2. Lọc payment thành công và nhóm theo membership_id
      const groupedPayments = {};
      payments.filter(p => p.status_id === 2).forEach(payment => {
        if (!groupedPayments[payment.membership_id]) {
          groupedPayments[payment.membership_id] = [];
        }
        groupedPayments[payment.membership_id].push(payment);
      });

      // 3. Lấy thông tin membership cho từng nhóm payment
      const result = [];
      for (const [membershipId, payments] of Object.entries(groupedPayments)) {
        try {
          // Lấy thông tin membership
          const membershipInfo = await getMembershipById(membershipId);
          console.log(`Membership info for ${membershipId}:`, membershipInfo);

          // Lấy data từ response
          const membershipData = membershipInfo.data;

          // Tính tổng số tiền và tổng thời gian
          const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
          const totalDuration = membershipData.duration * payments.length;

          // Sắp xếp payments theo ngày mới nhất (cho hiển thị)
          const sortedPayments = [...payments].sort((a, b) => 
            new Date(b.payment_date) - new Date(a.payment_date)
          );

          // Lấy 2 giao dịch gần nhất
          const recentPayments = sortedPayments.slice(0, 2);

          // Tính số ngày còn lại (có xét đến stack membership)
          const remainingDays = calculateRemainingDays(payments, membershipData.duration);

          result.push({
            membership_id: membershipId,
            membership_name: membershipData.membership_name,
            gym_name: payments[0].gym_name,
            gym_id: payments[0].gym_id,
            duration: membershipData.duration,
            total_duration: totalDuration,
            remaining_days: remainingDays,
            total_amount: totalAmount,
            payments: recentPayments.map(p => ({
              payment_id: p.payment_id,
              payment_date: p.payment_date,
              amount_paid: parseFloat(p.amount_paid),
              duration: membershipData.duration
            })),
            total_payments: payments.length,
            status: 'SUCCESS',
            className: 'bg-green-500'
          });
        } catch (err) {
          console.error(`Lỗi lấy thông tin membership ${membershipId}:`, err);
        }
      }

      console.log('Final result:', result);
      setMemberships(result);

    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Không thể tải dữ liệu membership');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />
  </div>;

  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    <p className="font-medium">Lỗi:</p>
    <p className="text-sm">{error}</p>
    <button onClick={fetchMemberships} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
      Thử lại
    </button>
  </div>;

  if (!memberships.length) return <div className="text-center p-4 bg-gray-50 rounded-lg">
    <p className="text-gray-600">Chưa có membership nào được thanh toán thành công.</p>
    <button onClick={() => window.location.href = '/gyms'} 
      className="mt-3 px-4 py-2 bg-primary-500 text-white rounded">
      Tìm phòng tập
    </button>
  </div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Membership đã thanh toán</h2>
        <button onClick={fetchMemberships} 
          className="px-3 py-1 bg-primary-500 text-white rounded">
          Tải lại
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {memberships.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow border border-gray-200">
            <div className={`${item.className} text-white p-3`}>
              <h3 className="font-bold">{item.membership_name}</h3>
              <p className="text-sm opacity-90">{item.gym_name}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-white bg-opacity-20 rounded text-xs">
                {item.status}
              </span>
            </div>
            
            <div className="p-3 space-y-2">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="mr-2 text-primary-500" />
                <span>Tổng thời hạn: <strong>{item.total_duration} ngày</strong></span>
              </div>

              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-primary-500" />
                <span>Còn lại: <strong>{item.remaining_days} ngày</strong></span>
              </div>
              
              <div className="flex items-center">
                <FontAwesomeIcon icon={faDumbbell} className="mr-2 text-primary-500" />
                <span>Tổng tiền: <strong>{item.total_amount.toLocaleString('vi-VN')}đ</strong></span>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {item.total_payments > 2 
                    ? `2 giao dịch gần nhất (tổng ${item.total_payments} giao dịch):`
                    : 'Các giao dịch:'}
                </p>
                <ul className="space-y-1 text-sm">
                  {item.payments.map((payment, idx) => (
                    <li key={idx} className="text-gray-600 py-1">
                      {new Date(payment.payment_date).toLocaleDateString('vi-VN')} - {payment.duration} ngày - {payment.amount_paid.toLocaleString('vi-VN')}đ
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserMemberships; 