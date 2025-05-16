import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faClock,
  faSpinner,
  faEllipsisVertical,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { SectionTitle } from "../../../components/Title/SectionTitle";
import PlanService from "../../../services/plan.service";
import AuthService from "../../../services/auth.service";
import ChatService from "../../../services/chat.service";

const PlanListTab = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");
  const [showOptionsPopup, setShowOptionsPopup] = useState(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const autoOpenProcessed = useRef(false);
  const autoOpenTimer = useRef(null);

  const fetchPlans = async (checkAutoOpen = true) => {
    try {
      if (redirecting) return; // Do nothing if redirecting

      setLoading(true);
      setError(null);

      // Check if user is logged in
      if (!AuthService.isLoggedIn()) {
        setError("Please login to view your plan list");
        setLoading(false);
        return;
      }

      console.log("Loading plan list...");

      // Get plans list from API
      const plansData = await PlanService.getUserPlans();

      if (Array.isArray(plansData)) {
        // Ensure each plan has a numeric ID
        const formattedPlans = plansData.map((plan) => ({
          ...plan,
          plan_id: plan.plan_id
            ? Number(plan.plan_id)
            : plan.id
            ? Number(plan.id)
            : null,
          // Ensure other fields
          plan_name: plan.plan_name || plan.name || "Unnamed Plan",
          Description: plan.Description || plan.description || "",
          total_duration: Number(plan.total_duration) || 0,
        }));

        console.log(`Loaded ${formattedPlans.length} plans`);
        setPlans(formattedPlans);

        // Check if there's an autoOpen parameter and it hasn't been processed
        if (checkAutoOpen && !autoOpenProcessed.current) {
          const queryParams = new URLSearchParams(location.search);
          const autoOpenPlanId = queryParams.get("autoOpen");

          // If there's a valid autoOpen parameter, automatically open the corresponding plan
          if (autoOpenPlanId && !isNaN(Number(autoOpenPlanId))) {
            // Clear old timer if it exists
            if (autoOpenTimer.current) {
              clearTimeout(autoOpenTimer.current);
            }

            const planToOpen = formattedPlans.find(
              (p) =>
                p.plan_id === Number(autoOpenPlanId) ||
                p.id === Number(autoOpenPlanId)
            );

            if (planToOpen) {
              // Mark as processed to avoid repetition
              autoOpenProcessed.current = true;

              // Display redirect message
              setRedirecting(true);
              setRedirectMessage(
                `Opening plan: ${planToOpen.plan_name || planToOpen.name}`
              );

              console.log(`Preparing to open plan ID: ${autoOpenPlanId}`);

              // Use window.location.href instead of navigate to ensure the page is fully reloaded
              autoOpenTimer.current = setTimeout(() => {
                console.log(`Redirecting to /plan?id=${autoOpenPlanId}`);
                window.location.href = `/plan?id=${autoOpenPlanId}`;
              }, 1500);

              return; // Exit early to avoid setting loading = false
            } else {
              console.log(`Plan with ID: ${autoOpenPlanId} not found`);
            }
          }
        }
      } else {
        console.log("No plans found");
        setPlans([]);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      setError("Unable to load plan list. Please try again later.");
    } finally {
      if (!redirecting) {
        setLoading(false);
      }
    }
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (autoOpenTimer.current) {
        clearTimeout(autoOpenTimer.current);
      }
    };
  }, []);

  // Reset autoOpenProcessed flag when location.search changes
  useEffect(() => {
    // Reset flag to allow processing again if URL changes
    autoOpenProcessed.current = false;

    // Clear old timer if it exists
    if (autoOpenTimer.current) {
      clearTimeout(autoOpenTimer.current);
      autoOpenTimer.current = null;
    }

    // Reset redirect state
    setRedirecting(false);
    setRedirectMessage("");
  }, [location.search]);

  // Fetch plans when component loads or when location.search changes
  useEffect(() => {
    fetchPlans();
  }, [location.search]);

  // Add useEffect to connect socket when component mounts
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser?.id) {
      ChatService.connect(currentUser.id);
    }
    return () => {
      ChatService.disconnect();
    };
  }, []);

  // Add share handling function
  const handleShare = async (plan) => {
    setSelectedPlan(plan);
    setShowOptionsPopup(null);
    setShowSharePopup(true);
    setLoadingUsers(true);

    try {
      const currentUser = AuthService.getCurrentUser();
      console.log("Current user:", currentUser);

      if (currentUser?.id) {
        console.log("Fetching chat users for user ID:", currentUser.id);
        const response = await ChatService.getAllChatUsers(currentUser.id);
        console.log("Received chat users:", response);
        // Get users array from response.data
        const users = response?.data || [];
        setChatUsers(users);
      } else {
        console.log("No user ID found in currentUser:", currentUser);
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Modify handleShareWithUser to add retry logic
  const handleShareWithUser = async (user) => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser?.id) {
        // Ensure socket is connected
        ChatService.connect(currentUser.id);

        // Wait a bit for socket to connect
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const shareUrl = `${window.location.host}/plan-detail?id=${selectedPlan.plan_id}`;
        const message = `Shared workout plan: ${selectedPlan.plan_name}\n[Click here to view](${shareUrl})`;

        // Try sending message up to 3 times
        let attempts = 0;
        while (attempts < 3) {
          try {
            // Use user.user_id instead of user.id
            await ChatService.sendMessage(user.user_id, message);
            setShowSharePopup(false);
            return;
          } catch (error) {
            attempts++;
            if (attempts === 3) throw error;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Display redirect message
  if (redirecting) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="text-primary-500 text-4xl mb-4"
        />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {redirectMessage}
        </p>
        <p className="text-sm text-gray-500">Please wait a moment...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        <p>{error}</p>
        <button
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={() => fetchPlans()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle title="Workout Plan List" />
        <Link
          to="/plan"
          className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-primary-500 transition flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create a new plan
        </Link>
      </div>

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.plan_id || plan.id}
              className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {/* Options button */}
              <button
                className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptionsPopup(plan.plan_id);
                }}
              >
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>

              {/* Options popup */}
              {showOptionsPopup === plan.plan_id && (
                <div className="absolute top-10 right-2 bg-white rounded-lg shadow-lg z-10 py-2">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                    onClick={() => handleShare(plan)}
                  >
                    <FontAwesomeIcon icon={faShare} className="mr-2" />
                    Share
                  </button>
                </div>
              )}

              <Link
                to={`/plan?id=${plan.plan_id || plan.id}`}
                className="block p-4"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/plan?id=${plan.plan_id || plan.id}`;
                }}
              >
                <h3 className="text-lg font-semibold mb-2">
                  {plan.plan_name || plan.name}
                </h3>
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                  {plan.Description || plan.description || "No description"}
                </p>
                <div className="flex items-center text-gray-500 text-sm">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  <span>{plan.total_duration || 0} minutes</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-4 italic">
            You don't have any workout plan yet.
          </p>
          <Link
            to="/plan"
            className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-primary-500 transition inline-flex items-center"
            onClick={(e) => {
              // Use window.location.href to ensure the page is fully reloaded
              e.preventDefault();
              window.location.href = "/plan";
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create first plan
          </Link>
        </div>
      )}

      {/* Share popup */}
      {showSharePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Plan</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowSharePopup(false)}
              >
                ✕
              </button>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : chatUsers.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {chatUsers.map((user) => (
                  <button
                    key={user.user_id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                    onClick={() => handleShareWithUser(user)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full flex items-center justify-center bg-blue-500 text-white">
                          {user.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <span>{user.name || user.username || "User"}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                You don't have any conversations yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanListTab;
