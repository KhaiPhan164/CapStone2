import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Modal, Avatar, Tooltip } from "antd";
import { CheckOutlined, CloseOutlined, EyeOutlined, UserOutlined, ZoomInOutlined } from "@ant-design/icons";
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
  const [viewingExercise, setViewingExercise] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);
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

  const handleViewExercise = (exercise) => {
    setViewingExercise(exercise);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setViewingExercise(null);
  };

  const handleImageClick = () => {
    setImageZoom(!imageZoom);
  };

  const columns = [
    {
      title: "Exercise Name",
      dataIndex: "name",
      key: "name",
      width: 140,
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 180,
      ellipsis: true,
    },
    {
      title: "Tags",
      dataIndex: "exerciseposttag",
      key: "tags",
      width: 120,
      ellipsis: true,
      render: (tags) => (
        <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
          {tags?.slice(0, 3).map((tag) => (
            <Tag key={tag.tag_id} className="truncate max-w-[80px]">
              {tag.tag.tag_name}
            </Tag>
          ))}
          {tags?.length > 3 && <Tag>...</Tag>}
        </div>
      ),
    },
    {
      title: "Creator",
      key: "creator",
      width: 120,
      ellipsis: true,
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
      align: "center",
      width: 100,
      render: (status_id) => (
        <Tooltip title={
          status_id === 1 
            ? "Pending Approval" 
            : status_id === 2 
              ? "Approved" 
              : "Rejected"
        }>
          <Tag
            color={status_id === 1 ? "gold" : status_id === 2 ? "green" : "red"}
            className="text-xs py-1 px-2"
          >
            {status_id === 1
              ? "Pending"
              : status_id === 2
              ? "Approved"
              : "Rejected"}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "action",
      align: "center",
      width: 240,
      render: (_, record) =>
        record.status_id === 1 ? (
          <div className="flex items-center justify-center space-x-4">
            <Tooltip title="View details">
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => handleViewExercise(record)}
                className="eye-button border border-green-400 bg-green-100 text-green-500"
                size="small"
              />
            </Tooltip>
            <Button
              type="default"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.exercisepost_id)}
              className="border border-blue-400 bg-blue-100 text-blue-400"
              size="small"
            >
              Approve
            </Button>
            <Button
              type="default"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record.exercisepost_id)}
              className="hover:!bg-red-100"
              size="small"
            >
              Reject
            </Button>
          </div>
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
            index % 2 === 0 ? "bg-gray-50" : "bg-white"
          }
          pagination={{ 
            pageSize: 10,
            position: ["bottomCenter"],
            showSizeChanger: false
          }}
          bordered
          className="exercise-approval-table"
        />
        
        {/* Exercise Details Modal */}
        <Modal
          title={<div className="text-xl font-bold">{viewingExercise?.name || 'Exercise Details'}</div>}
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width={800}
          centered
        >
          {viewingExercise && (
            <div className="p-4">
              <div className="mb-6">
                {viewingExercise.img_url && (
                  <div className="mb-4">
                    <div className="flex justify-center relative">
                      <img 
                        src={viewingExercise.img_url} 
                        alt={viewingExercise.name} 
                        className={`modal-image object-contain rounded-lg shadow-md cursor-pointer ${imageZoom ? 'max-h-[70vh] w-auto' : 'max-h-80'}`}
                        onClick={handleImageClick}
                      />
                      <Tooltip title={imageZoom ? "Click to reduce" : "Click to enlarge"}>
                        <ZoomInOutlined 
                          className="absolute top-2 right-2 text-xl bg-white/70 p-1 rounded-full cursor-pointer hover:bg-white" 
                          onClick={handleImageClick}
                        />
                      </Tooltip>
                    </div>
                  </div>
                )}
                
                {/* Creator information */}
                {viewingExercise.ptInfo && (
                  <div className="mb-4 flex items-center gap-3 bg-gray-50 p-3 rounded-md">
                    <Avatar 
                      icon={<UserOutlined />} 
                      src={viewingExercise.ptInfo.avatar} 
                      size={40}
                    />
                    <div>
                      <div className="font-medium">
                        {viewingExercise.ptInfo.username || viewingExercise.ptInfo.name || "PT"}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{viewingExercise.description}</p>
                </div>
                
                {viewingExercise.video_rul && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Video</h3>
                    <div className="aspect-video">
                      <iframe
                        src={viewingExercise.video_rul}
                        title={viewingExercise.name}
                        className="w-full h-full rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
                
                {viewingExercise.exerciseposttag && viewingExercise.exerciseposttag.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingExercise.exerciseposttag.map(tag => (
                        <Tag key={tag.tag_id} className="px-3 py-1 text-sm">
                          {tag.tag.tag_name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewingExercise.step && viewingExercise.step.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Steps</h3>
                    <ol className="list-decimal pl-5">
                      {viewingExercise.step
                        .sort((a, b) => a.step_number - b.step_number)
                        .map(step => (
                          <li key={`step-${step.step_number}`} className="mb-2 text-gray-700">
                            {step.instruction}
                          </li>
                        ))}
                    </ol>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="default"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      handleApprove(viewingExercise.exercisepost_id);
                      handleCloseModal();
                    }}
                    className="border border-blue-400 bg-blue-100 text-blue-400"
                  >
                    Approve
                  </Button>
                  <Button
                    type="default"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      handleReject(viewingExercise.exercisepost_id);
                      handleCloseModal();
                    }}
                    className="hover:!bg-red-100"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
        
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
  