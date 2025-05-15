import { Table, Button, Space, Spin, Empty, Tag } from "antd";
import { useState, useEffect } from "react";
import { EyeOutlined } from "@ant-design/icons";
import { getPaymentsByGym } from '../../../services/membershipService';
import AuthService from '../../../services/auth.service';

export default function MembershipTable() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser || !currentUser.id) {
        console.error('Không thể xác định thông tin chủ phòng gym');
        setLoading(false);
        return;
      }

      const response = await getPaymentsByGym(currentUser.id);
      console.log('Payment data received in MembershipTable:', response);
      
      if (response && response.status === 'success' && response.data) {
        const paymentsArray = response.data.data || [];
        
        // Lọc ra những thanh toán thành công (status_id = 2)
        const successfulPayments = paymentsArray.filter(payment => payment.status_id === 2);
        console.log('Successful payments:', successfulPayments);
        
        // Tính tổng payment và tìm ngày tham gia đầu tiên cho mỗi người dùng
        const userPayments = new Map();
        
        successfulPayments.forEach(payment => {
          const user = payment.user || {};
          const userId = user.id || user.user_id;
          if (!userId) return; // Bỏ qua nếu không có userId
          
          // Sử dụng amount_paid thay vì price
          const amountPaid = Number(payment.amount_paid) || 0;
          console.log(`User: ${user.name}, Payment ID: ${payment.payment_id}, Amount Paid: ${amountPaid}`);
          
          // Sử dụng payment_date thay vì created_at
          const paymentDate = payment.payment_date ? new Date(payment.payment_date) : 
                             (payment.created_at ? new Date(payment.created_at) : new Date());
          
          console.log(`User: ${user.name}, Payment date:`, paymentDate.toISOString(), 
                     `Raw payment_date: ${payment.payment_date}`);
          
          if (!userPayments.has(userId)) {
            // Khởi tạo thông tin người dùng nếu chưa có
            userPayments.set(userId, {
              userId: userId,
              name: user.name || 'Không có thông tin',
              username: user.username || 'Không có thông tin',
              email: user.email || 'Không có thông tin',
              totalAmount: amountPaid,
              paymentCount: 1,
              firstPaymentDate: paymentDate
            });
          } else {
            // Cập nhật thông tin nếu người dùng đã tồn tại
            const userData = userPayments.get(userId);
            userData.totalAmount += amountPaid;
            userData.paymentCount += 1;
            
            // Cập nhật ngày tham gia nếu tìm thấy thanh toán cũ hơn
            if (paymentDate < userData.firstPaymentDate) {
              userData.firstPaymentDate = paymentDate;
            }
            
            userPayments.set(userId, userData);
          }
        });
        
        // Log thông tin về các user và ngày thanh toán đầu tiên của họ
        console.log('User payments data:');
        userPayments.forEach((data, userId) => {
          console.log(`User ID: ${userId}, Name: ${data.name}, First Payment: ${data.firstPaymentDate.toISOString()}, Total: ${data.totalAmount}`);
        });
        
        // Chuyển đổi Map thành mảng và sắp xếp theo tổng số tiền giảm dần
        const userList = Array.from(userPayments.values())
          .sort((a, b) => b.totalAmount - a.totalAmount);
        
        console.log('Sorted user list by total payment:', userList);
        
        // Lấy top 5 người dùng có tổng payment cao nhất
        const top5Users = userList.slice(0, 5).map((userData, index) => {
          // Format ngày tham gia đầu tiên
          const joinDateFormatted = formatDate(userData.firstPaymentDate);
          console.log(`User ${userData.name} join date formatted: ${joinDateFormatted}`);
          
          return {
            key: userData.userId || index,
            name: userData.name,
            joined: joinDateFormatted,
            totalAmount: userData.totalAmount,
            paymentCount: userData.paymentCount
          };
        });
        
        console.log('Top 5 users with highest payments:', top5Users);
        setMembers(top5Users);
      } else {
        console.error('Không thể lấy dữ liệu thành viên:', response);
        setMembers([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thành viên:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date theo định dạng "DD/MM/YYYY"
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const columns = [
    { 
      title: "MEMBER NAME", 
      dataIndex: "name", 
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>
    },
    { 
      title: "JOIN DATE", 
      dataIndex: "joined", 
      key: "joined" 
    },
    { 
      title: "TOTAL PAYMENT", 
      dataIndex: "totalAmount", 
      key: "totalAmount",
      render: (amount) => <span className="font-medium text-green-600">{formatCurrency(amount)}</span>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      defaultSortOrder: 'descend'
    },
    { 
      title: "PAYMENT COUNT", 
      dataIndex: "paymentCount", 
      key: "paymentCount",
      render: (count) => <Tag color="blue">{count}</Tag>
    },
    {
      title: "ACTIONS",
      width: 100,
      key: "action",
      render: () => (
        <Button type="link" icon={<EyeOutlined />} />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải danh sách thành viên..." />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Member List</h2>
        <Empty 
          description="Chưa có thành viên nào đăng ký phòng tập của bạn" 
          className="my-10"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Top 5 Members Has Highest Total Payment</h2>
      <Table 
        columns={columns} 
        dataSource={members} 
        pagination={false}
        className="bg-white rounded-lg shadow"
        rowClassName="hover:bg-gray-50"
      />
    </div>
  );
}
