import React, { useState } from 'react';
import PTProfile from './PTProfile';
import PersonalTrainerSchedule from './PersonalTrainerSchedule';
import ClassManagement from './ClassManagement';

const PersonalTrainer = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <PTProfile />;
      case 'schedule':
        return <PersonalTrainerSchedule />;
      case 'ExerciseManagement':
        return <ExerciseManagement/>;
      case 'statistics':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Thống kê</h2>
            <p className="mb-4">Xem tổng quan hiệu suất và tiến độ.</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Báo cáo hiệu suất học viên</h3>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Tiến độ tập luyện</li>
                  <li>Kết quả đạt được</li>
                  <li>Đánh giá từ học viên</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Tỷ lệ hoàn thành bài tập</h3>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Buổi tập đã hoàn thành</li>
                  <li>Buổi tập bị hủy</li>
                  <li>Buổi tập đang chờ</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Số liệu lớp học</h3>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Số học viên tham gia</li>
                  <li>Tỷ lệ điểm danh</li>
                  <li>Đánh giá lớp học</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return <PTProfile />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen bg-gray-100 p-4">
      <div className="w-full md:w-1/4 lg:w-1/5 p-4 bg-white shadow-lg rounded-lg mb-4 md:mb-0">
        <h2 className="text-xl font-bold mb-4 text-center">Menu PT</h2>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${
            activeTab === 'profile' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'
          } transition-all`}
          onClick={() => setActiveTab('profile')}
        >
          Thông tin cá nhân
        </button>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${
            activeTab === 'schedule' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'
          } transition-all`}
          onClick={() => setActiveTab('schedule')}
        >
          Lịch dạy
        </button>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${
            activeTab === 'classManagement' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'
          } transition-all`}
          onClick={() => setActiveTab('ExerciseManagement')}
        >
          Quản lý bài tập
        </button>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${
            activeTab === 'statistics' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'
          } transition-all`}
          onClick={() => setActiveTab('statistics')}
        >
          Thống kê
        </button>
      </div>

      <div className="w-full md:w-3/4 lg:w-4/5 p-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-semibold text-center mb-4">Bảng điều khiển PT</h1>
        <div className="pt-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PersonalTrainer; 