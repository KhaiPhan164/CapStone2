import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentService from '../../services/paymentservice';
import Header from '../../layout/Header';

const PaymentStatus = () => {
    // Config: Set to TRUE to always display success
    const FORCE_SUCCESS = false; // true = always success, false = check with normal logic
    
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Try to get orderId from different sources
                let orderId = null;
                
                // 1. Check URL query parameters
                const params = new URLSearchParams(location.search);
                orderId = params.get('orderId') || params.get('apptransid');
                const statusParam = params.get('status');
                const amountParam = params.get('amount');
                const cancelParam = params.get('cancel') || params.get('cancelled');
                
                // If status=2 in URL, prioritize displaying success
                if (statusParam === '2') {
                    const amount = parseFloat(amountParam || location.state?.amount) || 0;
                    
                    setStatus({
                        payment: {
                            order_id: orderId || "ORDER_" + Date.now(),
                            status_id: 2, // Mark as success
                            amount_paid: amount
                        }
                    });
                    setLoading(false);
                    return;
                }
                
                // Handle cancelled transactions
                if (cancelParam === '1' || cancelParam === 'true' || location.search.includes('cancel') || location.search.includes('cancelled')) {
                    
                    setStatus({
                        payment: {
                            order_id: orderId || "CANCEL_" + Date.now(),
                            status_id: 0, // Mark as failed
                            amount_paid: parseFloat(amountParam || location.state?.amount) || 0,
                            cancel_reason: "Transaction cancelled by user"
                        },
                        status: 'CANCELLED',
                        statusId: 0,
                        cancelled: true
                    });
                    setLoading(false);
                    return;
                }
                
                // 2. If not in URL, check location.state
                if (!orderId && location.state && location.state.paymentId) {
                    orderId = location.state.paymentId;
                }
                
                // 3. If still not found, check localStorage
                if (!orderId) {
                    orderId = localStorage.getItem('currentPaymentOrderId');
                }
                
                // 4. If still not found and have paymentStatus in location.state
                if (!orderId && location.state && location.state.paymentStatus) {
                    // If payment data in state, display directly
                    setStatus({
                        payment: {
                            ...location.state.paymentStatus,
                            order_id: "ORDER_" + Date.now(),
                            amount_paid: location.state.amount || 0
                        }
                    });
                    setLoading(false);
                    return;
                }

                // Check URL query param again
                if (statusParam === '2') {
                    const amount = parseFloat(amountParam || location.state?.amount) || 0;
                    
                    setStatus({
                        payment: {
                            order_id: orderId || "ORDER_" + Date.now(),
                            status_id: 2, // Mark as success
                            amount_paid: amount
                        },
                        statusId: 2,
                        status: 'SUCCESS'
                    });
                    setLoading(false);
                    return;
                }
                
                // If orderId not found, display failure page instead of redirect
                if (!orderId) {
                    // Try to create success status if success indication in URL
                    if (location.search.includes('success') || location.search.includes('Success')) {
                        const amount = parseFloat(amountParam || location.state?.amount) || 0;
                        
                        setStatus({
                            payment: {
                                order_id: "AUTO_" + Date.now(),
                                status_id: 2,
                                amount_paid: amount
                            },
                            statusId: 2,
                            status: 'SUCCESS'
                        });
                        setLoading(false);
                        return;
                    }
                    
                    // If cancel indication
                    if (location.search.includes('cancel') || location.search.includes('fail') || 
                        location.search.includes('Cancel') || location.search.includes('Fail')) {
                        
                        setStatus({
                            payment: {
                                order_id: "CANCEL_" + Date.now(),
                                status_id: 0,
                                amount_paid: parseFloat(amountParam || location.state?.amount) || 0,
                                cancel_reason: "Transaction cancelled or failed"
                            },
                            status: 'CANCELLED',
                            statusId: 0,
                            cancelled: true
                        });
                        setLoading(false);
                        return;
                    }
                    
                    // Even with no information, display failure screen instead of redirect
                    setStatus({
                        payment: {
                            order_id: "UNKNOWN_" + Date.now(),
                            status_id: 0,
                            amount_paid: 0,
                            cancel_reason: "Payment information not found"
                        },
                        status: 'UNKNOWN',
                        statusId: 0
                    });
                    setLoading(false);
                    return;
                }

                const result = await PaymentService.checkPaymentStatus(orderId);
                
                // Check status_id = 2 to determine success
                if (result) {
                    // ALWAYS check status_id = 2 in all possible locations
                    if (result.status_id === 2) {
                        setStatus({
                            payment: {
                                order_id: result.orderId || orderId,
                                status_id: 2, // Always mark as success
                                amount_paid: parseFloat(result.amount) || 0 // Convert string to number
                            },
                            statusId: 2
                        });
                    } 
                    // Check in payment if exists
                    else if (result.payment && result.payment.status_id === 2) {
                        setStatus({
                            payment: {
                                ...result.payment,
                                status_id: 2, // Ensure status_id = 2
                                amount_paid: parseFloat(result.payment.amount_paid || result.amount) || 0
                            },
                            statusId: 2
                        });
                    }
                    // Check other properties (for debugging)
                    else {
                        // If API returns isSuccess = true or statusId = 2, consider as success
                        if (result.statusId === 2 || result.isSuccess === true) {
                            setStatus({
                                payment: {
                                    order_id: result.orderId || orderId,
                                    status_id: 2, // Force to success
                                    amount_paid: parseFloat(result.amount) || 0
                                },
                                statusId: 2
                            });
                        }
                        // Otherwise, create new object from existing data
                        else {
                            setStatus({
                                ...result,
                                payment: result.payment || {
                                    order_id: result.orderId || orderId,
                                    status_id: result.status_id || 0,
                                    amount_paid: parseFloat(result.amount) || 0
                                }
                            });
                        }
                    }
                } else {
                    // Create a default status object if no result
                    setStatus({
                        payment: {
                            order_id: orderId,
                            status_id: 0,
                            amount_paid: 0
                        }
                    });
                }
            } catch (err) {
                console.error("Error checking payment status:", err);
                // Display failure screen instead of redirecting to home
                const params = new URLSearchParams(location.search);
                const amountParam = params.get('amount');
                const orderId = params.get('orderId') || params.get('apptransid') || "ERROR_" + Date.now();
                
                setStatus({
                    payment: {
                        order_id: orderId,
                        status_id: 0,
                        amount_paid: parseFloat(amountParam || 0),
                        cancel_reason: err.message || "An error occurred while checking payment status"
                    },
                    status: 'ERROR',
                    statusId: 0,
                    error: true
                });
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [location, navigate]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleViewMembership = () => {
        navigate('/membership/my-memberships');
    };

    if (loading) {
        return (
            <div>
                <Header />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                    <button
                        onClick={handleBackToHome}
                        className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // STATUS_ID = 2 is SUCCESS
    // STATUS_ID = 0 is FAILURE
    // ENSURE CORRECT STATUS DISPLAY
    
    // FORCE_SUCCESS = true will always display success regardless of data
    
    // ALWAYS PRIORITIZE SUCCESS DISPLAY if any indication
    // Status = 2 ANYWHERE, or isSuccess = true
    let isSuccess = FORCE_SUCCESS; // Start with FORCE_SUCCESS value
    
    // If FORCE_SUCCESS = true, no need to check further
    if (!FORCE_SUCCESS) {
        // Check all possible locations for status_id/statusId
        if (status?.payment?.status_id === 2) {
            isSuccess = true;
        } else if (status?.statusId === 2) {
            isSuccess = true;
        } else if (status?.status_id === 2) {
            isSuccess = true;
        } else if (status?.isSuccess === true) {
            isSuccess = true;
        }
        // Check for transaction cancellation
        else if (status?.cancelled === true || status?.status === 'CANCELLED' || 
                 status?.payment?.cancel_reason || location.search.includes('cancel') || 
                 location.search.includes('Cancel')) {
            isSuccess = false; // Mark as failure
        }
        // Check URL query param
        else {
            const params = new URLSearchParams(location.search);
            const statusParam = params.get('status');
            if (statusParam === '2') {
                isSuccess = true;
            } else if (location.search.includes('success') || location.search.includes('Success')) {
                isSuccess = true;
            }
        }
    }
    
    const isFailed = !isSuccess;

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                            isSuccess ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                            {isSuccess ? (
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                        </h2>
                    </div>
                    
                    <div className="space-y-4">
                        {status?.payment?.order_id && (
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Order ID:</span>
                                <span className="text-gray-700">{status.payment.order_id}</span>
                            </div>
                        )}
                        
                        {status?.payment?.amount_paid !== undefined && (
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Amount:</span>
                                <span className="text-gray-700">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'VND',
                                        maximumFractionDigits: 0
                                    }).format(status.payment.amount_paid)}
                                </span>
                            </div>
                        )}
                        
                        {status?.payment?.transaction_info && (
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Transaction info:</span>
                                <span className="text-gray-700">{status.payment.transaction_info}</span>
                            </div>
                        )}
                        
                        {isFailed && status?.payment?.cancel_reason && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm mt-4">
                                <p><span className="font-medium">Reason:</span> {status.payment.cancel_reason}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col space-y-3 mt-6">
                        {isSuccess && (
                            <button
                                onClick={handleViewMembership}
                                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                            >
                                View Membership
                            </button>
                        )}
                        
                        <button
                            onClick={handleBackToHome}
                            className={`${
                                isSuccess ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-primary-500 hover:bg-primary-600 text-white'
                            } font-semibold py-2 px-4 rounded transition-colors`}
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus; 