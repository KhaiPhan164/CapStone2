import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import UserInformation from "./UserInformation";
import Header from "../../layout/Header";
import FullCalendars from "./FullCalendar";
import PlanListTab from "./User/PlanListTab";
import PTManagement from "./GymOwner/PTManagement";
import MembershipManagement from "./GymOwner/MembershipManagement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faClipboardList, faUsers, faDumbbell } from "@fortawesome/free-solid-svg-icons";

const ProfileSidebar = ({ initialTab }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const isGymOwner = user?.role_id === 4;
  
  // Xác định tab mặc định từ prop hoặc URL
  const getDefaultTab = () => {
    // Kiểm tra xem có tham số activeTab trên URL không
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('activeTab');
    
    if (tabParam === 'plans') return 'plans';
    if (tabParam === 'pt-management') return 'pt-management';
    if (tabParam === 'membership-management') return 'membership-management';
    if (initialTab) return initialTab;
    return "home"; // Tab mặc định
  };
  
  // Dùng state để theo dõi lựa chọn của người dùng
  const [selectedSection, setSelectedSection] = useState(getDefaultTab());
  
  // Cập nhật tab khi URL thay đổi
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('activeTab');
    
    if (tabParam === 'plans') {
      setSelectedSection('plans');
    } else if (tabParam === 'pt-management') {
      setSelectedSection('pt-management');
    } else if (tabParam === 'membership-management') {
      setSelectedSection('membership-management');
    }
  }, [location.search]);

  // Hàm để xử lý sự thay đổi khi người dùng chọn một mục
  const handleSelection = (section) => {
    setSelectedSection(section);
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
      case "plans":
        return (
          <div className="">
            <PlanListTab />
          </div>
        );
      case "pt-management":
        return (
          <div className="">
            <PTManagement />
          </div>
        );
      case "membership-management":
        return (
          <div className="">
            <MembershipManagement />
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
                  Personal Information
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
            <li
              onClick={() => handleSelection("plans")}
              className={`cursor-pointer block p-2 rounded-xl  ${
                selectedSection === "plans"
                  ? "bg-primary-500 text-gray-600  "
                  : "bg-gray-400"
              }`}
            >
              <div className="flex items-center font-bold text-white">
                <FontAwesomeIcon icon={faClipboardList} className="mr-3 ml-2 w-6 h-6" />
                Workout Plan  
              </div>
            </li>
            {isGymOwner && (
              <>
                <li
                  onClick={() => handleSelection("pt-management")}
                  className={`cursor-pointer block p-2 rounded-xl ${
                    selectedSection === "pt-management"
                      ? "bg-primary-500 text-gray-600"
                      : "bg-gray-400"
                  }`}
                >
                  <div className="flex items-center font-bold text-white">
                    <FontAwesomeIcon icon={faUsers} className="mr-3 ml-2 w-6 h-6" />
                    PT Management
                  </div>
                </li>
                <li
                  onClick={() => handleSelection("membership-management")}
                  className={`cursor-pointer block p-2 rounded-xl ${
                    selectedSection === "membership-management"
                      ? "bg-primary-500 text-gray-600"
                      : "bg-gray-400"
                  }`}
                >
                  <div className="flex items-center font-bold text-white">
                    <FontAwesomeIcon icon={faDumbbell} className="mr-3 ml-2 w-6 h-6" />
                    Membership Management
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Thông tin người dùng bên phải */}
        <div className="flex-1 pt-6 pl-6 pb-6">
          {/* Render nội dung tương ứng với mục đã chọn */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
