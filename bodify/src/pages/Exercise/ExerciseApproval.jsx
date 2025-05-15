import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import ExerciseService from "../../services/exercise.service";
import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import ChatService from "../../services/chat.service";
import { SectionTitle } from "../../components/Title/SectionTitle";
import "./styles.css";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ExerciseApproval = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra quyền truy cập
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || currentUser.role_id !== 4) {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
    
    // Initialize chat for gym owners
    if (currentUser && currentUser.id) {
      // Connect to chat socket
      ChatService.connect(currentUser.id);
      
      // Ensure chat bubble is visible
      setTimeout(() => {
        const chatboxContainer = document.querySelector('.chatbox-container');
        if (chatboxContainer) {
          chatboxContainer.style.display = 'block';
          chatboxContainer.style.zIndex = '9999';
        }
      }, 500);
    }
    
    fetchExercises();
    
    return () => {
      // Disconnect chat when component unmounts
      if (currentUser && currentUser.role_id === 4) {
        ChatService.disconnect();
      }
    };
  }, [navigate]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      
      // Lấy thông tin người dùng hiện tại (Gym Owner)
      const currentUser = AuthService.getCurrentUser();
      const gymName = currentUser.name;
      console.log("Current gym name:", gymName);
      
      // Lấy tất cả bài tập
      const response = await ExerciseService.getAllExercisePosts();
      
      // Lọc bài tập đang chờ duyệt (status_id = 1)
      let pendingExercises = response.data.filter((exercise) => exercise.status_id === 1);
      console.log("All pending exercises:", pendingExercises);
      
      // Lọc bài tập của PT thuộc gym hiện tại
      const filteredExercises = [];
      
      // Xử lý song song các promises để tăng tốc độ
      await Promise.all(
        pendingExercises.map(async (exercise) => {
          try {
            // Lấy thông tin người tạo bài tập (PT)
            const userId = exercise.user_id;
            const userResponse = await UserService.getUserProfile(userId);
            const ptInfo = userResponse.data;
            
            // Kiểm tra xem PT có thuộc gym hiện tại không
            const ptGym = (ptInfo.gym || '').toLowerCase();
            const currentGym = gymName.toLowerCase();
            const isMatchingGym = ptGym === currentGym;
            
            console.log(`Exercise ${exercise.name} - Creator: ${ptInfo.username || ptInfo.name}, PT Gym: ${ptGym}, Current Gym: ${currentGym}, Match: ${isMatchingGym}`);
            
            // Thêm bài tập vào danh sách lọc nếu PT thuộc gym hiện tại
            if (isMatchingGym) {
              // Thêm thông tin PT vào bài tập để hiển thị trong UI
              exercise.ptInfo = ptInfo;
              filteredExercises.push(exercise);
            }
          } catch (error) {
            console.error(`Error fetching user info for user_id ${exercise.user_id}:`, error);
          }
        })
      );
      
      console.log("Filtered exercises for this gym:", filteredExercises);
      setExercises(filteredExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Failed to load exercise list");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await ExerciseService.updateExercisePostStatus(id, 2); // 2 for approve
      toast.success("Exercise approved successfully");
      fetchExercises();
    } catch (error) {
      console.error("Error approving exercise:", error);
      toast.error("Failed to approve exercise");
    }
  };

  const handleReject = async (id) => {
    try {
      await ExerciseService.updateExercisePostStatus(id, 3); // 3 for reject
      toast.success("Exercise rejected successfully");
      fetchExercises();
    } catch (error) {
      console.error("Error rejecting exercise:", error);
      toast.error("Failed to reject exercise");
    }
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
      render: (tags) => (
        <Space>
          {tags?.map((tag) => (
            <Tag key={tag.tag_id}>{tag.tag.tag_name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Creator",
      key: "creator",
      render: (_, record) => {
        const creator = record.ptInfo ? 
          (record.ptInfo.username || record.ptInfo.name || record.user?.fullname || "Unknown") : 
          (record.user?.fullname || "Unknown");
        
        return creator;
      }
    },
    {
      title: "Status",
      dataIndex: "status_id",
      key: "status",
      width: 150,
      render: (status_id) => (
        <Tag
          color={status_id === 1 ? "gold" : status_id === 2 ? "green" : "red"}
          className="text-sm py-1"
        >
          {status_id === 1
            ? "Pending Approval"
            : status_id === 2
            ? "Approved"
            : "Rejected"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 230,
      render: (_, record) =>
        record.status_id === 1 ? (
          <Space>
            <Button
              type="default"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.exercisepost_id)}
              className="border border-blue-400 bg-blue-100 text-blue-400"
            >
              Approve
            </Button>
            <Button
              type="default"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record.exercisepost_id)}
              className="hover:!bg-red-100"
            >
              Reject
            </Button>
          </Space>
        ) : null,
    },
  ];
  
  return (
    <div className="pt-4">
      <div className="px-8 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Exercise Approval</h1>
          <p className="text-gray-600 mt-2">Only showing exercises created by PTs in your gym</p>
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
        
        {/* Add global styles to ensure chatbox is always visible */}
        <style jsx>{`
          .chatbox-container {
            display: block !important;
            z-index: 9999 !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ExerciseApproval;
  