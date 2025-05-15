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

const PTMembershipManagement = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  
  const ptUser = JSON.parse(localStorage.getItem('user')) || {};
  const ptId = ptUser.user_id;

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const data = await getMembershipsByGym(ptId);
      
      // Normalize the data to handle different field names and ensure all fields have values
      const normalizedData = Array.isArray(data) ? data.map(membership => ({
        ...membership,
        membership_id: membership.membership_id || 0, // Ensure ID always exists
        membership_name: membership.membership_name || membership.name || 'No name', // Use membership_name if available, otherwise use name
        name: membership.name || membership.membership_name || 'No name', // Ensure name is also available
        description: membership.description || '', // Default empty description
        price: membership.price, // Keep original price value
        duration: typeof membership.duration === 'number' ? membership.duration : 30, // Default duration 30 days
        membership_type: membership.membership_type || 2, // Default type 2 for PT
      })) : [];
      
      console.log('Normalized packages data:', normalizedData);
      setMemberships(normalizedData);
    } catch (error) {
      message.error('Failed to load packages');
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ptId) {
      fetchMemberships();
    }
  }, [ptId]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (membership) => {
    setEditingId(membership.membership_id);
    form.setFieldsValue({
      membership_name: membership.membership_name || membership.name,
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
      message.success('Package deleted successfully');
    } catch (error) {
      message.error('Failed to delete package');
      console.error('Error deleting package:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Check if name field is provided
      if (!values.membership_name) {
        message.error('Package name cannot be empty');
        return;
      }

      const membershipData = {
        membership_name: values.membership_name,
        description: values.description || '', // Ensure description is not null
        price: Number(values.price), // Ensure price is a number
        duration: Number(values.duration), // Ensure duration is a number
        user_id: ptId,
        membership_type: 2 // PT package type is 2
      };

      console.log('Submitting package data:', membershipData);

      if (editingId) {
        const result = await updateMembership(editingId, membershipData);
        if (result.status === 'success') {
          // Update local data
          setMemberships(memberships.map(m => 
            m.membership_id === editingId ? { ...m, ...membershipData } : m
          ));
          message.success(result.message || 'Package updated successfully');
        } else {
          message.warning(result.message || 'Update was not successful');
        }
      } else {
        const newMembership = await createMembership(membershipData);
        setMemberships([...memberships, newMembership]);
        message.success('New package created successfully');
      }
      setIsModalVisible(false);
    } catch (error) {
      // Display detailed error message from API if available
      if (error.status === 'error') {
        message.error(error.message || 'An error occurred');
        console.error('API Error Details:', error);
      } else if (error.response && error.response.data) {
        const errorMsg = error.response.data.message || error.response.data.error || 'Unknown error';
        message.error(`Error: ${errorMsg}`);
        console.error('API Error Details:', error.response.data);
      } else {
        message.error(editingId ? 'Error updating package' : 'Error creating new package');
        console.error('Error submitting package data:', error);
      }
    }
  };

  const renderPrice = (price) => {
    // Handle both string and number price values
    if (price) {
      // Convert to number if it's a string
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      if (!isNaN(numPrice) && numPrice > 0) {
        return numPrice.toLocaleString();
      }
    }
    return "Contact for price"; // Default message
  };

  const renderDuration = (duration) => {
    // Ensure duration is a number and not undefined
    return typeof duration === 'number' ? duration : 0;
  };

  const renderMembershipType = (type) => {
    // Ensure type is a valid value
    if (!type) return 'Premium'; // Default to Premium for PT packages
    
    switch (Number(type)) {
      case 1:
        return 'Basic';
      case 2:
        return 'Premium';
      case 3:
        return 'VIP';
      default:
        return 'Premium'; // Default to Premium for PT packages
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
          <Title level={2} style={{ margin: 0 }}>Training Packages</Title>
          <Text type="secondary">Manage your personal training packages</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          Add New Package
        </Button>
      </div>

      <Row gutter={[16, 16]}>
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
                  title="Are you sure you want to delete this package?"
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
                  {membership.membership_name || membership.name}
                </Text>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary"><DollarOutlined /> Price:</Text>
                    <Text style={{ marginLeft: '8px' }}>
                      {membership.price ? `${renderPrice(membership.price)} VND` : "Contact for price"}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary"><ClockCircleOutlined /> Duration:</Text>
                    <Text style={{ marginLeft: '8px' }}>{renderDuration(membership.duration)} days</Text>
                  </div>
                  <div>
                    <Text type="secondary">Type:</Text>
                    <Text style={{ marginLeft: '8px' }}>{renderMembershipType(membership.membership_type)}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Description:</Text>
                    <Text style={{ marginLeft: '8px' }}>{membership.description || "No description"}</Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingId ? "Edit Training Package" : "Add New Training Package"}
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
            label="Package Name"
            rules={[{ required: true, message: 'Please enter package name!' }]}
          >
            <Input placeholder="Enter package name" />
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
              { required: true, message: 'Please enter price!' },
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
              { required: true, message: 'Please enter duration!' },
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

export default PTMembershipManagement; 