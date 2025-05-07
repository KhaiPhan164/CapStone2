import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import ExerciseService from "../../services/exercise.service";
import AuthService from "../../services/auth.service";
import Header from "../../layout/Header";
import { SectionTitle } from "../../components/Title/SectionTitle";
import "./styles.css";
import { toast, ToastContainer } from "react-toastify";

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
      setExercises(
        response.data.filter((exercise) => exercise.status_id === 1)
      );
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
      dataIndex: ["user", "fullname"],
      key: "creator",
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
    <div>
      <div className="px-6 pb-6 h-screen bg-gray-50 pt-4">
        <div className="mb-5 mx-5">
          <SectionTitle title="Exercise Approval" />
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
export default ExerciseApproval;
  