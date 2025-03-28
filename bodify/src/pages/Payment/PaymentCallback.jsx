import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentService from '../../services/paymentservice';
import Header from '../../layout/Header';

const PaymentCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Lấy tất cả query parameters từ URL
                const params = new URLSearchParams(location.search);
                const callbackData = Object.fromEntries(params.entries());

                // Gửi callback data đến server
                const result = await PaymentService.handlePaymentCallback(callbackData);
                
                if (result.success) {
                    setSuccess(true);
                    
                    // Nếu thanh toán thành công và có membershipData, tạo membership mới
                    if (result.membershipData) {
                        try {
                            await PaymentService.createMembership({
                                membership_type: result.membershipData.type,
                                payment_id: result.paymentId,
                                start_date: new Date().toISOString()
                            });
                        } catch (membershipError) {
                            console.error('Error creating membership:', membershipError);
                            setError('Payment successful but failed to create membership. Please contact support.');
                            return;
                        }
                    }

                    // Chuyển hướng đến trang status
                    if (result.orderId) {
                        navigate(`/payment/status/${result.orderId}`);
                        return;
                    }
                } else {
                    setError(result.message || 'Payment processing failed');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        handleCallback();
    }, [location, navigate]);

    const handleBackToHome = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div>
                <Header />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                    <span className="ml-3 text-gray-600">Processing payment and creating membership...</span>
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

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Processing Your Membership</h2>
                        <p className="text-gray-600 mb-6">
                            Your payment has been received. We are now setting up your membership.
                        </p>
                        <div className="animate-pulse flex justify-center">
                            <div className="h-2 w-24 bg-primary-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback; 