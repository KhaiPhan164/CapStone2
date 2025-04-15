import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Tag, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import ExerciseService from '../../services/exercise.service';
import AuthService from '../../services/auth.service';

const ExerciseApproval = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPendingExercises();
  }, []);

  const fetchPendingExercises = async () => {
    try {
      setLoading(true);
      const user = AuthService.getCurrentUser();
      if (!user || user.role_id !== 4) {
        message.error('Bạn không có quyền truy cập trang này');
        return;
      }

      const response = await ExerciseService.getAllExercisePosts();
      // Lọc bài tập có status_id = 1 (chờ duyệt)
      const pendingExercises = response.data.filter(exercise => exercise.status_id === 1);
      setExercises(pendingExercises);
    } catch (error) {
      message.error('Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await ExerciseService.updateExercisePost(id, { status_id: 2 });
      message.success('Duyệt bài tập thành công');
      fetchPendingExercises();
    } catch (error) {
      message.error('Duyệt bài tập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoading(true);
      await ExerciseService.deleteExercisePost(id);
      message.success('Từ chối bài tập thành công');
      fetchPendingExercises();
    } catch (error) {
      message.error('Từ chối bài tập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const showExerciseDetails = (exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
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
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showExerciseDetails(record)}
          >
            Xem chi tiết
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record.exercisepost_id)}
            className="bg-green-500 hover:bg-green-600"
          >
            Duyệt
          </Button>
          <Button
            type="primary"
            danger
            icon={<CloseOutlined />}
            onClick={() => handleReject(record.exercisepost_id)}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Duyệt bài tập</h1>
        <p className="text-gray-600">Danh sách bài tập đang chờ duyệt</p>
      </div>

      <Table
        columns={columns}
        dataSource={exercises}
        loading={loading}
        rowKey="exercisepost_id"
      />

      <Modal
        title="Chi tiết bài tập"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedExercise && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Tên bài tập</h3>
              <p>{selectedExercise.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Mô tả</h3>
              <p>{selectedExercise.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Tags</h3>
              <Space>
                {selectedExercise.exerciseposttag?.map(tag => (
                  <Tag key={tag.tag_id}>{tag.tag.tag_name}</Tag>
                ))}
              </Space>
            </div>
            {selectedExercise.img_url && (
              <div>
                <h3 className="font-semibold">Ảnh bài tập</h3>
                <img 
                  src={selectedExercise.img_url} 
                  alt={selectedExercise.name}
                  className="max-w-full h-auto"
                />
              </div>
            )}
            {selectedExercise.video_rul && (
              <div>
                <h3 className="font-semibold">Video</h3>
                <a 
                  href={selectedExercise.video_rul} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Xem video
                </a>
              </div>
            )}
            {selectedExercise.step && selectedExercise.step.length > 0 && (
              <div>
                <h3 className="font-semibold">Các bước thực hiện</h3>
                <div className="space-y-2">
                  {selectedExercise.step.map((step, index) => (
                    <div key={index} className="border p-2 rounded">
                      <p className="font-medium">Bước {step.step_number}: {step.instruction}</p>
                      {step.img_url && (
                        <img 
                          src={step.img_url} 
                          alt={`Bước ${step.step_number}`}
                          className="max-w-full h-auto mt-2"
                        />
                      )}
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

export default ExerciseApproval; 