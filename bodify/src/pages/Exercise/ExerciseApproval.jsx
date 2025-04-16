import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ExerciseService from '../../services/exercise.service';
import AuthService from '../../services/auth.service';

const ExerciseApproval = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await ExerciseService.getAllExercisePosts();
      // Lọc chỉ lấy các bài tập đang chờ duyệt (status_id = 1)
      setExercises(response.data.filter(exercise => exercise.status_id === 1));
    } catch (error) {
      console.error('Error fetching exercises:', error);
      message.error('Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await ExerciseService.updateExercisePostStatus(id, 2); // 2 for approve
      message.success('Đã duyệt bài tập');
      fetchExercises();
    } catch (error) {
      console.error('Error approving exercise:', error);
      message.error('Không thể duyệt bài tập');
    }
  };

  const handleReject = async (id) => {
    try {
      await ExerciseService.updateExercisePostStatus(id, 3); // 3 for reject
      message.success('Đã từ chối bài tập');
      fetchExercises();
    } catch (error) {
      console.error('Error rejecting exercise:', error);
      message.error('Không thể từ chối bài tập');
    }
  };

  const columns = [
    {
      title: 'Tên bài tập',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Tags',
      dataIndex: 'exerciseposttag',
      key: 'tags',
      render: (tags) => (
        <Space>
          {tags?.map(tag => (
            <Tag key={tag.tag_id}>{tag.tag.tag_name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: ['user', 'fullname'],
      key: 'creator',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status_id',
      key: 'status',
      render: (status_id) => (
        <Tag color={status_id === 1 ? 'gold' : status_id === 2 ? 'green' : 'red'}>
          {status_id === 1 ? 'Chờ duyệt' : status_id === 2 ? 'Đã duyệt' : 'Đã từ chối'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        record.status_id === 1 ? (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.exercisepost_id)}
            >
              Duyệt
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record.exercisepost_id)}
            >
              Từ chối
            </Button>
          </Space>
        ) : null
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Duyệt bài tập</h1>
      <Table
        columns={columns}
        dataSource={exercises}
        loading={loading}
        rowKey="exercisepost_id"
      />
    </div>
  );
};

export default ExerciseApproval; 