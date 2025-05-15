import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PlanService from "../../services/plan.service";
import AuthService from "../../services/auth.service";

// Simple encryption utils
const encryptionKey = 'bodify_secure_key'; // Simple key - can be more complex in production

// Decrypt Plan ID - copy from Chatbox file
const decryptPlanId = (encryptedId) => {
  try {
    // Replace URL-safe chars and decode base64
    const base64 = encryptedId.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    
    // Reverse XOR operation
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedId;
  }
};

const PlanList = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(false);
  const [exercises, setExercises] = useState({});
  const location = useLocation();

  useEffect(() => {
    const fetchPlanDetail = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(location.search);
        let planId = queryParams.get('id');
        const isEncrypted = queryParams.get('e') === '1';

        if (!planId) {
          setError('Plan ID not found');
          return;
        }

        // Check and decrypt ID if necessary
        if (isEncrypted) {
          console.log('Encrypted ID, decrypting:', planId);
          try {
            planId = decryptPlanId(planId);
            console.log('ID after decryption:', planId);
          } catch (decryptError) {
            console.error('Error decrypting ID:', decryptError);
          }
        }

        // If planId is not a number, try to convert
        if (isNaN(Number(planId))) {
          console.warn('planId is not a number after decryption:', planId);
          // Try to extract number from string (e.g. "plan123" -> 123)
          const numberMatch = planId.match(/\d+/);
          if (numberMatch) {
            planId = numberMatch[0];
            console.log('Extracted number from planId:', planId);
          } else {
            setError('Invalid plan ID');
            return;
          }
        }

        const planData = await PlanService.getPlanById(planId);
        if (!planData) {
          setError('Plan information not found');
          return;
        }

        console.log('Plan Data:', planData);

        // Get detailed information of slots
        const slotsData = await PlanService.getPlanSlots(planId);
        console.log('Slots Data:', slotsData);
        
        // Get detailed information of exercises
        const exerciseDetails = {};
        for (const slot of slotsData || []) {
          console.log('Processing slot:', slot);
          // Check all fields that may contain exercise ID
          const exerciseId = slot.exercise_post_id || slot.exercisePostId || 
                           (slot.exercisepost && slot.exercisepost.id) || 
                           (slot.exercise_post && slot.exercise_post.id);
          
          if (exerciseId) {
            try {
              console.log('Fetching exercise details for ID:', exerciseId);
              const exerciseData = await PlanService.getExercisePostById(exerciseId);
              console.log('Exercise Data:', exerciseData);
              if (exerciseData) {
                exerciseDetails[exerciseId] = exerciseData;
              }
            } catch (error) {
              console.error(`Error getting exercise information ${exerciseId}:`, error);
            }
          }
        }
        
        console.log('Exercise Details:', exerciseDetails);
        setExercises(exerciseDetails);
        const planWithSlots = {
          ...planData,
          planSlots: slotsData || []
        };

        setPlan(planWithSlots);
      } catch (error) {
        console.error('Error getting plan information:', error);
        setError('Unable to load plan information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetail();
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Plan information not found</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-5">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            📋 {plan.plan_name}
            </h1>
          <p className="text-lg text-gray-600">{plan.Description}</p>
          </div>

          {/* Info Box */}
          <div className="flex justify-center gap-6 text-center mb-10">
            <div className="bg-white px-4 py-3 rounded-lg shadow text-gray-800">
              <div className="text-sm text-gray-500">🗓 Sessions</div>
            <div className="text-lg font-bold">{plan.planSlots?.length || 0}</div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg shadow text-gray-800">
              <div className="text-sm text-gray-500">⏱ Total Duration</div>
            <div className="text-lg font-bold">{plan.total_duration || 0} minutes</div>
            </div>
          </div>

          {/* Session List */}
          <div className="grid gap-6">
          {plan.planSlots?.map((slot) => {
            console.log('Rendering slot:', slot);
            // Check all fields that may contain exercise ID
            const exerciseId = slot.exercise_post_id || slot.exercisePostId || 
                             (slot.exercisepost && slot.exercisepost.id) || 
                             (slot.exercise_post && slot.exercise_post.id);
            
            // Get exercise information from exercises or directly from slot
            const exercise = exercises[exerciseId] || slot.exercisepost || slot.exercise_post;
            console.log('Exercise for slot:', exercise);

            return (
              <div
                key={slot.no}
                className="bg-white p-5 rounded-xl border-l-4 border-orange-400 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-semibold text-gray-800">
                    🔸 Session {slot.no}: {exercise?.title || exercise?.name || 'No exercise yet'}
                  </h3>
                  <span className="text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    {slot.duration} minutes
                  </span>
                </div>
                <p className="text-gray-600 italic">📝 {slot.note || 'No notes'}</p>
                {exercise && (
                  <div className="mt-2 text-sm text-gray-500">
                    {(exercise.description || exercise.Description) && (
                      <p className="mb-1">{exercise.description || exercise.Description}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>

        {/* Share */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">Are you ready to start this workout plan?</p>
          <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied!");
                  }}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md text-gray-800 transition-all"
                >
                  Copy link
                </button>
            <button
              onClick={async () => {
                try {
                  if (!AuthService.isLoggedIn()) {
                    alert("Please login to start the plan!");
                    return;
                  }

                  setCopying(true);
                  const queryParams = new URLSearchParams(location.search);
                  const planId = queryParams.get('id');

                  // Create new plan data from current plan
                  const planData = {
                    planName: `${plan.plan_name} (Copy)`,
                    description: plan.Description,
                    totalDuration: plan.total_duration,
                    slots: plan.planSlots.map((slot, index) => ({
                      no: (index + 1).toString(),
                      note: slot.note || '',
                      duration: slot.duration || 0,
                      exercisePostId: slot.exercise_post_id || slot.exercisePostId || null
                    }))
                  };

                  // Use createPlanWithSlots to create new plan
                  const newPlan = await PlanService.createPlanWithSlots(planData);
                  
                  if (newPlan?.plan_id) {
                    alert("Plan added to your list!");
                    window.location.href = `/plan?id=${newPlan.plan_id}`;
                  } else {
                    throw new Error("Could not create new plan");
                  }
                } catch (error) {
                  console.error("Error creating plan:", error);
                  alert("An error occurred while adding the plan. Please try again later!");
                } finally {
                  setCopying(false);
                }
              }}
              disabled={copying}
              className={`${
                copying 
                  ? "bg-orange-300 cursor-not-allowed" 
                  : "bg-orange-500 hover:bg-orange-600"
              } px-4 py-2 rounded-md text-white transition-all flex items-center gap-2`}
            >
              {copying ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                "Start now"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanList;
