import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Tag, Image } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import UserService from '../../services/user.service';
import AuthService from '../../services/auth.service';

const GymOwnerApprovalPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPendingPTs();
  }, []);

  const fetchPendingPTs = async () => {
    try {
      setLoading(true);
      const user = AuthService.getCurrentUser();
      console.log('Current user:', user);
      console.log('Gym name:', user.name);

      if (!user || user.role_id !== 4) {
        message.error('Bạn không có quyền truy cập trang này');
        return;
      }

      // Lấy danh sách PT của phòng gym
      const response = await UserService.getPTsByGym(user.name);
      console.log('PTs response:', response);
      
      setRequests(response);
    } catch (error) {
      console.error('Error fetching pending PTs:', error);
      message.error('Không thể tải danh sách PT đang chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ptId) => {
    try {
      setLoading(true);
      await UserService.approvePT(ptId);
      message.success('Duyệt PT thành công');
      fetchPendingPTs();
    } catch (error) {
      console.error('Error approving PT:', error);
      message.error('Không thể duyệt PT');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (ptId) => {
    try {
      setLoading(true);
      await UserService.rejectPT(ptId);
      message.success('Từ chối PT thành công');
      fetchPendingPTs();
    } catch (error) {
      console.error('Error rejecting PT:', error);
      message.error('Không thể từ chối PT');
    } finally {
      setLoading(false);
    }
  };

  const showRequestDetails = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Tên PT',
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
      title: 'Trạng thái',
      dataIndex: 'Status_id',
      key: 'Status_id',
      render: (Status_id) => (
        <Tag color={Status_id === 1 ? 'orange' : 'green'}>
          {Status_id === 1 ? 'Đang chờ duyệt' : 'Đã duyệt'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showRequestDetails(record)}
          >
            Xem chi tiết
          </Button>
          {record.Status_id === 1 && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                className="bg-green-500 hover:bg-green-600"
              >
                Duyệt
              </Button>
              <Button
                type="primary"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              >
                Từ chối
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Duyệt PT</h1>
        <p className="text-gray-600">Danh sách PT đang chờ duyệt</p>
      </div>

      <Table
        columns={columns}
        dataSource={requests}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Chi tiết yêu cầu"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Thông tin cá nhân</h3>
                <p>Tên: {selectedRequest.name}</p>
                <p>Email: {selectedRequest.email}</p>
                <p>Số điện thoại: {selectedRequest.phoneNum}</p>
                <p>Phòng gym: {selectedRequest.gym}</p>
              </div>
              <div>
                <h3 className="font-semibold">Chứng chỉ</h3>
                {selectedRequest.certificate && selectedRequest.certificate.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRequest.certificate.map((cert, index) => (
                      <div key={index} className="border p-2 rounded">
                        {cert.endsWith('.pdf') ? (
                          <a
                            href={cert}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Xem PDF
                          </a>
                        ) : (
                          <Image
                            src={cert}
                            alt={`Certificate ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Không có chứng chỉ</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GymOwnerApprovalPage; 