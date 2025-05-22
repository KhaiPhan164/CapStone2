import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faDumbbell, faArrowLeft, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PaymentService from './services/paymentservice';

const GymDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [gym, setGym] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Function to clear error message after a delay
  const clearErrorAfterDelay = (delay = 5000) => {
    setTimeout(() => {
      setErrorMessage(null);
    }, delay);
  };
  
  // Ignore Google Pay manifest errors in console
  useEffect(() => {
    // Redefine console.error to ignore Google Pay manifest errors
    const originalConsoleError = console.error;
    console.error = function(msg, ...args) {
      if (typeof msg === 'string' && msg.includes('payment manifest')) {
        // Skip errors related to Google Pay payment manifest
        return;
      }
      originalConsoleError.apply(console, [msg, ...args]);
    };

    // Cleanup when component unmounts
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  
  // Check if there's a payment_status query parameter (from payment callback)
  useEffect(() => {
    // Use PaymentService's handlePaymentResult method to process the result
    PaymentService.handlePaymentResult((result) => {
      if (result) {
        // If there's an error
        if (result.error) {
          setProcessingPayment(false);
          clearErrorAfterDelay();
          return;
        }
        
        // Process according to status (only 2 statuses: success and failure)
        if (result.isSuccess) {
          alert(`Payment successful: ${result.status_description}`);
          navigate('/payment-status', { 
            state: { 
              paymentStatus: result,
              statusInfo: PaymentService.getPaymentStatusInfo(result.statusId)
            }
          });
        } else if (result.isFailed) {
          clearErrorAfterDelay();
        }
        
        setProcessingPayment(false);
      }
    });
  }, [location, navigate]);
  
  useEffect(() => {
    const fetchGymDetails = async () => {
      try {
        // Get gym information (user_id)
        const gymResponse = await axios.get(`http://localhost:3000/users/${id}`);
        setGym(gymResponse.data);

        // Get membership information by gym's user_id
        const membershipResponse = await axios.get(`http://localhost:3000/membership/gym/${id}`);
        setMemberships(membershipResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Unable to load gym information. Please try again later.');
        setLoading(false);
      }
    };

    fetchGymDetails();
  }, [id]);

  const handleSelectMembership = (membership) => {
    setSelectedMembership(membership);
    setShowPaymentModal(true);
  };
  
  /**
   * Handle payment process when user confirms in modal
   * Payment statuses:
   * - SUCCESS (1): Payment successful
   * - FAILED (2): Payment failed (default initial state)
   */
  const handlePayment = async () => {
    try {
      // Make sure a membership is selected
      if (!selectedMembership) {
        setErrorMessage('Please select a membership package!');
        clearErrorAfterDelay();
        return;
      }
      
      // Close modal
      setShowPaymentModal(false);

      // Show loading
      setProcessingPayment(true);

      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Please login to make a payment!');
        clearErrorAfterDelay();
        navigate('/sign-in');
        return;
      }

      // Try to get user info from localStorage first
      let userId = null;
      
      try {
        // Check profile in localStorage
        const storedProfileStr = localStorage.getItem('profile');
        if (storedProfileStr) {
          const profile = JSON.parse(storedProfileStr);
          if (profile && (profile.user_id || profile.id)) {
            userId = profile.user_id || profile.id;
          }
        }
        
        // If not in profile, check in user
        if (!userId) {
          const storedUserStr = localStorage.getItem('user');
          if (storedUserStr) {
            const user = JSON.parse(storedUserStr);
            if (user && (user.user_id || user.id)) {
              userId = user.user_id || user.id;
            }
          }
        }
      } catch (e) {
        // Error reading from localStorage
      }
      
      // If user_id not found in localStorage, call API
      if (!userId) {
        // Get user info from profile API
        const profileResponse = await axios.get('http://localhost:3000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!profileResponse.data || !profileResponse.data.user_id) {
          throw new Error('Unable to get user information');
        }

        userId = Number(profileResponse.data.user_id);
      }

      // Convert userId to number if it's a string
      userId = Number(userId);
      const membershipId = Number(selectedMembership.membership_id);
      const amount = Number(selectedMembership.price);

      // Check for valid values
      if (isNaN(userId) || isNaN(membershipId) || isNaN(amount)) {
        throw new Error('Invalid data');
      }

      // Save information about selected membership to localStorage for later display
      localStorage.setItem('selectedMembership', JSON.stringify({
        membershipId: membershipId,
        membershipName: selectedMembership.membership_name || selectedMembership.name || 'Unnamed Package',
        amount: amount,
        duration: selectedMembership.duration,
        description: selectedMembership.description,
        gymId: gym.user_id,
        gymName: gym.name,
        timestamp: Date.now()
      }));

      // Create payment data with correct format according to DTO
      const paymentData = {
        user_id: userId,
        membership_id: membershipId,
        amount_paid: amount,
        status_id: 2, // Default is FAILED (2) when creating payment, will be updated to SUCCESS (1) by backend when payment is successful
        payment_method: 'ZaloPay',
        order_id: `ORDER_${Date.now()}`
      };

      try {
        // Use PaymentService to create payment and automatically redirect
        const result = await PaymentService.createPayment(paymentData, false); // Don't auto redirect

        if (result && result.payment_url) {
          // Use PaymentService's redirectToPayment function to redirect
          PaymentService.redirectToPayment(result);
        } else {
          // If no payment URL, redirect to payment-status page
          navigate('/payment-status', { 
            state: { 
              paymentId: result.payment_id,
              amount: amount,
              membershipName: selectedMembership.membership_name || selectedMembership.name || 'Unnamed Package',
              duration: selectedMembership.duration,
              paymentStatus: {
                statusId: result.status_id,
                status: PaymentService.isPaymentSuccessful(result.status_id) ? 'SUCCESS' : 'FAILED',
                isSuccess: PaymentService.isPaymentSuccessful(result.status_id),
                isFailed: PaymentService.isPaymentFailed(result.status_id)
              }
            }
          });
        }
      } catch (paymentError) {
        // Handle specific errors from PaymentService
        throw paymentError;
      }
    } catch (error) {
      let errorMsg = 'An error occurred while creating payment. Please try again.';
      
      if (error.response) {
        // Server returned an error
        errorMsg = error.response.data.message || errorMsg;
      } else if (error.request) {
        // No response received from server
        errorMsg = 'Unable to connect to server. Please check your connection and try again.';
      } else if (error.message) {
        // Error from PaymentService or other errors
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      clearErrorAfterDelay();
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDuration = (days) => {
    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} months`;
    }
    return `${days} days`;
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading gym information...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center text-red-500">
        <p className="text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-primary-500 text-white px-6 py-2 rounded-full hover:bg-primary-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );

  if (!gym) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center text-gray-600">
        <p className="text-lg">Gym information not found.</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100">
      {processingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary-500 mb-4" />
            <p className="text-lg font-medium">Processing payment...</p>
            <p className="text-sm text-gray-500 mt-2">Please do not close this page.</p>
          </div>
        </div>
      )}
      
      {/* Display error message */}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50 max-w-md animate-fade-in-down">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{errorMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setErrorMessage(null)}
                  className="inline-flex text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/gyms')}
        className="flex items-center text-gray-600 hover:text-primary-500 mb-6"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to list
      </button>

      {/* Header Section */}
<div className='flex justify-center'>
  <div className="bg-white w-[500px] rounded-lg shadow-lg overflow-hidden mb-8 border-2 border-primary-500 hover:shadow-2xl transition-shadow duration-300">
    <div className="">
      <div className="flex items-start mb-6 bg-gradient-to-r from-primary-100 to-primary-200 p-4 rounded-lg">
        {gym.imgUrl ? (
          <img 
            src={gym.imgUrl} 
            alt={gym.name} 
            className="w-24 h-24 rounded-full object-cover mr-6"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mr-6">
            <span className="text-gray-500 text-2xl">GYM</span>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{gym.name}</h1>
          <div className="flex items-center text-primary-600 space-x-4 mt-2">
            <FontAwesomeIcon icon={faEnvelope} className="text-primary-500" />
            <span>{gym.email}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {gym.phoneNum && (
              <div className="flex items-center text-primary-600 space-x-2">
                <FontAwesomeIcon icon={faPhone} className="text-primary-500" />
                <span>{gym.phoneNum}</span>
              </div>
            )}
            {gym.address && (
              <div className="flex items-center text-primary-600 space-x-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary-500" />
                <span>{gym.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {gym.description && (
        <div className="prose max-w-none mb-6">
          <h2 className="text-xl font-semibold mb-2 text-primary-700 border-b-2 border-primary-500 pb-1">
            Description
          </h2>
          <p>{gym.description}</p>
        </div>
      )}
    </div>
  </div>
</div>



      {/* Membership Packages */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Membership Packages</h2>
        
        {memberships.length === 0 ? (
          <div className="text-center text-gray-500 p-8 border border-gray-200 rounded-lg">
            No membership packages available for this gym.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map(membership => (
              <div 
                key={membership.membership_id}
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{membership.membership_name}</h3>
                    <div className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium">
                      {formatDuration(membership.duration)}
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold text-primary-500 mb-4">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0
                    }).format(membership.price)}
                  </div>
                  
                  <div className="text-gray-600 mb-6">
                    {membership.description || 'No description provided.'}
                  </div>
                  
                  <button
                    onClick={() => handleSelectMembership(membership)}
                    className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faDumbbell} className="mr-2" />
                    Join now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Confirm Payment</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedMembership.membership_name}
              </h3>
              <div className="text-sm text-gray-500 mt-1">
                Duration: {formatDuration(selectedMembership.duration)}
              </div>
              <div className="text-2xl font-bold text-primary-500 mt-2">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'VND',
                  maximumFractionDigits: 0
                }).format(selectedMembership.price)}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              {selectedMembership.description ? (
                <div className="text-gray-700">
                  <p>{selectedMembership.description}</p>
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  <p>No description available for this membership package.</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymDetail; 