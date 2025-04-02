import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  message,
  Modal,
  Typography,
  Tooltip,
  Badge
} from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import AuthService from '../../services/auth.service';
import axios from 'axios';
import { API_URL } from '../../config';

const { Title } = Typography;

const ApprovalPage = ({ role_id }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch requests based on role
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/requests/pending`, {
        params: { role_id },
        headers: AuthService.getAuthHeader() // Thêm header xác thực
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      message.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Kiểm tra đăng nhập trước khi fetch data
    if (AuthService.isLoggedIn()) {
      fetchRequests();
    } else {
      message.error('Vui lòng đăng nhập để xem danh sách yêu cầu');
      // Có thể thêm redirect đến trang login ở đây
    }
  }, [role_id]);

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`${API_URL}/api/requests/${requestId}/approve`, 
        { status_id: 2 }, // Active status
        { headers: AuthService.getAuthHeader() }
      );
      message.success('Đã duyệt yêu cầu thành công');
      // Gửi email thông báo cho PT
      await axios.post(`${API_URL}/api/send-email`, {
        requestId,
        type: 'approval'
      }, { headers: AuthService.getAuthHeader() });
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      message.error('Không thể duyệt yêu cầu');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.put(`${API_URL}/api/requests/${requestId}/reject`,
        { status_id: 3 }, // Rejected status
        { headers: AuthService.getAuthHeader() }
      );
      message.success('Đã từ chối yêu cầu');
      // Gửi email thông báo cho PT
      await axios.post(`${API_URL}/api/send-email`, {
        requestId,
        type: 'rejection'
      }, { headers: AuthService.getAuthHeader() });
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error('Không thể từ chối yêu cầu');
    }
  };

  const showDetails = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'request_id',
      key: 'request_id',
      width: 80,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNum',
      key: 'phoneNum',
    },
    {
      title: 'Phòng Gym',
      dataIndex: 'gym',
      key: 'gym',
      render: (gym) => gym || 'Chờ Admin duyệt',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status_id',
      key: 'status_id',
      render: (status_id) => (
        <Tag color={status_id === 1 ? 'gold' : status_id === 2 ? 'green' : 'red'}>
          {status_id === 1 ? 'Đang chờ' : status_id === 2 ? 'Đã duyệt' : 'Đã từ chối'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={() => showDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Duyệt">
            <Button 
              type="primary" 
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.request_id)}
              disabled={record.status_id !== 1}
            />
          </Tooltip>
          <Tooltip title="Từ chối">
            <Button 
              danger 
              icon={<CloseOutlined />}
              onClick={() => handleReject(record.request_id)}
              disabled={record.status_id !== 1}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card className="shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>
            {role_id === 1 ? 'Admin Approval Requests' : 'Gym Owner Approval Requests'}
          </Title>
          <Badge count={requests.filter(r => r.status_id === 1).length} showZero>
            <span className="text-lg">Pending Requests</span>
          </Badge>
        </div>

        <Table
          columns={columns}
          dataSource={requests}
          loading={loading}
          rowKey="request_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
          }}
        />
      </Card>

      <Modal
        title="Request Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Personal Information</h3>
                <p><strong>Name:</strong> {selectedRequest.name}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
                <p><strong>Phone:</strong> {selectedRequest.phoneNum}</p>
                <p><strong>Address:</strong> {selectedRequest.address}</p>
              </div>
              <div>
                <h3 className="font-semibold">Request Details</h3>
                <p><strong>Gym:</strong> {selectedRequest.gym || 'Admin Approval Required'}</p>
                <p><strong>Status:</strong> 
                  <Tag color={selectedRequest.status_id === 1 ? 'gold' : selectedRequest.status_id === 2 ? 'green' : 'red'}>
                    {selectedRequest.status_id === 1 ? 'Pending' : selectedRequest.status_id === 2 ? 'Active' : 'Rejected'}
                  </Tag>
                </p>
                <p><strong>Created At:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
              </div>
            </div>
            {selectedRequest.certificates && selectedRequest.certificates.length > 0 && (
              <div>
                <h3 className="font-semibold">Certificates</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedRequest.certificates.map((cert, index) => (
                    <div key={index} className="border p-2 rounded">
                      <p><strong>Certificate {index + 1}:</strong></p>
                      <p>Name: {cert.name}</p>
                      <p>Type: {cert.type}</p>
                      <p>Size: {(cert.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApprovalPage; 