import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  message,
  Tag,
  Space,
  Card,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import ExerciseService from "../../services/exercise.service";
import AuthService from "../../services/auth.service";
import Header from "../../layout/Header";
import "./styles.css";
import { SectionTitle } from "../../components/Title/SectionTitle";
import { toast, ToastContainer } from "react-toastify";
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
      message.error("Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await ExerciseService.getAllTags();
      setTags(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách tags");
    }
  };

  const handleCreate = async (values) => {
    try {
      setLoading(true);
      const user = AuthService.getCurrentUser();
      if (!user) {
        message.error("Vui lòng đăng nhập để tạo bài tập");
        return;
      }

      // Validate required fields
      if (!values.name || !values.description) {
        message.error("Vui lòng điền đầy đủ thông tin bài tập");
        return;
      }

      // Chuẩn bị dữ liệu cho bài tập
      const data = {
        name: values.name,
        description: values.description,
        video_rul: values.video_rul || "",
        imgUrl: fileList[0]?.originFileObj,
        steps: steps.map((step, index) => ({
          instruction: step.instruction,
          img_url: stepImages[index]?.originFileObj || null,
        })),
        tagIds: values.tagIds || [],
      };

      const response = await ExerciseService.createExercisePost(data);

      if (response.data) {
        toast.success("Exercise created successfully, pending approval");
        setModalVisible(false);
        form.resetFields();
        setFileList([]);
        setSteps([]);
        setStepImages([]);
        fetchExercises();
      }
    } catch (error) {
      console.error("Error creating exercise:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Tạo bài tập thất bại";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const user = AuthService.getCurrentUser();
      if (!user) {
        message.error("Vui lòng đăng nhập để cập nhật bài tập");
        return;
      }

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("user_id", user.user_id);
      formData.append("video_rul", values.video_rul || "");

      if (fileList[0]?.originFileObj) {
        formData.append("imgUrl", fileList[0].originFileObj);
      }

      if (steps.length > 0) {
        const formattedSteps = steps.map((step, index) => ({
          step_number: index + 1,
          instruction: step.instruction,
          img_url: null,
        }));
        formData.append("steps", JSON.stringify(formattedSteps));

        steps.forEach((_, index) => {
          if (stepImages[index]?.originFileObj) {
            formData.append(`step_images`, stepImages[index].originFileObj);
          }
        });
      }

      if (values.tagIds && values.tagIds.length > 0) {
        formData.append("tagIds", JSON.stringify(values.tagIds));
      }

      await ExerciseService.updateExercisePost(editingId, formData);
      toast.success("Exercise updated successfully");
      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      setSteps([]);
      setStepImages([]);
      setEditingId(null);
      fetchExercises();
    } catch (error) {
      console.error("Error updating exercise:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Cập nhật bài tập thất bại";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        message.error("Vui lòng đăng nhập để duyệt bài tập");
        return;
      }

      await ExerciseService.updateExercisePost(id, {
        status_id: 2,
        user_id: user.user_id,
      });
      message.success("Đã duyệt bài tập");
      fetchExercises();
    } catch (error) {
      console.error("Error approving exercise:", error);
      message.error("Không thể duyệt bài tập");
    }
  };

  const handleReject = async (id) => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        message.error("Vui lòng đăng nhập để từ chối bài tập");
        return;
      }

      await ExerciseService.updateExercisePost(id, {
        status_id: 3,
        user_id: user.user_id,
      });
      message.success("Đã từ chối bài tập");
      fetchExercises();
    } catch (error) {
      console.error("Error rejecting exercise:", error);
      message.error("Không thể từ chối bài tập");
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const user = AuthService.getCurrentUser();
      if (!user) {
        message.error("Vui lòng đăng nhập để xóa bài tập");
        return;
      }

      await ExerciseService.deleteExercisePost(id);
      toast.success("Exercise deleted successfully");
      fetchExercises();
    } catch (error) {
      console.error("Error deleting exercise:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete exercise";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.exercisepost_id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      tagIds: record.exerciseposttag?.map((tag) => tag.tag_id),
      video_rul: record.video_rul,
    });
    setSteps(record.step || []);
    setStepImages(record.step?.map((step) => ({ url: step.img_url })) || []);
    if (record.img_url) {
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: record.img_url,
        },
      ]);
    }
    setModalVisible(true);
  };

  const addStep = () => {
    setSteps([...steps, { instruction: "" }]);
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
    console.log("Step image changed:", { index, file });
    const newStepImages = [...stepImages];
    newStepImages[index] = file;
    setStepImages(newStepImages);
  };

  const columns = [
    {
      title: "Exercise Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Tags",
      dataIndex: "exerciseposttag",
      key: "tags",
      width: 200,
      render: (tags) => (
        <Space>
          {tags?.map((tag) => (
            <Tag key={tag.tag_id}>{tag.tag.tag_name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status_id",
      key: "status",
      width: 150,
      render: (status) => (
        <Tag
          color={
            status === 1
              ? "gold"
              : status === 2
              ? "green"
              : status === 3
              ? "red"
              : "default"
          }
          className="text-sm py-1"
        >
          {status === 1
            ? "Pending Approval"
            : status === 2
            ? "Approved"
            : status === 3
            ? "Rejected"
            : "Undefined"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="border border-blue-400 bg-blue-100 text-blue-400"
          >
            Edit
          </Button>
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.exercisepost_id)}
            className="hover:!bg-red-100"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <div className="px-6 pb-6 h-screen bg-gray-50 pt-3">
        <div className="flex justify-between items-center mb-5 mx-5">
          <SectionTitle title="Exercise Management" />
          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setFileList([]);
              setSteps([]);
              setStepImages([]);
              setModalVisible(true);
            }}
            className="bg-gray-400 text-white text-base px-4 py-5 border-none rounded-md hover:!bg-primary-500 hover:!text-white hover:!border-none transition flex items-center"
          >
            Create New Exercise
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={exercises}
          loading={loading}
          rowKey="exercisepost_id"
          rowClassName={(_, index) =>
            index % 2 === 0 ? "bg-gray-100" : "bg-white"
          }
        />

        <Modal
          title={editingId ? "Edit Exercise" : "Create New Exercise"}
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
              label="Exercise Name"
              rules={[{ required: true, message: "Please enter the exercise name" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter the description" }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item name="tagIds" label="Tags">
              <Select mode="multiple" placeholder="Select tags">
                {tags.map((tag) => (
                  <Option key={tag.tag_id} value={tag.tag_id}>
                    {tag.tag_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="video_rul" label="Video Link">
              <Input />
            </Form.Item>

            <Form.Item label="Exercise Image">
              <Upload
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Steps</h3>
                <Button
                  type="default"
                  icon={<PlusCircleOutlined />}
                  onClick={addStep}
                  className="bg-gray-400 text-white px-4 py-2 border-none rounded-md hover:!bg-primary-500 hover:!text-white hover:!border-none transition flex items-center"
                >
                  Add Step
                </Button>
              </div>
              {steps.map((step, index) => (
                <Card key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Step {index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeStep(index)}
                    />
                  </div>
                  <Form.Item label="Instructions" required>
                    <TextArea
                      value={step.instruction}
                      onChange={(e) =>
                        updateStep(index, "instruction", e.target.value)
                      }
                      rows={3}
                      placeholder="Enter instructions for this step"
                    />
                  </Form.Item>
                  <Form.Item label="Illustrative Image">
                    <Upload
                      fileList={stepImages[index] ? [stepImages[index]] : []}
                      onChange={({ fileList }) =>
                        handleStepImageChange(index, fileList[0])
                      }
                      beforeUpload={() => false}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Upload Image</Button>
                    </Upload>
                  </Form.Item>
                </Card>
              ))}
            </div>

            <Form.Item>
              <Button
                type="default"
                htmlType="submit"
                loading={loading}
                className="bg-primary-500 text-white w-full px-4 py-5 font-medium border-none rounded-md hover:!bg-[#ffaf53] hover:!text-white hover:!border-none transition flex items-center"
              >
                {editingId ? "Update" : "Create"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ExerciseManagement;
