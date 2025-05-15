import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBars, 
  faTimes, 
  faChartLine, 
  faUsers, 
  faDumbbell, 
  faCalendarAlt, 
  faBox, 
  faChartBar, 
  faCog,
  faUserCircle,
  faCheckCircle,
  faIdCard,
  faFileAlt,
  faUserCog,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import Overview from "./PT/Overview";
import MembershipDashboard from "./PT/Membership";
import MembershipTable from "./PT/MembershipTable";
import GuestTable from "./PT/GuestTable";
import Header from "../../layout/Header";
import AuthService from "../../services/auth.service";
import UserInformation from "../../pages/UserProfile/UserInformation";
import MembershipManagement from "../../pages/UserProfile/GymOwner/MembershipManagement";
import PTManagement from "../../pages/UserProfile/GymOwner/PTManagement";
import GymOwnerApprovalPage from "../../pages/Approval/GymOwnerApprovalPage";
import ExerciseApproval from "../../pages/Exercise/ExerciseApproval";
import Chatbox from "../../components/Chatbox/Chatbox";
import ChatService from "../../services/chat.service";

const COLORS = ["#3b82f6", "#06b6d4", "#fbbf24"];

export default function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check access rights
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    
    // If not logged in or not a Gym Owner (role_id = 4)
    if (!user || user.role_id !== 4) {
      // Redirect to home page if no permission
      navigate("/");
    }
  }, [navigate]);

  // Connect and display chat when component mounts
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user && user.id) {
      // Connect chat socket
      ChatService.connect(user.id);
      
      // Ensure chat bubble is displayed
      setTimeout(() => {
        const chatboxContainer = document.querySelector('.chatbox-container');
        if (chatboxContainer) {
          chatboxContainer.style.display = 'block';
          chatboxContainer.style.zIndex = '9999';
        }
      }, 500);
    }

    return () => {
      // Disconnect socket when component unmounts
      ChatService.disconnect();
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = "/";
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "overview":
        return (
          <div>
            <Overview />
          </div>
        );
      case "customers":
        return (
          <div className="p-6">
            <GuestTable />
          </div>
        );
      case "membership":
        return (
          <div>
            <MembershipDashboard />
            <MembershipTable />
          </div>
        );
      case "userinfo":
        return (
          <div className="p-6">
            <UserInformation />
          </div>
        );
      case "memberships-management":
        return (
          <div className="p-6">
            <MembershipManagement />
          </div>
        );
      case "pt-management":
        return (
          <div className="p-6">
            <PTManagement />
          </div>
        );
      case "pt-approval":
        return (
          <div className="p-6">
            <GymOwnerApprovalPage />
          </div>
        );
      case "exercise-approval":
        return (
          <div className="p-6">
            <ExerciseApproval />
          </div>
        );
      case "workouts":
        return <div className="p-6">🏋️‍♂️ Workout List</div>;
      case "schedules":
        return <div className="p-6">📆 Training Schedule</div>;
      case "packages":
        return <div className="p-6">📦 Membership Packages</div>;
      case "analytics":
        return <div className="p-6">📊 Analytics</div>;
      case "settings":
        return <div className="p-6">⚙️ Settings</div>;
      default:
        return <div className="p-6">Please select an item from the menu.</div>;
    }
  };

  // Define menu items
  const menuItems = [
    { label: "Overview", key: "overview", icon: faChartLine },
    { label: "User Info", key: "userinfo", icon: faUserCircle },
    { divider: true, label: "Gym Management" },
    { label: "Customers", key: "customers", icon: faUsers },
    { label: "PT Management", key: "pt-management", icon: faUserCog },
    { label: "Membership", key: "membership", icon: faDumbbell },
    { label: "Membership Management", key: "memberships-management", icon: faIdCard },
    { divider: true, label: "Approvals" },
    { label: "PT Approval", key: "pt-approval", icon: faCheckCircle },
    { label: "Exercise Approval", key: "exercise-approval", icon: faFileAlt },
    // { label: "Workouts", key: "workouts", icon: faDumbbell },
    // { label: "Schedules", key: "schedules", icon: faCalendarAlt },
    // { label: "Packages", key: "packages", icon: faBox },
    // { label: "Analytics", key: "analytics", icon: faChartBar },
    // { label: "Settings", key: "settings", icon: faCog },
  ];

  return (
    <div className="relative">
      {/* Main container with dynamic padding based on sidebar state */}
      <div className="min-h-screen bg-gray-100">
        {/* Content - Dynamic position based on sidebar state */}
        <div className={`transition-all duration-300 pt-4 pr-4 ${
          isSidebarCollapsed ? "pl-20 md:pl-24" : "pl-80"
        }`}>
          {renderContent()}
        </div>
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar fixed to left */}
      <div 
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white z-30 transition-all duration-300 shadow-xl ${
          isSidebarCollapsed ? "w-18" : "w-72"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold">Gym Dashboard</h1>
          )}
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-700">
            <FontAwesomeIcon 
              icon={isSidebarCollapsed ? faBars : faTimes} 
              className="text-xl"
            />
          </button>
        </div>
        
        <div className="p-4">
          {!isSidebarCollapsed && (
            <div className="mb-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserCircle} className="text-4xl" />
              </div>
              <h2 className="mt-2 font-semibold">{currentUser?.name || "Gym Owner"}</h2>
              <p className="text-sm text-gray-400">Gym Administrator</p>
            </div>
          )}
          
          <div className="space-y-1">
            {menuItems.map((item, index) => {
              if (item.divider) {
                return (
                  <div key={`divider-${index}`} className="pt-2 pb-1 px-3">
                    <div className="border-t border-gray-700 pt-2">
                      {!isSidebarCollapsed && (
                        <span className="text-xs uppercase tracking-wider text-gray-500">
                          {item.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
              
              return (
                <button
                  key={item.key}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    selectedMenu === item.key
                      ? "bg-primary-500 text-white"
                      : "hover:bg-gray-700"
                  } ${isSidebarCollapsed ? "justify-center" : ""}`}
                  onClick={() => setSelectedMenu(item.key)}
                >
                  <FontAwesomeIcon icon={item.icon} className={isSidebarCollapsed ? "text-xl" : ""} />
                  {!isSidebarCollapsed && (
                    <span className="ml-3 text-sm overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              );
            })}
            
            <div className="pt-4">
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-3 py-2 rounded-md text-red-400 hover:bg-gray-700 ${
                  isSidebarCollapsed ? "justify-center" : ""
                }`}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className={isSidebarCollapsed ? "text-xl" : ""} />
                {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
              </button>
            </div>
          </div>
        </div>
        
        {/* Toggle Button when sidebar is collapsed */}
        {isSidebarCollapsed && (
          <button
            className="absolute top-1/2 -right-3 w-6 h-12 bg-gray-800 rounded-r-md flex items-center justify-center"
            onClick={toggleSidebar}
          >
            <FontAwesomeIcon 
              icon={isSidebarCollapsed ? faBars : faTimes} 
              className="text-sm"
            />
          </button>
        )}
      </div>

      {/* Add Chatbox component */}
      <div className="fixed bottom-4 right-4 z-50">
        <Chatbox />
      </div>

      {/* Add global styles to ensure chatbox is always visible */}
      <style jsx>{`
        .chatbox-container {
          display: block !important;
          z-index: 9999 !important;
        }
      `}</style>
    </div>
  );
}
