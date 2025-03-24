import React, { useState } from 'react';
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
  Tabs,
  List,
  Space
} from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Mock data for preview - Thay thế bằng API call sau
const mockPTs = [
  {
    id: 1,
    username: 'john_pt',
    fullname: 'John Trainer',
    email: 'john@example.com',
    phone: '0123456789',
    avatar_url: null,
    gym: 'FitGym',
    role_id: 3,
    status_id: 2
  },
  {
    id: 2,
    username: 'mary_pt',
    fullname: 'Mary Coach',
    email: 'mary@example.com',
    phone: '0987654321',
    avatar_url: null,
    gym: 'FitGym',
    role_id: 3,
    status_id: 2
  }
];

const mockPendingPTs = [
  {
    id: 3,
    username: 'peter_pt',
    fullname: 'Peter Smith',
    email: 'peter@example.com',
    phone: '0123456788',
    avatar_url: null,
    gym: 'FitGym',
    role_id: 3,
    status_id: 1
  },
  {
    id: 4,
    username: 'sarah_pt',
    fullname: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '0987654322',
    avatar_url: null,
    gym: 'FitGym',
    role_id: 3,
    status_id: 1
  }
];

const PTManagement = () => {
  const [activePTs, setActivePTs] = useState(mockPTs);
  const [pendingPTs, setPendingPTs] = useState(mockPendingPTs);

  // Status render helper
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

  // Handle accept PT
  const handleAccept = (ptId) => {
    // API call sẽ được thêm vào đây
    const updatedPendingPTs = pendingPTs.filter(pt => pt.id !== ptId);
    const acceptedPT = pendingPTs.find(pt => pt.id === ptId);
    if (acceptedPT) {
      acceptedPT.status_id = 2;
      setActivePTs([...activePTs, acceptedPT]);
    }
    setPendingPTs(updatedPendingPTs);
    message.success('PT application accepted successfully');
  };

  // Handle decline PT
  const handleDecline = (ptId) => {
    // API call sẽ được thêm vào đây
    const updatedPendingPTs = pendingPTs.filter(pt => pt.id !== ptId);
    setPendingPTs(updatedPendingPTs);
    message.success('PT application declined successfully');
  };

  // Render PT Card
  const renderPTCard = (pt, isPending = false) => (
    <Card
      key={pt.id}
      hoverable
      style={{ marginBottom: 16 }}
    >
      <List.Item.Meta
        avatar={
          <Avatar 
            size={64} 
            src={pt.avatar_url} 
            icon={!pt.avatar_url && <UserOutlined />}
          />
        }
        title={
          <Space>
            <Text strong>{pt.fullname}</Text>
            {renderStatus(pt.status_id)}
          </Space>
        }
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Username: {pt.username}</Text>
            <Text>Email: {pt.email}</Text>
            <Text>Phone: {pt.phone}</Text>
            <Text>Gym: {pt.gym}</Text>
          </Space>
        }
      />
      {isPending && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Popconfirm
              title="Are you sure you want to accept this PT?"
              onConfirm={() => handleAccept(pt.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary">Accept</Button>
            </Popconfirm>
            <Popconfirm
              title="Are you sure you want to decline this PT?"
              onConfirm={() => handleDecline(pt.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>Decline</Button>
            </Popconfirm>
          </Space>
        </div>
      )}
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Tabs defaultActiveKey="active">
        <TabPane tab="Active PTs" key="active">
          <List
            dataSource={activePTs}
            renderItem={pt => renderPTCard(pt)}
            style={{ marginTop: 16 }}
          />
        </TabPane>
        <TabPane tab="Pending PTs" key="pending">
          <List
            dataSource={pendingPTs}
            renderItem={pt => renderPTCard(pt, true)}
            style={{ marginTop: 16 }}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PTManagement; 