// components/UserTable.jsx
import React, { useState, useEffect } from 'react';
import { Table, Spin, Empty, message } from 'antd';
import { getPaymentsByGym } from '../../../services/membershipService';
import AuthService from '../../../services/auth.service';

const GuestTable = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const currentUser = AuthService.getCurrentUser();
        
        if (!currentUser || !currentUser.id) {
          message.error('Unable to identify gym owner information');
          setLoading(false);
          return;
        }

        const response = await getPaymentsByGym(currentUser.id);
        console.log('Payment data received:', response);
        
        if (response && response.status === 'success' && response.data) {
          // Lấy mảng dữ liệu từ response.data.data (cấu trúc phản hồi thực tế)
          const paymentsArray = response.data.data || [];
          console.log('Payments array:', paymentsArray);
          
          // Lọc ra những khách hàng đã đăng ký thành công (status_id = 2)
          const successfulPayments = paymentsArray.filter(payment => payment.status_id === 2);
          console.log('Successful payments:', successfulPayments);
          
          // Tạo map để lưu trữ người dùng duy nhất dựa trên user_id
          const uniqueUsers = new Map();
          
          // Lặp qua các thanh toán thành công và chỉ lấy người dùng duy nhất
          successfulPayments.forEach(payment => {
            const user = payment.user || {};
            const userId = user.id || user.user_id;
            
            // Nếu người dùng chưa tồn tại trong map, thêm vào
            if (userId && !uniqueUsers.has(userId)) {
              uniqueUsers.set(userId, {
                key: userId,
                name: user.name || 'No information',
                username: user.username || 'No information',
                email: user.email || 'No information',
                phone: user.phone || 'No information'
              });
            }
          });
          
          // Chuyển đổi Map thành mảng dữ liệu
          const formattedCustomers = Array.from(uniqueUsers.values());
          console.log('Unique customers:', formattedCustomers);

          setCustomers(formattedCustomers);
        } else {
          // Nếu không có dữ liệu hoặc có lỗi
          console.error('Can not find customer data:', response);
          setCustomers([]);
        }
      } catch (error) {
        message.error('Can not load customer data');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const columns = [
    {
      title: 'Full name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'User name',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone number',
      dataIndex: 'phone',
      key: 'phone',
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading customer list..." />
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Customer list</h2>
        <Empty 
          description="There are no customers registered to your gym yet" 
          className="my-10"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Customer list</h2>
      <p className="text-gray-500 mb-4">List of customer that has signed your membership</p>
      <Table 
        columns={columns} 
        dataSource={customers} 
        pagination={{ pageSize: 10 }}
        className="bg-white rounded-lg shadow"
        rowClassName="hover:bg-gray-50"
      />
    </div>
  );
};

export default GuestTable;
