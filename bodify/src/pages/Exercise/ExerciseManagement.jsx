import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, Select, message, Tag, Space, Card } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import ExerciseService from '../../services/exercise.service';
import AuthService from '../../services/auth.service';

const { TextArea } = Input;
const { Option } = Select;

const ExerciseManagement = () => {
  const [exercises, setExercises] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [steps, setSteps] = useState([]);
  const [stepImages, setStepImages] = useState([]);

  useEffect(() => {
    fetchExercises();
    fetchTags();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await ExerciseService.getAllExercisePosts();
      setExercises(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await ExerciseService.getAllTags();
      setTags(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách tags');
    }
  };

  const handleCreate = async (values) => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!values.name || !values.description) {
        message.error('Vui lòng điền đầy đủ thông tin bài tập');
        return;
      }

      // Format steps with correct field names
      const preparedSteps = steps.map((step, index) => {
        if (!step.instruction) {
          message.error(`Vui lòng nhập hướng dẫn cho bước ${index + 1}`);
          throw new Error('Missing step instruction');
        }
        return {
          instruction: step.instruction,
          img_url: stepImages[index]?.originFileObj || null
        };
      });

      const formData = {
        name: values.name,
        description: values.description,
        steps: preparedSteps,
        tagIds: values.tagIds || [],
        video_rul: values.video_rul
      };

      console.log('Submitting exercise:', formData);

      const response = await ExerciseService.createExercisePost(formData, fileList[0]?.originFileObj);
      
      if (response.data) {
        message.success('Tạo bài tập thành công');
        setModalVisible(false);
        form.resetFields();
        setFileList([]);
        setSteps([]);
        setStepImages([]);
        fetchExercises();
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Tạo bài tập thất bại';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const formData = {
        ...values,
        steps: steps.map((step, index) => ({
          stepNumber: index + 1,
          instruction: step.instruction,
          imgUrl: stepImages[index]?.url
        }))
      };

      await ExerciseService.updateExercisePost(editingId, formData, fileList[0]?.originFileObj);
      message.success('Cập nhật bài tập thành công');
      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      setSteps([]);
      setStepImages([]);
      setEditingId(null);
      fetchExercises();
    } catch (error) {
      message.error('Cập nhật bài tập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await ExerciseService.deleteExercisePost(id);
      message.success('Xóa bài tập thành công');
      fetchExercises();
    } catch (error) {
      message.error('Xóa bài tập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.exercisepost_id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      tagIds: record.exerciseposttag?.map(tag => tag.tag_id),
      video_rul: record.video_rul
    });
    setSteps(record.step || []);
    setStepImages(record.step?.map(step => ({ url: step.img_url })) || []);
    if (record.img_url) {
      setFileList([{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: record.img_url
      }]);
    }
    setModalVisible(true);
  };

  const addStep = () => {
    setSteps([...steps, { instruction: '' }]);
    setStepImages([...stepImages, null]);
  };

  const removeStep = (index) => {
    const newSteps = [...steps];
    const newStepImages = [...stepImages];
    newSteps.splice(index, 1);
    newStepImages.splice(index, 1);
    setSteps(newSteps);
    setStepImages(newStepImages);
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleStepImageChange = (index, file) => {
    console.log('Step image changed:', { index, file });
    const newStepImages = [...stepImages];
    newStepImages[index] = file;
    setStepImages(newStepImages);
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
      title: 'Trạng thái',
      dataIndex: 'status_id',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'orange' : 'green'}>
          {status === 1 ? 'Chờ duyệt' : 'Đã duyệt'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.exercisepost_id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý bài tập</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setFileList([]);
            setSteps([]);
            setStepImages([]);
            setModalVisible(true);
          }}
        >
          Tạo bài tập mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={exercises}
        loading={loading}
        rowKey="exercisepost_id"
      />

      <Modal
        title={editingId ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingId ? handleUpdate : handleCreate}
        >
          <Form.Item
            name="name"
            label="Tên bài tập"
            rules={[{ required: true, message: 'Vui lòng nhập tên bài tập' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="tagIds"
            label="Tags"
          >
            <Select
              mode="multiple"
              placeholder="Chọn tags"
            >
              {tags.map(tag => (
                <Option key={tag.tag_id} value={tag.tag_id}>
                  {tag.tag_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="video_rul"
            label="Link video"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ảnh bài tập"
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
          </Form.Item>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Các bước thực hiện</h3>
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={addStep}
              >
                Thêm bước
              </Button>
            </div>
            {steps.map((step, index) => (
              <Card key={index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Bước {index + 1}</h4>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeStep(index)}
                  />
                </div>
                <Form.Item
                  label="Hướng dẫn"
                  required
                >
                  <TextArea
                    value={step.instruction}
                    onChange={(e) => updateStep(index, 'instruction', e.target.value)}
                    rows={3}
                    placeholder="Nhập hướng dẫn cho bước này"
                  />
                </Form.Item>
                <Form.Item label="Ảnh minh họa">
                  <Upload
                    fileList={stepImages[index] ? [stepImages[index]] : []}
                    onChange={({ fileList }) => handleStepImageChange(index, fileList[0])}
                    beforeUpload={() => false}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                  </Upload>
                </Form.Item>
              </Card>
            ))}
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingId ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExerciseManagement; 