import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import UserInformation from "./UserInformation";
import Header from "../../layout/Header";
import FullCalendars from "./FullCalendar";
import PlanListTab from "./User/PlanListTab";
import PTManagement from "./GymOwner/PTManagement";
import MembershipManagement from "./GymOwner/MembershipManagement";
import PTMembershipManagement from "./PT/PTMembershipManagement";
import UserMemberships from "./User/UserMemberships";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faClipboardList, faUsers, faDumbbell, faWeightScale, faCreditCard, faHeartPulse, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import HealthInformation from "./User/HealthInformation";

const ProfileSidebar = ({ initialTab }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const isGymOwner = user?.role_id === 4;
  const isPT = user?.role_id === 3;
  
  // Determine default tab from prop or URL
  const getDefaultTab = () => {
    // Check if there's an activeTab parameter in the URL
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('activeTab');
    
    if (tabParam === 'plans') return 'plans';
    if (tabParam === 'pt-management') return 'pt-management';
    if (tabParam === 'membership-management') return 'membership-management';
    if (tabParam === 'memberships') return 'memberships';
    if (initialTab) return initialTab;
    return "home"; // Default tab
  };
  
  // Use state to track user selection
  const [selectedSection, setSelectedSection] = useState(getDefaultTab());
  
  // Update tab when URL changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('activeTab');
    
    if (tabParam === 'plans') {
      setSelectedSection('plans');
    } else if (tabParam === 'pt-management') {
      setSelectedSection('pt-management');
    } else if (tabParam === 'membership-management') {
      setSelectedSection('membership-management');
    } else if (tabParam === 'memberships') {
      setSelectedSection('memberships');
    }
  }, [location.search]);

  // Function to handle changes when a user selects an item
  const handleSelection = (section) => {
    setSelectedSection(section);
  };

  // Function to display content based on selected item
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
      case "memberships":
        return (
          <div className="">
            <UserMemberships />
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
      case "pt-membership-management":
        return (
          <div className="">
            <PTMembershipManagement />
          </div>
        );
      case "health":
        return (
          <div className="">
            <HealthInformation />
          </div>
        );
      default:
        return <div className="p-6">No section selected.</div>;
    }
  };

  return (
    <div>
      <Header />
      <div className="flex h-full container-auto bg-gray-100 ">
        {/* Left module sidebar */}
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
                  alt="Profile Picture"
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
            {!isPT && (
              <li
                onClick={() => handleSelection("memberships")}
                className={`cursor-pointer block p-2 rounded-xl  ${
                  selectedSection === "memberships"
                    ? "bg-primary-500 text-gray-600  "
                    : "bg-gray-400"
                }`}
              >
                <div className="flex items-center font-bold text-white">
                  <FontAwesomeIcon icon={faCreditCard} className="mr-3 ml-2 w-6 h-6" />
                  Membership  
                </div>
              </li>
            )}
            <li
              onClick={() => handleSelection("health")}
              className={`cursor-pointer block p-2 rounded-xl  ${
                selectedSection === "health"
                  ? "bg-primary-500 text-gray-600  "
                  : "bg-gray-400"
              }`}
            >
              <div className="flex items-center font-bold text-white">
                <FontAwesomeIcon icon={faHeartPulse} className="mr-3 ml-2 w-6 h-6" />
                Health Information
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
            
            {user && user.role_id === 3 && (
              <li
                onClick={() => handleSelection("pt-membership-management")}
                className={`cursor-pointer block p-2 rounded-xl ${
                  selectedSection === "pt-membership-management"
                    ? "bg-primary-500 text-gray-600"
                    : "bg-gray-400"
                }`}
              >
                <div className="flex items-center font-bold text-white">
                  <FontAwesomeIcon icon={faDumbbell} className="mr-3 ml-2 w-6 h-6" />
                  Training Packages
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* User information on the right */}
        <div className="flex-1 pt-6 pl-6 pb-6">
          {/* Render content corresponding to the selected section */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
