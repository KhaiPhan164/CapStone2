import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../layout/Header';
import Footer from '../../../layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClock, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import PlanService from '../../../services/plan.service';
import AuthService from '../../../services/auth.service';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// Function to check if value is numeric
const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

const PlanList = () => {
  const navigate = useNavigate();
  
  // State for plan list
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get plan list from API when component mounts
  useEffect(() => {
    fetchPlans();
  }, []);

  // Function to fetch plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      if (!AuthService.isLoggedIn()) {
        navigate('/signin');
        return;
      }

      // Get plans list from API
      const plansData = await PlanService.getUserPlans();
      
      if (Array.isArray(plansData)) {
        // Ensure each plan has a numeric ID
        const formattedPlans = plansData.map(plan => ({
          ...plan,
          plan_id: plan.plan_id ? Number(plan.plan_id) : (plan.id ? Number(plan.id) : null),
          // Ensure other fields
          plan_name: plan.plan_name || plan.name || 'Unnamed Plan',
          Description: plan.Description || plan.description || '',
          total_duration: Number(plan.total_duration) || 0
        }));
        setPlans(formattedPlans);
      } else {
        setPlans([]);
        console.warn('Invalid plan data format:', plansData);
      }
    } catch (error) {
      console.error('Error loading plan list:', error);
      setError('Unable to load plan list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete plan
  const handleDeletePlan = (planId) => {
    if (!isNumeric(planId)) {
      alert('Invalid plan ID');
      return;
    }

    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this plan?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const numericPlanId = Number(planId);
              await PlanService.deletePlan(numericPlanId);
              alert('Plan has been successfully deleted');
              fetchPlans(); // Update the list
            } catch (error) {
              console.error('Error deleting plan:', error);
              alert(`Unable to delete plan: ${error.message || 'An error occurred'}`);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={fetchPlans}
            >
              Try again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Workout Plan List</h1>
          <Link 
            to="/plan" 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create new plan
          </Link>
        </div>
        
        {/* Plan list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {plans.length > 0 ? (
            plans.map(plan => (
              <div 
                key={plan.plan_id || plan.id} 
                className="w-full border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <Link 
                  to={`/plan?id=${plan.plan_id || plan.id}`}
                  className="block p-5"
                >
                  <h3 className="font-bold text-lg mb-2">{plan.plan_name || plan.name}</h3>
                  <p className="text-gray-600 mb-3 text-sm line-clamp-2">{plan.Description || plan.description}</p>
                  <div className="flex items-center text-gray-500">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    <span>{plan.total_duration || 0} minutes</span>
                  </div>
                </Link>
                
                <div className="bg-gray-50 p-3 border-t flex justify-end space-x-4">
                  <Link 
                    to={`/plan?id=${plan.plan_id || plan.id}`}
                    className="text-green-500 hover:text-green-700 flex items-center"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    Edit
                  </Link>
                  
                  <button 
                    onClick={() => handleDeletePlan(plan.plan_id || plan.id)}
                    className="text-red-500 hover:text-red-700 flex items-center"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4 text-lg">You don't have any workout plans yet.</p>
              <Link 
                to="/plan" 
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition inline-flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Create your first plan
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PlanList; 