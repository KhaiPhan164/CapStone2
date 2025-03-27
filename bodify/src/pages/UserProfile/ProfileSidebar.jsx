import { useState } from "react";
import UserInformation from "./UserInformation";
import Header from "../../layout/Header";
import FullCalendars from "./FullCalendar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { UserOutlined, AppstoreOutlined } from "@ant-design/icons";

const ProfileSidebar = () => {
  // Dùng state để theo dõi lựa chọn của người dùng
  const [selectedSection, setSelectedSection] = useState("home"); // 'home' là mặc định
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isGymOwner = user.role_id === 4;
  const isPT = user.role_id === 3;

  // Hàm để xử lý sự thay đổi khi người dùng chọn một mục
  const handleSelection = (section) => {
    setSelectedSection(section);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Hàm hiển thị nội dung tùy theo mục đã chọn
  const renderContent = () => {
    switch (selectedSection) {
      case "home":
        return (
          <div className="">
            <UserInformation />
          </div>
        );
      case "schedule":
        return (
          <div className="">
            <FullCalendars/>
          </div>
        );
      default:
        return <div className="p-6">Chưa chọn mục nào.</div>;
    }
  };

  return (
    <div>
      <Header />
      <div className="flex h-full container-auto bg-gray-100 ">
        {/* Thanh module bên trái */}
        <div className="w-1/4 bg-white p-4 rounded-xl my-5 h-screen">
          <ul className="space-y-4">
            <li
              onClick={() => handleSelection("home")}
              className={`cursor-pointer block p-2 rounded-xl ${
                selectedSection === "home"
                  ? "bg-primary-500 text-gray-600"
                  : "bg-gray-400"
              }`}
            >
              <div className="flex items-center font-bold text-white">
                <img
                  src="./images/user.png" 
                  alt="Ảnh đại diện"
                  className="mr-3 ml-2 w-6 h-6 filter invert" 
                />
                Thông tin cá nhân
              </div>
            </li>
            <li
              onClick={() => handleSelection("schedule")}
              className={`cursor-pointer block p-2 rounded-xl ${
                selectedSection === "schedule"
                  ? "bg-primary-500 text-gray-600"
                  : "bg-gray-400"
              }`}
            >
              <div className="flex items-center font-bold text-white">
                <FontAwesomeIcon icon={faCalendar} className="mr-3 ml-2 w-6 h-6" />
                Schedule
              </div>
            </li>
            {isGymOwner && (
              <li
                onClick={() => handleNavigate('/gymowner/pt-management')}
                className="cursor-pointer block p-2 rounded-xl bg-gray-400 hover:bg-primary-500"
              >
                <div className="flex items-center font-bold text-white">
                  <UserOutlined className="mr-3 ml-2 w-6 h-6" />
                  PT Management
                </div>
              </li>
            )}
            {isPT && (
              <li
                onClick={() => handleNavigate('/pt/exercise-management')}
                className="cursor-pointer block p-2 rounded-xl bg-gray-400 hover:bg-primary-500"
              >
                <div className="flex items-center font-bold text-white">
                  <AppstoreOutlined className="mr-3 ml-2 w-6 h-6" />
                  Exercise Management
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Thông tin người dùng bên phải */}
        <div className="flex-1 p-6">
          {/* Render nội dung tương ứng với mục đã chọn */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
