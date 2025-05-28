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
import {
  faCalendar,
  faClipboardList,
  faUsers,
  faDumbbell,
  faCreditCard,
  faHeartPulse,
} from "@fortawesome/free-solid-svg-icons";
import HealthInformation from "./User/HealthInformation";

const ProfileSidebar = ({ initialTab }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const isGymOwner = user?.role_id === 4;
  const isPT = user?.role_id === 3;

  const getDefaultTab = () => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get("activeTab");

    if (tabParam === "plans") return "plans";
    if (tabParam === "pt-management") return "pt-management";
    if (tabParam === "membership-management") return "membership-management";
    if (tabParam === "memberships") return "memberships";
    if (initialTab) return initialTab;
    return "home";
  };

  const [selectedSection, setSelectedSection] = useState(getDefaultTab());

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get("activeTab");

    if (tabParam === "plans") {
      setSelectedSection("plans");
    } else if (tabParam === "pt-management") {
      setSelectedSection("pt-management");
    } else if (tabParam === "membership-management") {
      setSelectedSection("membership-management");
    } else if (tabParam === "memberships") {
      setSelectedSection("memberships");
    }
  }, [location.search]);

  const handleSelection = (section) => {
    setSelectedSection(section);
  };

  const renderContent = () => {
    switch (selectedSection) {
      case "home":
        return <UserInformation />;
      case "schedule":
        return <FullCalendars />;
      case "plans":
        return <PlanListTab />;
      case "memberships":
        return <UserMemberships />;
      case "pt-management":
        return <PTManagement />;
      case "membership-management":
        return <MembershipManagement />;
      case "pt-membership-management":
        return <PTMembershipManagement />;
      case "health":
        return <HealthInformation />;
      default:
        return <div className="p-6">No section selected.</div>;
    }
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col md:flex-row h-full container-auto bg-gray-100">
        {/* Left module sidebar */}
        <div className="w-full md:w-1/4 bg-white p-2 md:p-4 rounded-xl my-2 md:my-5 h-auto md:h-screen overflow-x-auto md:overflow-visible">
          <ul className="flex md:flex-col flex-row md:space-y-4 space-x-2 md:space-x-0">
            <li
              onClick={() => handleSelection("home")}
              className={`cursor-pointer block p-2 rounded-xl w-full ${
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
              className={`cursor-pointer block p-2 rounded-xl w-full ${
                selectedSection === "schedule"
                  ? "bg-primary-500 text-gray-600"
                  : "bg-gray-400"
              }`}
            >
              <div className="flex items-center font-bold text-white">
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="mr-3 ml-2 w-6 h-6"
                />
                Schedule
              </div>
            </li>
            <li
              onClick={() => handleSelection("plans")}
              className={`cursor-pointer block p-2 rounded-xl w-full ${
                selectedSection === "plans"
                  ? "bg-primary-500 text-gray-600"
                  : "bg-gray-400"
              }`}
            >
              <div className="flex items-center font-bold text-white">
                <FontAwesomeIcon
                  icon={faClipboardList}
                  className="mr-3 ml-2 w-6 h-6"
                />
                Workout Plan
              </div>
            </li>
            {!isPT && (
              <li
                onClick={() => handleSelection("memberships")}
                className={`cursor-pointer block p-2 rounded-xl w-full ${
                  selectedSection === "memberships"
                    ? "bg-primary-500 text-gray-600"
                    : "bg-gray-400"
                }`}
              >
                <div className="flex items-center font-bold text-white">
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    className="mr-3 ml-2 w-6 h-6"
                  />
                  Membership
                </div>
              </li>
            )}
            <li
              onClick={() => handleSelection("health")}
              className={`cursor-pointer block p-2 rounded-xl w-full ${
                selectedSection === "health"
                  ? "bg-primary-500 text-gray-600"
                  : "bg-gray-400"
              }`}
            >
              <div className="flex items-center font-bold text-white">
                <FontAwesomeIcon
                  icon={faHeartPulse}
                  className="mr-3 ml-2 w-6 h-6"
                />
                Health Information
              </div>
            </li>
            {isGymOwner && (
              <>
                <li
                  onClick={() => handleSelection("pt-management")}
                  className={`cursor-pointer block p-2 rounded-xl w-full ${
                    selectedSection === "pt-management"
                      ? "bg-primary-500 text-gray-600"
                      : "bg-gray-400"
                  }`}
                >
                  <div className="flex items-center font-bold text-white">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="mr-3 ml-2 w-6 h-6"
                    />
                    PT Management
                  </div>
                </li>
                <li
                  onClick={() => handleSelection("membership-management")}
                  className={`cursor-pointer block p-2 rounded-xl w-full ${
                    selectedSection === "membership-management"
                      ? "bg-primary-500 text-gray-600"
                      : "bg-gray-400"
                  }`}
                >
                  <div className="flex items-center font-bold text-white">
                    <FontAwesomeIcon
                      icon={faDumbbell}
                      className="mr-3 ml-2 w-6 h-6"
                    />
                    Membership Management
                  </div>
                </li>
              </>
            )}
            {isPT && (
              <li
                onClick={() => handleSelection("pt-membership-management")}
                className={`cursor-pointer block p-2 rounded-xl w-full ${
                  selectedSection === "pt-membership-management"
                    ? "bg-primary-500 text-gray-600"
                    : "bg-gray-400"
                }`}
              >
                <div className="flex items-center font-bold text-white">
                  <FontAwesomeIcon
                    icon={faDumbbell}
                    className="mr-3 ml-2 w-6 h-6"
                  />
                  Training Packages
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Content area */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;