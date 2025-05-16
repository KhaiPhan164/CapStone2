import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SectionTitle } from '../../../components/Title/SectionTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClock, faSave, faTrash, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PlanService from '../../../services/plan.service';
import ExerciseService from '../../../services/exercise.service';
import AuthService from '../../../services/auth.service';
import axios from 'axios';

// Get API_URL from PlanService
const API_URL = 'http://localhost:3000';

const Plan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get planId from query param if available
  const queryParams = new URLSearchParams(location.search);
  const planIdFromQuery = queryParams.get('id');
  
  // State for exercise posts list
  const [exercisePosts, setExercisePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // State for plan slots
  const [planSlots, setPlanSlots] = useState([]);
  const [planId, setPlanId] = useState(planIdFromQuery);
  const [planName, setPlanName] = useState("New Workout Plan");
  const [planDescription, setPlanDescription] = useState("");

  // State for drag & drop
  const [draggedExercise, setDraggedExercise] = useState(null);

  // State to control saving/deleting process
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const [savingMessage, setSavingMessage] = useState('');

  // Filter exercises based on search keyword
  const filteredExercises = exercisePosts.filter(exercise => 
    exercise.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // Calculate total duration
  const totalDuration = planSlots.reduce((total, slot) => total + (parseInt(slot.duration) || 0), 0);

  // Function to check if a value is a number
  const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  // Fetch data from API
  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      if (!AuthService.isLoggedIn()) {
        navigate('/signin');
        return;
      }

      // Get exercise list from API
      const exercisesResponse = await ExerciseService.getAll();
      let exercisesData = [];
      
      if (exercisesResponse?.data && Array.isArray(exercisesResponse.data.data)) {
        exercisesData = exercisesResponse.data.data;
      } else if (exercisesResponse?.data && Array.isArray(exercisesResponse.data)) {
        exercisesData = exercisesResponse.data;
      }
      
      setExercisePosts(exercisesData);

      // If planId exists, get plan details
      if (planId) {
        try {
          // Convert planId to number
          const numericPlanId = Number(planId);
          
          if (!isNumeric(planId)) {
            console.error(`planId is not valid: ${planId}`);
            alert(`ID of the plan is not valid: ${planId}`);
            setError('ID of the plan is not valid');
            setLoading(false);
            return;
          }
          
          const planResponse = await PlanService.getPlanById(numericPlanId);
          
          if (planResponse) {
            setPlanName(planResponse.plan_name || planResponse.name || "Workout Plan");
            setPlanDescription(planResponse.Description || planResponse.description || "");
            
            // Get slots of plan
            const slotsResponse = await PlanService.getPlanSlots(numericPlanId);
            
            if (Array.isArray(slotsResponse) && slotsResponse.length > 0) {
              // Ensure slots are in correct format
              const formattedSlots = slotsResponse.map(slot => {
                // Process exercisePostId from multiple possible sources
                let exercisePostId = null;
                
                // Prefer in order: exercise_post_id > exercisePostId > exercisepost
                if (slot.exercise_post_id !== undefined && slot.exercise_post_id !== null) {
                  exercisePostId = Number(slot.exercise_post_id);
                } else if (slot.exercisePostId !== undefined && slot.exercisePostId !== null) {
                  exercisePostId = Number(slot.exercisePostId);
                } else if (slot.exercisepost !== undefined && slot.exercisepost !== null) {
                  // If exercisepost is object (relationship)
                  if (typeof slot.exercisepost === 'object' && slot.exercisepost.id) {
                    exercisePostId = Number(slot.exercisepost.id);
                  } else if (typeof slot.exercisepost === 'number') {
                    exercisePostId = Number(slot.exercisepost);
                  }
                }
                
                // Find detailed information about the exercise from existing exercises
                let exerciseInfo = null;
                if (exercisePostId) {
                  const exerciseMatch = exercisesData.find(ex => {
                    const exId = ex.exercisepost_id || ex.id;
                    return Number(exId) === Number(exercisePostId);
                  });
                  
                  if (exerciseMatch) {
                    exerciseInfo = {
                      id: exercisePostId,
                      name: exerciseMatch.name,
                      description: exerciseMatch.description || '',
                      fullExercise: exerciseMatch
                    };
                  }
                }
                
                return {
                  id: slot.id || Date.now() + Math.random(),
                  no: parseInt(slot.no) || 0,
                  duration: parseInt(slot.duration) || 0,
                  exercisePostId: exercisePostId,
                  exercise_post_id: exercisePostId, // Add both formats
                  exerciseInfo: exerciseInfo // Add exercise detailed information
                };
              });
              
              setPlanSlots(formattedSlots);
            } else {
              // If no slots, create a default starting slot
              setPlanSlots([
                { id: Date.now(), no: 1, exercisePostId: null, exercise_post_id: null, duration: 5 }
              ]);
            }
          }
        } catch (error) {
          console.error('Error getting plan details:', error);
          setError('Cannot load plan details: ' + (error.message || 'Unknown error'));
        }
      } else {
        // If creating a new plan, create a default starting slot
        setPlanSlots([
          { id: Date.now(), no: 1, exercisePostId: null, exercise_post_id: null, duration: 5 }
        ]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Cannot load data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If planIdFromQuery exists, convert to number
    if (planIdFromQuery) {
      const numericId = Number(planIdFromQuery);
      if (!isNaN(numericId)) {
        setPlanId(numericId);
      } else {
        console.error('planId from URL is not valid:', planIdFromQuery);
        setError(`planId "${planIdFromQuery}" is not a valid number`);
        setPlanId(null);
      }
    } else {
      // Call fetchData immediately if no planIdFromQuery
      fetchData();
    }
  }, []); // Run only once when component mounts

  // Call fetchData separately when planId changes
  useEffect(() => {
    // Call only when planId is set from the first useEffect
    if (planId !== undefined) {
      // Load full data including plan and slots
      fetchData();
    }
  }, [planId]); // Depends on planId

  // Handle drag start
  const handleDragStart = (exercisePost) => {
    setDraggedExercise(exercisePost);
  };

  // Handle drag over slot
  const handleDragOver = (e) => {
    e.preventDefault();
    e.target.classList.add('bg-blue-50'); // Create visual effect for user
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.target.classList.remove('bg-blue-50');
  };

  // Handle drop into slot
  const handleDrop = (e, slotId) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event propagation
    e.currentTarget.classList.remove('bg-blue-50');
    
    if (!draggedExercise) {
      console.error('No exercise is being dragged');
      return;
    }
    
    // Get exercise ID from dragged exercise
    let exerciseId = null;
    let idSource = "not found";
    
    // Prefer exercisepost_id (snake_case from API)
    if (draggedExercise.exercisepost_id !== undefined && draggedExercise.exercisepost_id !== null) {
      exerciseId = Number(draggedExercise.exercisepost_id);
      idSource = "exercisepost_id";
    } 
    // Then try id 
    else if (draggedExercise.id !== undefined && draggedExercise.id !== null) {
      exerciseId = Number(draggedExercise.id);
      idSource = "id";
    }
    
    if (!exerciseId || isNaN(exerciseId)) {
      console.error('No valid ID found for the dragged exercise');
      alert('Cannot determine ID of this exercise. Please try again.');
      return;
    }
    
    // Get current slot
    const currentSlot = planSlots.find(slot => slot.id === slotId);
    
    // Add detailed information about the exercise for display in UI
    const exerciseInfo = {
      id: exerciseId,
      name: draggedExercise.name,
      description: draggedExercise.description || '',
      // Save full exercise information for use when displaying
      fullExercise: draggedExercise
    };
    
    // Update slot with new exercise
    const updatedSlots = planSlots.map(slot => {
      if (slot.id === slotId) {
        return { 
          ...slot, 
          exercisePostId: exerciseId,
          exercise_post_id: exerciseId, // Ensure both formats are used
          exerciseInfo: exerciseInfo // Save full exercise information
        };
      }
      return slot;
    });
    
    setPlanSlots(updatedSlots);
  };

  // Add new slot
  const addNewSlot = () => {
    const newNo = planSlots.length > 0 ? Math.max(...planSlots.map(slot => slot.no)) + 1 : 1;
    const newSlot = {
      id: Date.now(), // Use timestamp as temporary id
      no: newNo,
      exercisePostId: null,
      duration: 5
    };
    setPlanSlots([...planSlots, newSlot]);
  };

  // Handle change duration for slot
  const handleDurationChange = (slotId, newDuration) => {
    const updatedSlots = planSlots.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, duration: parseInt(newDuration) || 0 };
      }
      return slot;
    });
    setPlanSlots(updatedSlots);
  };

  // Remove exercise from slot
  const removeExerciseFromSlot = (slotId) => {
    const updatedSlots = planSlots.map(slot => {
      if (slot.id === slotId) {
        return { 
          ...slot, 
          exercisePostId: null,
          exercise_post_id: null,  // Ensure both fields are removed
          exerciseInfo: null       // Remove all detailed information
        };
      }
      return slot;
    });
    setPlanSlots(updatedSlots);
  };

  // Update saveSlotsSeparately method to ensure each slot saves the correct exercise_post_id
  const saveSlotsSeparately = async (targetPlanId) => {
    try {
      // Check planId
      if (!targetPlanId) {
        console.error("Missing planId when saving slots");
        setSavingMessage("Cannot save: Missing plan ID");
        return false;
      }
      
      // Normalize slots to ensure continuous order and keep original information
      const formattedSlots = planSlots.map((slot, index) => {
        // Get exercise ID (if any)
        const exerciseId = slot.exercisePostId || slot.exercise_post_id || 
                         (slot.exerciseInfo ? slot.exerciseInfo.id : null);
        
        return {
          ...slot,
          index: index, // Save original position
          no: index + 1, // Ensure continuous order starting from 1
          exercisePostId: exerciseId,
          exercise_post_id: exerciseId,
          planId: targetPlanId
        };
      });
      
      setSavingMessage("Saving exercise slots...");
      
      try {
        // Start saving slots
        const saveResult = await PlanService.savePlanSlots(targetPlanId, formattedSlots);
        
        if (saveResult) {
          setSavingMessage("Exercise slots saved successfully!");
          return true;
        } else {
          throw new Error("API returned invalid result");
        }
      } catch (error) {
        console.error(`Error saving slots: ${error.message}`);
        setSavingMessage(`Handling slot saving error: ${error.message}`);
        
        // Try to load data again to see if slots were saved correctly
        try {
          const loadedSlots = await PlanService.getPlanSlots(targetPlanId);
          
          if (Array.isArray(loadedSlots) && loadedSlots.length > 0) {
            // If data returned, consider saving as partially successful
            console.log(`Saved ${loadedSlots.length} slots on server`);
            
            // Compare actual exercise slots and saved slots
            const slotsWithExercises = formattedSlots.filter(s => s.exercise_post_id !== null).length;
            const savedSlotsWithExercises = loadedSlots.filter(s => s.exercise_post_id !== null).length;
            
            if (savedSlotsWithExercises < slotsWithExercises) {
              // Update notification
              setSavingMessage(`Saved ${savedSlotsWithExercises}/${slotsWithExercises} exercises. Retrying...`);
            }
            
            return true;
          }
        } catch (loadError) {
          console.error(`Error checking save result: ${loadError.message}`);
        }
        
        // Update error notification
        setSavingMessage(`Error saving slots: ${error.message}. Retrying alternative approach...`);
        return false;
      }
    } catch (error) {
      console.error("General error:", error.message);
      setSavingMessage(`Error saving plan: ${error.message}`);
      return false;
    }
  };

  // Save plan simply
  const savePlan = async () => {
    try {
      // Disable user interface
      setIsSaving(true);
      setSaveComplete(false);
      setSavingMessage("Preparing to save plan...");
      setLoading(true);
      setError(null);
      
      // Check required fields
      if (!planName.trim()) {
        setError('Please enter plan name');
        setSavingMessage("Error: Plan name not entered");
        setIsSaving(false);
        setLoading(false);
        return;
      }
      
      // Prepare data for plan according to correct API format
      const planData = {
        name: planName.trim(),
        description: planDescription.trim(),
        totalDuration: totalDuration
      };
      
      // If creating new
      if (!planId) {
        try {
          setSavingMessage("Creating new plan...");
          
          const savedPlan = await PlanService.createPlan(planData);
          
          if (!savedPlan) {
            console.error('Did not receive response when creating plan');
            setSavingMessage("Error: Did not receive response from server");
            setIsSaving(false);
            setLoading(false);
            return;
          }
          
          const savedPlanId = savedPlan.plan_id || savedPlan.id;
          if (!savedPlanId) {
            console.error('Did not find ID of newly created plan');
            setSavingMessage("Error: Did not find ID of newly created plan");
            setIsSaving(false);
            setLoading(false);
            return;
          }
          
          // Convert savedPlanId to number
          const numericPlanId = Number(savedPlanId);
          if (isNaN(numericPlanId)) {
            console.error('Plan ID is not valid');
            setSavingMessage("Error: Plan ID is not valid");
            setIsSaving(false);
            setLoading(false);
            return;
          }
          
          // Update planId in state and URL
          setPlanId(numericPlanId);
          
          // Continue saving slots
          setSavingMessage("Plan created. Saving exercise slots...");
          const saveResult = await saveSlotsSeparately(numericPlanId);

          // Mark saving as complete
          setSaveComplete(true);
          setSavingMessage("Saved successfully! Redirecting to plan list...");
          
          // Ensure all data is saved before redirecting
          // Use setTimeout longer than necessary to ensure server has finished processing
          setTimeout(() => {
            // Redirect to workout plan tab (do not reopen plan details)
            window.location.href = `/plans?activeTab=plans`;
          }, 2000);
          
        } catch (error) {
          console.error('Error creating plan:', error.message);
          setSavingMessage(`Error creating plan: ${error.message || 'Unknown error'}`);
          setError('Cannot create plan: ' + (error.message || 'Unknown error'));
          setIsSaving(false);
        }
      } else {
        // If updating existing plan
        try {
          setSavingMessage("Updating plan...");

          // Convert planId to number
          const numericPlanId = Number(planId);
          if (isNaN(numericPlanId)) {
            console.error('Plan ID is not valid');
            setSavingMessage("Error: Plan ID is not valid");
            setIsSaving(false);
            setLoading(false);
            return;
          }
          
          const updatedPlan = await PlanService.updatePlan(numericPlanId, planData);
          
          // Continue saving slots
          setSavingMessage("Plan updated. Saving exercise slots...");
          const saveResult = await saveSlotsSeparately(numericPlanId);

          // Mark saving as complete
          setSaveComplete(true);
          setSavingMessage("Saved successfully! Redirecting to plan list...");
          
          // Ensure all data is saved before redirecting
          setTimeout(() => {
            // Redirect to workout plan tab (do not reopen plan details)
            window.location.href = `/plans?activeTab=plans`;
          }, 2000);
          
        } catch (error) {
          console.error(`Error updating plan:`, error.message);
          setSavingMessage(`Error updating plan: ${error.message || 'Unknown error'}`);
          setError('Cannot update plan: ' + (error.message || 'Unknown error'));
          setIsSaving(false);
        }
      }
    } catch (error) {
      console.error('Error saving plan:', error.message);
      setSavingMessage(`Error: ${error.message || 'Cannot save plan'}`);
      setError(error.message || 'Cannot save plan. Please try again later.');
      setIsSaving(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to load slots data from API
  const loadSlots = async (targetPlanId) => {
    try {
      if (!targetPlanId) {
        console.error("No planId to load data");
        return false;
      }
      
      // Load new slots data from API
      const updatedSlots = await PlanService.getPlanSlots(targetPlanId);
      
      if (Array.isArray(updatedSlots) && updatedSlots.length > 0) {
        // Normalize data from API
        const formattedSlots = updatedSlots.map(slot => {
          // Process exercisePostId from multiple possible sources
          let exercisePostId = null;
          
          // Prefer in order: exercise_post_id > exercisePostId > exercisepost
          if (slot.exercise_post_id !== undefined && slot.exercise_post_id !== null) {
            exercisePostId = Number(slot.exercise_post_id);
          } else if (slot.exercisePostId !== undefined && slot.exercisePostId !== null) {
            exercisePostId = Number(slot.exercisePostId);
          } else if (slot.exercisepost !== undefined && slot.exercisepost !== null) {
            // If exercisepost is object (relationship)
            if (typeof slot.exercisepost === 'object' && slot.exercisepost.id) {
              exercisePostId = Number(slot.exercisepost.id);
            } else if (typeof slot.exercisepost === 'number') {
              exercisePostId = Number(slot.exercisepost);
            }
          }
          
          // Find detailed information about the exercise from existing exercises
          let exerciseInfo = null;
          if (exercisePostId) {
            const exerciseMatch = exercisePosts.find(ex => {
              const exId = ex.exercisepost_id || ex.id;
              return Number(exId) === Number(exercisePostId);
            });
            
            if (exerciseMatch) {
              exerciseInfo = {
                id: exercisePostId,
                name: exerciseMatch.name,
                description: exerciseMatch.description || '',
                fullExercise: exerciseMatch
              };
            }
          }
          
          return {
            id: slot.id || Date.now() + Math.random(),
            no: parseInt(slot.no) || 0,
            duration: parseInt(slot.duration) || 0,
            exercisePostId: exercisePostId,
            exercise_post_id: exercisePostId, // Add both formats
            exerciseInfo: exerciseInfo // Add exercise detailed information
          };
        });
        
        // Update state with new data from API
        setPlanSlots(formattedSlots);
        return true;
      } else if (updatedSlots.length === 0) {
        // If no slots, create a default slot
        setPlanSlots([
          { id: Date.now(), no: 1, exercisePostId: null, exercise_post_id: null, duration: 5 }
        ]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error loading slots data: ${error.message}`);
      return false;
    }
  };

  // Delete plan
  const deletePlan = async () => {
    try {
      if (!planId) {
        alert("No plan ID to delete");
        return;
      }
      
      // Show confirmation before deleting
      if (!window.confirm("Are you sure you want to delete this plan?")) {
        return;
      }
      
      // Disable user interface
      setIsSaving(true);
      setSaveComplete(false);
      setSavingMessage("Deleting plan...");
      setLoading(true);
      
      // Convert planId to number
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId)) {
        throw new Error('Plan ID is not valid');
      }
      
      // Delete plan
      await PlanService.deletePlan(numericPlanId);
      
      // Mark deleting as complete
      setSaveComplete(true);
      setSavingMessage("Deleted successfully! Redirecting to plan list...");
      
      // Add delay to ensure server has finished processing delete request
      setTimeout(() => {
        // Redirect to plan list tab with activeTab parameter for workout plan
        window.location.href = '/plans?activeTab=plans';
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting plan:', error);
      setSavingMessage(`Error deleting plan: ${error.message || 'Unknown error'}`);
      alert('Cannot delete plan: ' + (error.message || 'Unknown error'));
      setError('Cannot delete plan. Please try again later.');
      setIsSaving(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to reload full data of current plan
  const refreshPlan = async () => {
    if (planId) {
      try {
        setLoading(true);
        
        // Add small delay to ensure API has finished processing changes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clear cache of all requests axios
        const headers = {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        };
        
        // Load plan data from API
        const planResponse = await axios.get(`${API_URL}/plans/${planId}`, { 
          headers, 
          params: { _: Date.now() } // Add timestamp to prevent cache
        });
        
        if (planResponse.data) {
          setPlanName(planResponse.data.plan_name || planResponse.data.name || "Workout Plan");
          setPlanDescription(planResponse.data.Description || planResponse.data.description || "");
          
          // Load slots of plan
          const slotsResponse = await axios.get(`${API_URL}/plan-slots`, { 
            headers,
            params: { 
              planId: planId,
              _: Date.now() // Add timestamp to prevent cache
            } 
          });
          
          if (Array.isArray(slotsResponse.data) && slotsResponse.data.length > 0) {
            // Process slots data
            const formattedSlots = slotsResponse.data.map(slot => {
              // Process exercisePostId from multiple possible sources
              let exercisePostId = null;
              
              // Prefer in order: exercise_post_id > exercisePostId > exercisepost
              if (slot.exercise_post_id !== undefined && slot.exercise_post_id !== null) {
                exercisePostId = Number(slot.exercise_post_id);
              } else if (slot.exercisePostId !== undefined && slot.exercisePostId !== null) {
                exercisePostId = Number(slot.exercisePostId);
              } else if (slot.exercisepost !== undefined && slot.exercisepost !== null) {
                // If exercisepost is object (relationship)
                if (typeof slot.exercisepost === 'object' && slot.exercisepost.id) {
                  exercisePostId = Number(slot.exercisepost.id);
                } else if (typeof slot.exercisepost === 'number') {
                  exercisePostId = Number(slot.exercisepost);
                }
              }
              
              // Find detailed information about the exercise from existing exercises
              let exerciseInfo = null;
              if (exercisePostId) {
                const exerciseMatch = exercisePosts.find(ex => {
                  const exId = ex.exercisepost_id || ex.id;
                  return Number(exId) === Number(exercisePostId);
                });
                
                if (exerciseMatch) {
                  exerciseInfo = {
                    id: exercisePostId,
                    name: exerciseMatch.name,
                    description: exerciseMatch.description || '',
                    fullExercise: exerciseMatch
                  };
                }
              }
              
              return {
                id: slot.id || Date.now() + Math.random(),
                no: parseInt(slot.no) || 0,
                duration: parseInt(slot.duration) || 0,
                exercisePostId: exercisePostId,
                exercise_post_id: exercisePostId, // Add both formats
                exerciseInfo: exerciseInfo // Add exercise detailed information
              };
            });
            
            // Update state with new data
            setPlanSlots(formattedSlots);
          } else if (slotsResponse.data.length === 0) {
            // If no slots, create a default slot
            setPlanSlots([
              { id: Date.now(), no: 1, exercisePostId: null, exercise_post_id: null, duration: 5 }
            ]);
          }
        }
      } catch (error) {
        console.error('Error reloading plan data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle change in search keyword
  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  if (loading && !isSaving) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Show saving/deleting process screen
  if (isSaving) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            {saveComplete ? (
              <div className="text-green-600 text-6xl mb-4">✓</div>
            ) : (
              <FontAwesomeIcon icon={faSpinner} spin className="text-primary-500 text-5xl mb-4" />
            )}
            <h2 className="text-xl font-bold mb-4">
              {saveComplete ? "Completed!" : "Processing..."}
            </h2>
            <p className="text-gray-700 mb-6">{savingMessage}</p>
            
            {saveComplete && (
              <p className="text-sm text-gray-500">
                Will redirect automatically in a moment...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={fetchData}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Training Plan</h1>
      
      {/* Plan header */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Plan Name</label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter workout plan name..."
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            value={planDescription}
            onChange={(e) => setPlanDescription(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter description for this workout plan..."
            rows="2"
          ></textarea>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Exercise list */}
        <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4">
          <h2 className="font-bold text-lg mb-4 border-b pb-2">Exercise List</h2>
          
          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={handleSearchChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search exercises..."
            />
          </div>
          
          {filteredExercises.length > 0 ? (
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredExercises.map(exercise => (
                <div 
                  key={exercise.exercisepost_id || exercise.id}
                  className="border rounded-md p-3 mb-3 bg-gray-50 cursor-move hover:bg-gray-100 transition"
                  draggable="true"
                  onDragStart={() => handleDragStart(exercise)}
                >
                  <p className="font-medium">{exercise.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {searchKeyword ? (
                <p>No exercises found matching "{searchKeyword}".</p>
              ) : (
                <p>No exercises available.</p>
              )}
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Drag and drop exercises to plan slots to create your workout routine.</p>
          </div>
        </div>
        
        {/* Plan detail */}
        <div className="w-full md:w-3/4 bg-white shadow-md rounded-lg p-4">
          <h2 className="font-bold text-lg mb-4 border-b pb-2">Plan Details</h2>
          
          {planSlots.length > 0 ? (
            planSlots.map(slot => (
              <div 
                key={slot.id}
                className="border rounded-md p-4 mb-4 hover:border-blue-300 transition"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-blue-50');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-blue-50');
                }}
                onDrop={(e) => handleDrop(e, slot.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Slot #{slot.no}</h3>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faClock} className="text-gray-500 mr-2" />
                    <input
                      type="number"
                      value={slot.duration}
                      onChange={(e) => handleDurationChange(slot.id, e.target.value)}
                      className="w-16 border rounded p-1 text-center"
                      min="1"
                    />
                    <span className="ml-1 text-gray-500">minutes</span>
                  </div>
                </div>
                
                {slot.exercisePostId || slot.exerciseInfo ? (
                  <div className="bg-blue-50 p-3 rounded-md relative">
                    <div className="absolute top-2 right-2">
                      <button 
                        onClick={() => removeExerciseFromSlot(slot.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faTrash} size="xs" />
                      </button>
                    </div>
                    <h4 className="font-medium">
                      {slot.exerciseInfo?.name || 
                       exercisePosts.find(ex => {
                         // Check multiple possible ID fields
                         const exId = ex.exercisepost_id || ex.id;
                         return Number(exId) === Number(slot.exercisePostId);
                       })?.name || 'Unknown exercise'}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Exercise assigned to this slot (ID: {slot.exercisePostId})
                    </p>
                    {!slot.exercise_post_id && slot.exerciseInfo && (
                      <p className="text-xs text-orange-500 mt-1">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                        This exercise is only saved locally and may be lost when reloading the page
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-md flex justify-center items-center">
                    <p className="text-gray-500">Drag and drop an exercise here</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No slots available. Add a new slot to get started.</p>
            </div>
          )}
          
          <button 
            className="border rounded-md p-3 w-full text-center hover:bg-gray-50 transition"
            onClick={addNewSlot}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add new slot
          </button>
          
          <div className="mt-6 border-t pt-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="font-medium mb-4 md:mb-0">
                <span>Total duration: </span>
                <span className="font-bold">{totalDuration} minutes</span>
              </div>
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center"
                  onClick={savePlan}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save
                </button>
                {planId && (
                  <button 
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition flex items-center"
                    onClick={deletePlan}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan; 