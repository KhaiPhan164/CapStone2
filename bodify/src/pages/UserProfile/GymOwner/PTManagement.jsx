import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Avatar,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Space,
  Spin,
  Statistic
} from 'antd';
import { UserOutlined, PlusOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { getPTsByGym, createPT, updatePT, deletePT } from '../../../services/ptService';

const { Text, Title } = Typography;

const PTManagement = () => {
  const [pts, setPTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  
  const gymOwner = JSON.parse(localStorage.getItem('user')) || {};
  const gymName = gymOwner.name || '';

  const fetchPTs = async () => {
    try {
      setLoading(true);
      const data = await getPTsByGym(gymName);
      setPTs(data);
    } catch (error) {
      message.error('Failed to fetch PTs');
      console.error('Error fetching PTs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPTs();
  }, [gymName]);

  const renderStatus = (status_id) => {
    switch (status_id) {
      case 1:
        return <Tag color="orange">Pending</Tag>;
      case 2:
        return <Tag color="green">Active</Tag>;
      case 3:
        return <Tag color="red">Declined</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (pt) => {
    setEditingId(pt.id);
    form.setFieldsValue(pt);
    setIsModalVisible(true);
  };

  const handleDelete = async (ptId) => {
    try {
      await deletePT(ptId);
      setPTs(pts.filter(pt => pt.id !== ptId));
      message.success('PT deleted successfully');
    } catch (error) {
      message.error('Failed to delete PT');
      console.error('Error deleting PT:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await updatePT(editingId, values);
        setPTs(pts.map(pt => 
          pt.id === editingId ? { ...pt, ...values } : pt
        ));
        message.success('PT updated successfully');
      } else {
        const newPT = await createPT({
          ...values,
          gym: gymName
        });
        setPTs([...pts, newPT]);
        message.success('PT created successfully');
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error(editingId ? 'Failed to update PT' : 'Failed to create PT');
      console.error('Error submitting PT:', error);
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
          <Title level={2} style={{ margin: 0 }}>PT Management</Title>
          <Text type="secondary">Manage your personal trainers</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          Add New PT
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card style={{ marginBottom: '24px', background: '#fafafa' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Total PTs" value={pts.length} />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Active PTs" 
                  value={pts.filter(pt => pt.status_id === 2).length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Pending PTs" 
                  value={pts.filter(pt => pt.status_id === 1).length}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        {pts.map(pt => (
          <Col xs={24} sm={12} md={8} lg={6} key={pt.id}>
            <Card
              hoverable
              style={{ height: '100%' }}
              actions={[
                <Button type="link" key="edit" onClick={() => handleEdit(pt)}>
                  Edit
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Are you sure you want to delete this PT?"
                  onConfirm={() => handleDelete(pt.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" danger>Delete</Button>
                </Popconfirm>
              ]}
            >
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Avatar 
                  size={80} 
                  src={pt.avatar_url}
                  icon={!pt.avatar_url && <UserOutlined />}
                  style={{ marginBottom: '8px' }}
                />
                <div>
                  <Text strong style={{ fontSize: '16px', display: 'block' }}>
                    {pt.fullname}
                  </Text>
                  <div style={{ margin: '8px 0' }}>
                    {renderStatus(pt.status_id)}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary"><UserOutlined /> Username:</Text>
                    <Text style={{ marginLeft: '8px' }}>{pt.username}</Text>
                  </div>
                  <div>
                    <Text type="secondary"><MailOutlined /> Email:</Text>
                    <Text style={{ marginLeft: '8px' }}>{pt.email}</Text>
                  </div>
                  <div>
                    <Text type="secondary"><PhoneOutlined /> Phone:</Text>
                    <Text style={{ marginLeft: '8px' }}>{pt.phone}</Text>
                  </div>
                  <div>
                    <Text type="secondary"><HomeOutlined /> Gym:</Text>
                    <Text style={{ marginLeft: '8px' }}>{pt.gym}</Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingId ? "Edit PT" : "Add New PT"}
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
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="fullname"
            label="Full Name"
            rules={[{ required: true, message: 'Please input full name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please input phone number!' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: !editingId, message: 'Please input password!' }]}
          >
            <Input.Password placeholder="Enter password" />
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

export default PTManagement; 