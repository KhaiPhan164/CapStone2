import React, { useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Image
} from 'antd';

const { Text, Paragraph } = Typography;

// Mock data for preview
const mockExercises = [
  {
    id: 1,
    exercise_name: 'Gym Workout',
    description: 'Full body workout routine for building strength and muscle',
    video_url: 'https://example.com/gym-workout',
    image_url: 'https://tranhtreotuong.vn/images/tranh-treo-tuong-2020/tranh-treo-tuong-phong-tap-gym/11-6.jpg',
    status_id: 1
  },
  {
    id: 2,
    exercise_name: 'Morning Yoga',
    description: 'Gentle morning yoga flow for flexibility and mindfulness',
    video_url: 'https://example.com/morning-yoga',
    image_url: 'https://furnibuy.com/wp-content/uploads/2020/07/tranh-treo-tuong-binh-hoa-trang-tri-dep-1490-1.jpg',
    status_id: 2
  },
  {
    id: 3,
    exercise_name: 'Home Fitness',
    description: 'Effective home-based exercises for overall fitness',
    video_url: 'https://example.com/home-fitness',
    image_url: 'https://aocuoihuongduong.com/wp-content/uploads/2021/04/gia-h-y-di-t-tranh-treo-tu-ng-trang-guong-b-3-tranh-gd43-phong-khach.jpg',
    status_id: 1
  }
];

const ExerciseManagement = () => {
  const [exercises, setExercises] = useState(mockExercises);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Status render helper
  const renderStatus = (status_id) => {
    switch (status_id) {
      case 1:
        return <Tag color="orange">Pending</Tag>;
      case 2:
        return <Tag color="green">Approved</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  // Add new exercise
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Edit exercise
  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Delete exercise
  const handleDelete = (id) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
    message.success('Exercise deleted successfully');
  };

  // Submit form
  const handleSubmit = (values) => {
    if (editingId) {
      // Update existing exercise
      setExercises(exercises.map(exercise => 
        exercise.id === editingId 
          ? { ...exercise, ...values }
          : exercise
      ));
      message.success('Exercise updated successfully');
    } else {
      // Create new exercise
      const newExercise = {
        id: Math.max(...exercises.map(e => e.id)) + 1,
        ...values,
        status_id: 1 // Mặc định là pending khi tạo mới
      };
      setExercises([...exercises, newExercise]);
      message.success('Exercise added successfully');
    }
    setIsModalVisible(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Exercise Management</h2>
        <Button type="primary" onClick={handleAdd} size="large">
          Add New Exercise
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {exercises.map(exercise => (
          <Col xs={24} sm={12} md={8} lg={8} key={exercise.id}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                  <Image
                    alt={exercise.exercise_name}
                    src={exercise.image_url}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    preview={false}
                  />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1 }}>
                    {renderStatus(exercise.status_id)}
                  </div>
                </div>
              }
              actions={[
                <Button key="edit" type="link" onClick={() => handleEdit(exercise)}>Edit</Button>,
                <Popconfirm
                  key="delete"
                  title="Are you sure you want to delete this exercise?"
                  onConfirm={() => handleDelete(exercise.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" danger>Delete</Button>
                </Popconfirm>
              ]}
            >
              <Text strong style={{ fontSize: '16px', marginBottom: '8px', display: 'block' }}>
                {exercise.exercise_name}
              </Text>
              <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: '12px' }}>
                {exercise.description}
              </Paragraph>
              <Text type="secondary" ellipsis style={{ display: 'block' }}>
                Video: <a href={exercise.video_url} target="_blank" rel="noopener noreferrer">{exercise.video_url}</a>
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingId ? "Edit Exercise" : "Add New Exercise"}
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
            name="exercise_name"
            label="Exercise Name"
            rules={[{ required: true, message: 'Please input exercise name!' }]}
          >
            <Input placeholder="Enter exercise name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input.TextArea 
              placeholder="Enter exercise description"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="video_url"
            label="Video URL"
            rules={[{ required: true, message: 'Please input video URL!' }]}
          >
            <Input placeholder="Enter video URL" />
          </Form.Item>

          <Form.Item
            name="image_url"
            label="Image URL"
            rules={[{ required: true, message: 'Please input image URL!' }]}
          >
            <Input placeholder="Enter image URL" />
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

export default ExerciseManagement;
