import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Space,
  Spin,
  Statistic,
  InputNumber,
  Select
} from 'antd';
import { PlusOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getMembershipsByGym, createMembership, updateMembership, deleteMembership } from '../../../services/membershipService';

const { Text, Title } = Typography;
const { Option } = Select;

const MembershipManagement = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  
  const gymOwner = JSON.parse(localStorage.getItem('user')) || {};
  const gymId = gymOwner.user_id;
  
  // Thêm một state phụ để hiển thị dữ liệu đã được xử lý
  const [processedMemberships, setProcessedMemberships] = useState([]);
  
  // Xử lý dữ liệu mỗi khi memberships thay đổi
  useEffect(() => {
    if (Array.isArray(memberships)) {
      const valid = memberships
        .filter(m => m && m.membership_id)
        .map(m => ({
          ...m,
          price: m.price !== undefined && m.price !== null ? Number(m.price) : 0,
          duration: m.duration !== undefined && m.duration !== null ? Number(m.duration) : 0,
          membership_name: m.membership_name || 'Unnamed Membership',
          description: m.description || 'No description available',
          status_id: m.status_id || 2,
          membership_type: m.membership_type || 2
        }));
      setProcessedMemberships(valid);
      console.log('Processed data for display:', valid);
    } else {
      setProcessedMemberships([]);
    }
  }, [memberships]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const data = await getMembershipsByGym(gymId);
      
      // Đảm bảo dữ liệu hợp lệ trước khi cập nhật state
      const validMemberships = Array.isArray(data) ? data
        .filter(membership => membership && membership.membership_id) // Loại bỏ các membership không có ID
        .map(membership => ({
          ...membership,
          price: membership.price !== undefined && membership.price !== null ? Number(membership.price) : 0,
          duration: membership.duration !== undefined && membership.duration !== null ? Number(membership.duration) : 0,
          membership_name: membership.membership_name || 'Unnamed Membership',
          description: membership.description || 'No description available',
          status_id: membership.status_id || 2, // Mặc định là Active nếu không có status
          membership_type: membership.membership_type || 2 // Mặc định là Premium nếu không có type
        })) : [];
      
      console.log('Processed memberships:', validMemberships);
      setMemberships(validMemberships);
    } catch (error) {
      message.error('Failed to fetch memberships');
      console.error('Error fetching memberships:', error);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gymId) {
      fetchMemberships();
    }
  }, [gymId]);

  const renderStatus = (status_id) => {
    switch (status_id) {
      case 1:
        return <Tag color="orange">Pending</Tag>;
      case 2:
        return <Tag color="green">Active</Tag>;
      case 3:
        return <Tag color="red">Inactive</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (membership) => {
    setEditingId(membership.membership_id);
    form.setFieldsValue({
      membership_name: membership.membership_name,
      description: membership.description,
      price: membership.price,
      duration: membership.duration
    });
    setIsModalVisible(true);
    
    setTimeout(() => {
      form.validateFields().catch(err => {
        console.log('Validation errors in current data:', err);
      });
    }, 100);
  };

  const handleDelete = async (membershipId) => {
    try {
      await deleteMembership(membershipId);
      setMemberships(memberships.filter(m => m.membership_id !== membershipId));
      message.success('Membership deleted successfully');
    } catch (error) {
      message.error('Failed to delete membership');
      console.error('Error deleting membership:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Đảm bảo giá trị hợp lệ trước khi gửi đi
      const price = Number(values.price);
      const duration = Number(values.duration);
      
      // Kiểm tra thêm lần nữa trước khi gửi
      if (!Number.isInteger(price) || price < 0) {
        message.error('Price must be a positive integer!');
        return;
      }
      
      if (!Number.isInteger(duration) || duration <= 0) {
        message.error('Duration must be a positive integer!');
        return;
      }
      
      // Kiểm tra tên membership
      if (!/^[a-zA-Z0-9\s]+$/.test(values.membership_name)) {
        message.error('Membership name cannot contain special characters!');
        return;
      }
      
      // Kiểm tra description nếu có
      if (values.description && !/^[a-zA-Z0-9\s.,!?()-]+$/.test(values.description)) {
        message.error('Description cannot contain special characters except .,!?()-');
        return;
      }

      const membershipData = {
        ...values,
        user_id: gymId,
        membership_type: 2 // Luôn để mặc định là 2
      };

      if (editingId) {
        await updateMembership(editingId, membershipData);
        
        // Cập nhật dữ liệu trực tiếp với đầy đủ các trường đã xử lý
        const updatedMembership = {
          ...membershipData,
          membership_id: editingId,
          status_id: 2, // Mặc định là Active
          price: Number(membershipData.price),
          duration: Number(membershipData.duration),
          description: membershipData.description || 'No description available'
        };
        
        setMemberships(memberships.map(m => 
          m.membership_id === editingId ? updatedMembership : m
        ));
        
        message.success('Membership updated successfully');
      } else {
        const response = await createMembership(membershipData);
        
        // Xử lý response để đảm bảo có đầy đủ thông tin
        const newMembership = {
          ...membershipData,
          membership_id: response.membership_id || response.id || Date.now(), // Đảm bảo luôn có ID
          status_id: 2, // Mặc định là Active
          price: Number(membershipData.price),
          duration: Number(membershipData.duration),
          description: membershipData.description || 'No description available'
        };
        
        setMemberships(prev => [...prev, newMembership]);
        message.success('Membership created successfully');
      }
      
      setIsModalVisible(false);
      
      // Refresh dữ liệu sau khi thêm/sửa để đảm bảo dữ liệu mới nhất
      setTimeout(() => {
        fetchMemberships();
      }, 1000);
      
    } catch (error) {
      message.error(editingId ? 'Failed to update membership' : 'Failed to create membership');
      console.error('Error submitting membership:', error);
    }
  };

  const renderMembershipType = (type) => {
    switch (type) {
      case 1:
        return 'Basic';
      case 2:
        return 'Premium';
      case 3:
        return 'VIP';
      default:
        return 'Premium'; // Mặc định hiển thị Premium cho type = 2
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Membership Management</Title>
          <Text type="secondary">Manage your gym membership packages</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          Add New Membership
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card style={{ marginBottom: '24px', background: '#fafafa' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Total Memberships" value={processedMemberships.length} />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Active Memberships" 
                  value={processedMemberships.filter(m => m.status_id === 2).length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Inactive Memberships" 
                  value={processedMemberships.filter(m => m.status_id === 3).length}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        {processedMemberships.length > 0 ? (
          <Row gutter={[16, 16]}>
            {processedMemberships.map(membership => (
              <Col xs={24} sm={12} md={8} lg={6} key={membership.membership_id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Button type="link" key="edit" onClick={() => handleEdit(membership)}>
                      Edit
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Are you sure you want to delete this membership?"
                      onConfirm={() => handleDelete(membership.membership_id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="link" danger>Delete</Button>
                    </Popconfirm>
                  ]}
                >
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <Text strong style={{ fontSize: '18px', display: 'block' }}>
                      {membership.membership_name}
                    </Text>
                    <div style={{ margin: '8px 0' }}>
                      {renderStatus(membership.status_id)}
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text type="secondary"><DollarOutlined /> Price:</Text>
                        <Text style={{ marginLeft: '8px' }}>
                          {membership.price !== undefined && membership.price !== null 
                            ? membership.price.toLocaleString() 
                            : '0'} VND
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary"><ClockCircleOutlined /> Duration:</Text>
                        <Text style={{ marginLeft: '8px' }}>{membership.duration || 0} days</Text>
                      </div>
                      <div>
                        <Text type="secondary">Type:</Text>
                        <Text style={{ marginLeft: '8px' }}>{renderMembershipType(membership.membership_type)}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Description:</Text>
                        <Text style={{ marginLeft: '8px' }}>{membership.description}</Text>
                      </div>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Title level={4}>No Memberships Available</Title>
              <p style={{ color: '#888', marginBottom: '20px' }}>Create your first membership package to get started.</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add New Membership
              </Button>
            </div>
          </Card>
        )}
      </Row>

      <Modal
        title={editingId ? "Edit Membership" : "Add New Membership"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          style={{ padding: '20px 0' }}
        >
          <Form.Item
            name="membership_name"
            label="Membership Name"
            rules={[
              { required: true, message: 'Please input membership name!' },
              { 
                pattern: /^[a-zA-Z0-9\s]+$/, 
                message: 'Membership name cannot contain special characters!' 
              }
            ]}
          >
            <Input placeholder="Enter membership name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { 
                pattern: /^[a-zA-Z0-9\s.,!?()-]+$/, 
                message: 'Description cannot contain special characters except .,!?()-' 
              }
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter description (optional)" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (VND)"
            rules={[
              { required: true, message: 'Please input price!' },
              { type: 'number', message: 'Price must be a number!' },
              { 
                validator: (_, value) => {
                  if (value && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
                    return Promise.reject('Price must be a positive integer!');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Enter price"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (days)"
            rules={[
              { required: true, message: 'Please input duration!' },
              { type: 'number', message: 'Duration must be a number!' },
              { 
                validator: (_, value) => {
                  if (value && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
                    return Promise.reject('Duration must be a positive integer!');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="Enter duration in days"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MembershipManagement; 