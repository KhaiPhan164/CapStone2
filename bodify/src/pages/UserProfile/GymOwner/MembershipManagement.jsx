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

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const data = await getMembershipsByGym(gymId);
      setMemberships(data);
    } catch (error) {
      message.error('Failed to fetch memberships');
      console.error('Error fetching memberships:', error);
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
      const membershipData = {
        ...values,
        user_id: gymId,
        membership_type: 2 // Luôn để mặc định là 2
      };

      if (editingId) {
        await updateMembership(editingId, membershipData);
        setMemberships(memberships.map(m => 
          m.membership_id === editingId ? { ...m, ...membershipData } : m
        ));
        message.success('Membership updated successfully');
      } else {
        const newMembership = await createMembership(membershipData);
        setMemberships([...memberships, newMembership]);
        message.success('Membership created successfully');
      }
      setIsModalVisible(false);
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
                <Statistic title="Total Memberships" value={memberships.length} />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Active Memberships" 
                  value={memberships.filter(m => m.status_id === 2).length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Inactive Memberships" 
                  value={memberships.filter(m => m.status_id === 3).length}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        {memberships.map(membership => (
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
                    <Text style={{ marginLeft: '8px' }}>{membership.price.toLocaleString()} VND</Text>
                  </div>
                  <div>
                    <Text type="secondary"><ClockCircleOutlined /> Duration:</Text>
                    <Text style={{ marginLeft: '8px' }}>{membership.duration} days</Text>
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
            rules={[{ required: true, message: 'Please input membership name!' }]}
          >
            <Input placeholder="Enter membership name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Enter description (optional)" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (VND)"
            rules={[
              { required: true, message: 'Please input price!' },
              { type: 'number', message: 'Price must be a number!' }
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
              { type: 'number', message: 'Duration must be a number!' }
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