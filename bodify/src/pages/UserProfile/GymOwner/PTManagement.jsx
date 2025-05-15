import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Typography,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Modal,
  Spin,
  Image
} from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined, EyeOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { deletePT } from '../../../services/ptService';
import AuthService from '../../../services/auth.service';
import ChatService from '../../../services/chat.service';

const { Text, Title } = Typography;

const PTManagement = () => {
  const [pts, setPTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedPT, setSelectedPT] = useState(null);
  
  const gymOwner = AuthService.getCurrentUser() || {};
  const gymName = gymOwner.name || '';

  useEffect(() => {
    // Kết nối socket chat khi component mount
    if (gymOwner && gymOwner.id) {
      ChatService.connect(gymOwner.id);
      
      // Đảm bảo chat bubble được hiển thị
      const chatboxContainer = document.querySelector('.chatbox-container');
      if (chatboxContainer) {
        chatboxContainer.style.display = 'block';
      } else {
        console.log('Không tìm thấy chatbox-container');
      }
    }

    return () => {
      // Ngắt kết nối socket khi component unmount
      ChatService.disconnect();
    };
  }, [gymOwner]);

  const fetchPTs = async () => {
    try {
      setLoading(true);
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      
      // Gọi API để lấy danh sách PT của gym
      const response = await fetch(`http://localhost:3000/users/gym/pts/filter?role_id=3&status_id=2`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('PT data received:', responseData);
      
      // Kiểm tra cấu trúc dữ liệu và lấy mảng data từ response
      let ptData = [];
      if (responseData && responseData.status === 'success' && Array.isArray(responseData.data)) {
        ptData = responseData.data;
        console.log('PT array extracted:', ptData);
      } else if (Array.isArray(responseData)) {
        ptData = responseData;
      } else {
        console.error('Unexpected data structure:', responseData);
        message.error('Dữ liệu PT không đúng định dạng');
        setLoading(false);
        return;
      }
      
      // Lấy tên gym hiện tại và chuyển thành chữ thường để so sánh
      const currentGymLower = (gymName || '').toLowerCase().trim();
      console.log('Current gym (lowercase):', currentGymLower);
      
      // Lọc dữ liệu phía client để chỉ lấy PT thuộc gym hiện tại
      // In ra thông tin chi tiết về mỗi PT để debug
      console.log('All PTs before filtering:');
      ptData.forEach((pt, index) => {
        const ptGym = pt.gym || '';
        console.log(`PT ${index}: username=${pt.username}, name=${pt.name}, gym=${ptGym}`);
      });
      
      const filteredPTs = ptData.filter(pt => {
        const ptGymLower = (pt.gym || '').toLowerCase().trim();
        const isMatchingGym = ptGymLower === currentGymLower;
        console.log(`Comparing: PT gym "${ptGymLower}" with current gym "${currentGymLower}" - Match: ${isMatchingGym}`);
        return isMatchingGym;
      });
      
      console.log('Filtered PT data:', filteredPTs);
      
      // Nếu không tìm thấy PT nào sau khi lọc, thử hiển thị tất cả PT
      if (filteredPTs.length === 0 && ptData.length > 0) {
        console.log('No matching PTs found. Consider showing all PTs or check gym name matching.');
        // Có thể bỏ comment dòng dưới để hiển thị tất cả PT nếu không tìm thấy PT nào phù hợp
        // filteredPTs = ptData;
      }
      
      // Map dữ liệu để đảm bảo có đủ các trường cần thiết
      const processedData = filteredPTs.map(item => {
        return {
          ...item,
          id: item.user_id || item.id,
          username: item.username || item.name || 'Không có thông tin',
          fullname: item.name || item.fullname || item.username || 'Không có thông tin',
          status_id: item.status_id || item.Status_id
        };
      });
      
      console.log('Processed data:', processedData);
      
      if (processedData.length > 0) {
        setPTs(processedData);
      } else {
        setPTs([]);
        message.info('Không có PT nào đang hoạt động trong phòng gym của bạn');
      }
    } catch (error) {
      message.error('Không thể tải danh sách PT');
      console.error('Error fetching PTs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPTs();
  }, [gymName]);

  const renderStatus = (status_id) => {
    // Convert status_id to number to ensure accurate comparison
    const statusNum = Number(status_id);
    
    switch (statusNum) {
      case 1:
        return <Tag color="orange">Pending Approval</Tag>;
      case 2:
        return <Tag color="green">Active</Tag>;
      case 3:
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag color="default">Undefined ({status_id})</Tag>;
    }
  };

  const handleDelete = async (ptId) => {
    try {
      await deletePT(ptId);
      setPTs(pts.filter(pt => pt.id !== ptId));
      message.success('PT deleted successfully');
      fetchPTs(); // Reload the list after deletion
    } catch (error) {
      message.error('Unable to delete PT');
      console.error('Error deleting PT:', error);
    }
  };

  const showPTDetails = (pt) => {
    setSelectedPT(pt);
    setIsViewModalVisible(true);
  };

  const handleStartChat = async (pt) => {
    try {
      if (!gymOwner || !gymOwner.id) {
        message.error('Bạn cần đăng nhập để sử dụng tính năng chat');
        return;
      }

      if (!pt || !pt.id) {
        message.error('Không tìm thấy thông tin PT');
        return;
      }

      // Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
      await ChatService.sendMessage(pt.id, `Xin chào PT ${pt.fullname || pt.username}! Tôi là chủ phòng gym ${gymName}.`);
      
      message.success(`Đã bắt đầu cuộc trò chuyện với PT ${pt.fullname || pt.username}`);
      
      // Kích hoạt hiển thị chat bubble
      const chatToggle = document.querySelector('.chat-toggle');
      if (chatToggle) {
        // Mở chatbox nếu nó đang đóng
        const chatWindow = document.querySelector('.chat-window');
        if (chatWindow && window.getComputedStyle(chatWindow).display === 'none') {
          chatToggle.click();
        }
      } else {
        console.log('Không tìm thấy nút chat-toggle');
      }
    } catch (error) {
      console.error('Lỗi khi bắt đầu cuộc trò chuyện:', error);
      message.error('Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại sau.');
    }
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            size={32} 
            src={record.avatar_url}
            icon={!record.avatar_url && <UserOutlined />}
            className="mr-2"
          />
          {text || record.name || 'No information available'}
        </div>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status_id',
      key: 'status_id',
      render: (status_id) => renderStatus(status_id),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 300,
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showPTDetails(record)}
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => handleStartChat(record)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Chat
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this PT?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-3">
        <Title level={2}>PT Management</Title>
        <Text type="secondary">List of active PTs in your gym</Text>
      </div>

      <Table
        columns={columns}
        dataSource={pts}
        loading={loading}
        rowKey={record => record.id}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal xem chi tiết PT */}
      <Modal
        title="Chi tiết thông tin PT"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="chat"
            type="primary"
            icon={<MessageOutlined />}
            onClick={() => {
              handleStartChat(selectedPT);
              setIsViewModalVisible(false);
            }}
          >
            Chat với PT
          </Button>
        ]}
        width={800}
      >
        {selectedPT && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Avatar 
                size={64} 
                src={selectedPT.avatar_url}
                icon={!selectedPT.avatar_url && <UserOutlined />}
                className="mr-4"
              />
              <div>
                <Title level={4} className="m-0">{selectedPT.fullname || selectedPT.name}</Title>
                <div className="mt-1">{renderStatus(selectedPT.status_id)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Thông tin cá nhân</h3>
                <p><UserOutlined className="mr-2" /> Username: {selectedPT.username}</p>
                <p><MailOutlined className="mr-2" /> Email: {selectedPT.email}</p>
                <p><PhoneOutlined className="mr-2" /> Phone: {selectedPT.phone || 'Not updated'}</p>
                <p><HomeOutlined className="mr-2" /> Gym: {selectedPT.gym}</p>
              </div>
              
           

              <div>
                <h3 className="font-semibold">Certificate</h3>
                {selectedPT.certificate ? (
                  <div className="border p-2 rounded">
                    {Array.isArray(selectedPT.certificate) && selectedPT.certificate.length > 0 ? (
                      <Image
                        src={selectedPT.certificate[0].imgurl}
                        alt="Certificate"
                        style={{
                          width: '100%',
                          maxHeight: '300px',
                          objectFit: 'contain'
                        }}
                        preview={{
                          mask: <div className="ant-image-mask-info">Click to view<br />zoom in</div>
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/400x300?text=Certificate+Error";
                        }}
                      />
                    ) : typeof selectedPT.certificate === 'object' ? (
                      <Image
                        src={selectedPT.certificate.imgurl}
                        alt="Certificate"
                        style={{
                          width: '100%',
                          maxHeight: '300px',
                          objectFit: 'contain'
                        }}
                        preview={{
                          mask: <div className="ant-image-mask-info">Click to view<br />zoom in</div>
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/400x300?text=Certificate+Error";
                        }}
                      />
                    ) : (
                      <Image
                        src={selectedPT.certificate}
                        alt="Certificate"
                        style={{
                          width: '100%',
                          maxHeight: '300px',
                          objectFit: 'contain'
                        }}
                        preview={{
                          mask: <div className="ant-image-mask-info">Click to view<br />zoom in</div>
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/400x300?text=Certificate+Error";
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <p>No certificate available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Thêm style để đảm bảo chatbox hiển thị */}
      <style jsx>{`
        .chatbox-container {
          display: block !important;
          z-index: 9999 !important;
        }
      `}</style>
    </div>
  );
};

export default PTManagement; 