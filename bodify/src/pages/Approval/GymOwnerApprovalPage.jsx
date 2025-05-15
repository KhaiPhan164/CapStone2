import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Tag, Image } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import UserService from '../../services/user.service';
import AuthService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import ChatService from '../../services/chat.service';

// Thêm 2 phương thức vào UserService
UserService.approvePT = async function(ptId) {
  try {
    const response = await fetch(`http://localhost:3000/users/pts/approve/${ptId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({ status_id: 2 })
    });
    
    // Không quan tâm nội dung response, miễn là không lỗi thì coi như thành công
    if (response.ok) {
      return {
        status: 'success',
        message: 'PT approved successfully'
      };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Unable to approve PT');
    }
  } catch (error) {
    console.error('Error approving PT:', error);
    throw error;
  }
};

UserService.rejectPT = async function(ptId) {
  try {
    const response = await fetch(`http://localhost:3000/users/pts/reject/${ptId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    });
    
    // Không quan tâm nội dung response, miễn là không lỗi thì coi như thành công
    if (response.ok) {
      return {
        status: 'success',
        message: 'PT rejected successfully'
      };
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Unable to reject PT');
    }
  } catch (error) {
    console.error('Error rejecting PT:', error);
    throw error;
  }
};

const GymOwnerApprovalPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingPTs();
    
    // Initialize chat for gym owners
    const user = AuthService.getCurrentUser();
    if (user && user.role_id === 4 && user.id) {
      // Connect to chat socket
      ChatService.connect(user.id);
      
      // Ensure chat bubble is visible
      setTimeout(() => {
        const chatboxContainer = document.querySelector('.chatbox-container');
        if (chatboxContainer) {
          chatboxContainer.style.display = 'block';
          chatboxContainer.style.zIndex = '9999';
        }
      }, 500);
    }

    return () => {
      // Disconnect chat when component unmounts
      const user = AuthService.getCurrentUser();
      if (user && user.role_id === 4) {
        ChatService.disconnect();
      }
    };
  }, [navigate]);

  const fetchPendingPTs = async () => {
    try {
      setLoading(true);
      const user = AuthService.getCurrentUser();
      console.log('Current user:', user);
      
      if (!user || user.role_id !== 4) {
        message.error('You do not have permission to access this page');
        navigate('/');
        return;
      }

      const gymName = user.name;
      console.log('Gym name:', gymName);
      
      // Lấy danh sách PT của phòng gym
      // Thử gọi API trực tiếp để xem cấu trúc dữ liệu đầy đủ
      const token = localStorage.getItem('token');
      const directResponse = await fetch(`http://localhost:3000/users/gym/pts?role_id=3&status_id=1`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!directResponse.ok) {
        throw new Error(`API error: ${directResponse.status}`);
      }
      
      const responseData = await directResponse.json();
      console.log('Raw response data:', responseData);
      
      // Kiểm tra cấu trúc dữ liệu
      let ptData = Array.isArray(responseData) ? responseData : [];
      
      // Lọc dữ liệu phía client để chỉ lấy PT thuộc gym hiện tại
      ptData = ptData.filter(pt => {
        // Đảm bảo so sánh không phân biệt chữ hoa/thường
        const ptGymLower = (pt.gym || '').toLowerCase();
        const currentGymLower = gymName.toLowerCase();
        const isMatchingGym = ptGymLower === currentGymLower;
        
        console.log(`PT ${pt.username || pt.name} - Gym: ${pt.gym}, Current Gym: ${gymName}, Match: ${isMatchingGym}`);
        
        return isMatchingGym;
      });
      
      console.log('Filtered PT data:', ptData);
      
      if (ptData.length > 0) {
        console.log('First PT object structure:', ptData[0]);
        
        // Map dữ liệu để đảm bảo có đủ các trường cần thiết
        const processedData = ptData.map(item => {
          // Kiểm tra tất cả các trường có thể chứa mật khẩu
          const password = item.password || 
                          item.rawPassword || 
                          item.raw_password || 
                          item.pass || 
                          'No information available';
          
          return {
            ...item,
            username: item.username || item.name || 'No information available',
            password: password
          };
        });
        
        console.log('Processed data:', processedData);
        setRequests(processedData);
      } else {
        console.log('No PT data available');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching pending PTs:', error);
      message.error('Unable to load pending PT list');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ptId) => {
    try {
      setLoading(true);
      await UserService.approvePT(ptId);
      
      // Thông báo thành công
      message.success('PT approved successfully');
      
      // Cập nhật trạng thái local hoặc reload lại danh sách
      await fetchPendingPTs(); // Load lại danh sách thay vì cập nhật state trực tiếp
      
    } catch (error) {
      console.error('Error approving PT:', error);
      message.error(error.message || 'Unable to approve PT');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (ptId) => {
    try {
      setLoading(true);
      await UserService.rejectPT(ptId);
      
      // Thông báo thành công
      message.success('PT rejected successfully');
      
      // Reload lại danh sách
      await fetchPendingPTs();
      
    } catch (error) {
      console.error('Error rejecting PT:', error);
      message.error(error.message || 'Unable to reject PT');
    } finally {
      setLoading(false);
    }
  };

  const showRequestDetails = (request) => {
    setSelectedRequest(request);
    console.log("Certificate value:", request.certificate);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Status',
      dataIndex: 'Status_id',
      key: 'Status_id',
      render: (Status_id) => (
        <Tag color={Status_id === 1 ? 'orange' : 'green'}>
          {Status_id === 1 ? 'Pending Approval' : 'Approved'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showRequestDetails(record)}
          >
            View Details
          </Button>
          {record.Status_id === 1 && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.user_id || record.id)}
                className="bg-green-500 hover:bg-green-600"
              >
                Approve
              </Button>
              <Button
                type="primary"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.user_id || record.id)}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="pt-6 p-6" style={{ zIndex: 1100 }}>
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Approve PT</h1>
        <p className="text-gray-600">List of PTs awaiting approval</p>
      </div>

      <Table
        columns={columns}
        dataSource={requests}
        loading={loading}
        rowKey={record => record.user_id || record.id}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Request Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="reject"
            danger
            icon={<CloseOutlined />}
            onClick={() => {
              if (selectedRequest) {
                handleReject(selectedRequest.user_id || selectedRequest.id);
                setModalVisible(false);
              }
            }}
          >
            Reject
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => {
              if (selectedRequest) {
                handleApprove(selectedRequest.user_id || selectedRequest.id);
                setModalVisible(false);
              }
            }}
          >
            Approve
          </Button>,
        ]}
        width={800}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Personal Information</h3>
                <p>Username: {selectedRequest.username}</p>
                <p>Gym: {selectedRequest.gym}</p>
              </div>
              <div>
                <h3 className="font-semibold">Certificate</h3>
                {selectedRequest.certificate ? (
                  <div className="border p-2 rounded">
                    {Array.isArray(selectedRequest.certificate) && selectedRequest.certificate.length > 0 ? (
                      // Handle case when certificate is an array
                      <>
                        {selectedRequest.certificate[0].imgurl ? (
                          <Image
                            src={selectedRequest.certificate[0].imgurl}
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
                              console.error("Image failed to load:", e);
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/400x300?text=Certificate+Error";
                            }}
                          />
                        ) : (
                          <p>Certificate image URL not found</p>
                        )}
                      </>
                    ) : typeof selectedRequest.certificate === 'object' ? (
                      // Handle case when certificate is an object
                      <>
                        {selectedRequest.certificate.imgurl ? (
                          <Image
                            src={selectedRequest.certificate.imgurl}
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
                              console.error("Image failed to load:", e);
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/400x300?text=Certificate+Error";
                            }}
                          />
                        ) : (
                          <p>Certificate image URL not found</p>
                        )}
                      </>
                    ) : (
                      // Handle case when certificate is a string
                      <>
                        <Image
                          src={selectedRequest.certificate}
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
                            console.error("Image failed to load:", e);
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/400x300?text=Certificate+Error";
                          }}
                        />
                      </>
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

      {/* Add global styles to ensure chatbox is always visible with higher z-index */}
      <style jsx>{`
        .chatbox-container {
          display: block !important;
          z-index: 9999 !important;
        }
      `}</style>
    </div>
  );
};

export default GymOwnerApprovalPage;