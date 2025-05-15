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
import "./styles.css";
import { SectionTitle } from "../../components/Title/SectionTitle";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const navigate = useNavigate();

  // Hàm để đảm bảo user_id hợp lệ
  const ensureValidUserId = (user) => {
    if (!user) {
      console.error("User is null or undefined");
      message.error("Please log in to access this feature");
      navigate("/login");
      return null;
    }
    
    console.log("Checking user object:", user);
    
    // Kiểm tra user_id và đảm bảo nó là số
    if (!user.user_id && user.user_id !== 0) {
      console.error("User object does not have valid user_id:", user);
      
      // Thử lấy từ localStorage một lần nữa
      const userStr = localStorage.getItem('user');
      console.log("Raw user from localStorage:", userStr);
      
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          console.log("Parsed user from localStorage:", parsedUser);
          
          if (parsedUser && parsedUser.user_id) {
            user.user_id = parsedUser.user_id;
            console.log("Recovered user_id from localStorage:", user.user_id);
          }
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }
      
      // Nếu vẫn không có user_id hợp lệ
      if (!user.user_id && user.user_id !== 0) {
        message.error("Unable to find user information, please log in again");
        navigate("/login");
        return null;
      }
    }
    
    console.log("User ID confirmed:", user.user_id);
    return user;
  };

  // Hàm kiểm tra và hiển thị thông tin file
  const handleFileChange = ({ fileList }) => {
    console.log("File change:", fileList);
    if (fileList.length > 0) {
      const file = fileList[0];
      console.log("Selected file:", {
        name: file.name,
        size: file.size,
        type: file.type,
        originFileObj: file.originFileObj ? "Available" : "Not available"
      });
      
      if (file.originFileObj) {
        console.log("File details:", {
          name: file.originFileObj.name,
          size: file.originFileObj.size,
          type: file.originFileObj.type,
          lastModified: new Date(file.originFileObj.lastModified).toISOString()
        });
      }
    }
    setFileList(fileList);
  };

  useEffect(() => {
    // Kiểm tra quyền truy cập
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || currentUser.role_id !== 3) {
      message.error("You do not have permission to access this page");
      navigate("/");
      return;
    }
    
    fetchExercises();
    fetchTags();
  }, [navigate]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      
      // Lấy thông tin người dùng hiện tại
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        message.error("Please log in to view your exercises");
        navigate("/login");
        return;
      }
      
      const response = await ExerciseService.getAllExercisePosts();
      
      // Lọc chỉ lấy bài tập của người dùng hiện tại (so sánh user_id)
      const userExercises = response.data.filter(exercise => {
        // Kiểm tra cả hai trường có thể chứa user_id
        const exerciseUserId = exercise.user_id || (exercise.user && exercise.user.user_id);
        return exerciseUserId === currentUser.user_id;
      });
      
      console.log(`Found ${userExercises.length} exercises for user ${currentUser.user_id}`);
      setExercises(userExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      message.error("Unable to load exercise list");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await ExerciseService.getAllTags();
      console.log("Tags response:", response.data);
      
      // Kiểm tra dữ liệu tags
      if (Array.isArray(response.data)) {
        setTags(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Nếu dữ liệu nằm trong trường data
        setTags(response.data.data);
      } else if (response.data && Array.isArray(response.data.tags)) {
        // Nếu dữ liệu nằm trong trường tags
        setTags(response.data.tags);
      } else {
        // Nếu không tìm thấy mảng, thiết lập mảng rỗng
        console.error("Tags data is not in expected format:", response.data);
        setTags([]);
        message.error("Unable to load tag list: Data format is incorrect");
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTags([]); // Đảm bảo tags luôn là mảng ngay cả khi có lỗi
      message.error("Unable to load tag list");
    }
  };

  const handleCreate = async (values) => {
    try {
      setLoading(true);
      let user = AuthService.getCurrentUser();
      
      // Đảm bảo user_id hợp lệ
      user = ensureValidUserId(user);
      if (!user) {
        setLoading(false);
        return;
      }

      console.log("Current user:", user);
      console.log("User ID being used:", user.user_id);

      // Validate required fields
      if (!values.name || !values.description) {
        message.error("Please fill in all exercise information");
        return;
      }

      // Lấy file từ fileList
      const file = fileList.length > 0 ? fileList[0]?.originFileObj : null;
      
      if (!file) {
        message.error("Please upload an image for the exercise");
        setLoading(false);
        return;
      }
      
      console.log("File selected:", file);
      
      // Chuẩn bị dữ liệu cho bài tập
      const data = {
        name: values.name,
        description: values.description,
        user_id: user.user_id,
        status_id: 1,
        video_rul: values.video_rul || "",
        tagIds: values.tagIds || [],
        steps: steps.map((step, index) => ({
          instruction: step.instruction,
          step_number: index + 1,
        })),
      };

      console.log("Creating exercise with data:", data);
      console.log("User ID included in data:", data.user_id);
      console.log("File to upload:", file ? file.name : "No file");
      
      // Sử dụng service để tạo bài tập
      try {
        const response = await ExerciseService.createExercisePost(data, file);
        console.log("Create exercise response:", response.data);
        
        toast.success("Exercise created successfully, pending approval");
        setModalVisible(false);
        form.resetFields();
        setFileList([]);
        setSteps([]);
        fetchExercises();
      } catch (innerError) {
        console.error("Error in API call:", innerError);
        console.log("Error response:", innerError.response?.data);
        message.error(`Error creating exercise: ${innerError.response?.data?.message || innerError.message}`);
      }
    } catch (error) {
      console.error("Error creating exercise:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create exercise";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      let user = AuthService.getCurrentUser();
      
      // Đảm bảo user_id hợp lệ
      user = ensureValidUserId(user);
      if (!user) {
        setLoading(false);
        return;
      }

      console.log("Current user for update:", user);
      console.log("User ID being used for update:", user.user_id);

      // Lấy file hình ảnh chính
      const file = fileList.length > 0 ? fileList[0]?.originFileObj : null;
      
      // Chuẩn bị dữ liệu cho bài tập
      const data = {
        name: values.name,
        description: values.description,
        user_id: user.user_id, // Đảm bảo truyền user_id từ current user
        status_id: 1, // Đặt lại thành pending approval khi update
        video_rul: values.video_rul || "",
        tagIds: values.tagIds || [],
        steps: steps.map((step, index) => ({
          step_number: index + 1,
          instruction: step.instruction,
        })),
      };

      console.log("Updating exercise with ID:", editingId);
      console.log("Update data:", data);
      console.log("User ID included in update data:", data.user_id);
      console.log("Status ID set to:", data.status_id);
      console.log("File to upload:", file ? file.name : "No file");
      
      // Sử dụng service để cập nhật bài tập
      try {
        // Truyền rõ user_id và status_id vào service để đảm bảo nó được sử dụng
        const response = await ExerciseService.updateExercisePost(editingId, data, file);
        console.log("Update exercise response:", response.data);
        
        toast.success("Exercise updated successfully");
        setModalVisible(false);
        form.resetFields();
        setFileList([]);
        setSteps([]);
        setEditingId(null);
        fetchExercises();
      } catch (innerError) {
        console.error("Error in API call:", innerError);
        console.log("Error response:", innerError.response?.data);
        message.error(`Error updating exercise: ${innerError.response?.data?.message || innerError.message}`);
      }
    } catch (error) {
      console.error("Error updating exercise:", error);
      console.log("Error response data:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update exercise";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        message.error("Please log in to approve the exercise");
        return;
      }

      await ExerciseService.updateExercisePost(id, {
        status_id: 2,
        user_id: user.user_id,
      });
      message.success("Exercise approved");
      fetchExercises();
    } catch (error) {
      console.error("Error approving exercise:", error);
      message.error("Unable to approve exercise");
    }
  };

  const handleReject = async (id) => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        message.error("Please log in to reject the exercise");
        return;
      }

      await ExerciseService.updateExercisePost(id, {
        status_id: 3,
        user_id: user.user_id,
      });
      message.success("Exercise rejected");
      fetchExercises();
    } catch (error) {
      console.error("Error rejecting exercise:", error);
      message.error("Unable to reject exercise");
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const user = AuthService.getCurrentUser();
      if (!user) {
        message.error("Please log in to delete the exercise");
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
  };

  const removeStep = (index) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
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
    <div className="pt-16">
      <div className="px-6 pb-6 min-h-screen bg-gray-50">
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
            onFinish={(values) => {
              console.log("Form onFinish called with values:", values);
              console.log("Current fileList:", fileList);
              console.log("Current steps:", steps);
              console.log("Current user:", AuthService.getCurrentUser());
              
              if (editingId) {
                handleUpdate(values);
              } else {
                handleCreate(values);
              }
            }}
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
                {Array.isArray(tags) && tags.length > 0 ? (
                  tags.map((tag) => (
                    <Option key={tag.tag_id} value={tag.tag_id}>
                      {tag.tag_name}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No tags available</Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item name="video_rul" label="Video Link">
              <Input />
            </Form.Item>

            <Form.Item 
              label="Exercise Image" 
              required 
              rules={[{ required: true, message: "Please upload an exercise image" }]}
              help="Exercise image is required. Supported formats: JPG, PNG, JPEG."
            >
              <Upload
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    message.error('You can only upload image files!');
                    return false;
                  }
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    message.error('Image size must be smaller than 5MB!');
                    return false;
                  }
                  return false;
                }}
                maxCount={1}
                accept="image/*"
                name="image"
                listType="picture-card"
              >
                {fileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload Image</div>
                    <div style={{ fontSize: 12, color: 'red' }}>(Required)</div>
                  </div>
                )}
              </Upload>
              <div className="text-xs text-gray-500 mt-1">
                Note: Images will be renamed when uploaded. Maximum size: 5MB
              </div>
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
