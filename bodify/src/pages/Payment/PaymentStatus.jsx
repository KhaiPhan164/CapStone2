import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentService from '../../services/paymentservice';
import Header from '../../layout/Header';

const PaymentStatus = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const result = await PaymentService.checkPaymentStatus(orderId);
                setStatus(result);

                // Nếu thanh toán thành công, lấy thông tin membership
                if (result.isSuccess && result.membershipId) {
                    const membershipDetail = await PaymentService.getMembershipDetail(result.membershipId);
                    setMembership(membershipDetail);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, [orderId]);

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

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                            status.isSuccess 
                                ? 'bg-green-100' 
                                : status.isPending 
                                    ? 'bg-yellow-100'
                                    : 'bg-red-100'
                        }`}>
                            {status.isSuccess ? (
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : status.isPending ? (
                                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {status.isSuccess 
                                ? 'Payment Successful!' 
                                : status.isPending 
                                    ? 'Payment Processing'
                                    : 'Payment Failed'}
                        </h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Order ID:</span>
                            <span>{orderId}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Status:</span>
                            <span className={`px-3 py-1 rounded-full ${
                                status.isSuccess 
                                    ? 'bg-green-100 text-green-800' 
                                    : status.isPending 
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                            }`}>
                                {status.isSuccess ? 'Success' : status.isPending ? 'Pending' : 'Failed'}
                            </span>
                        </div>

                        {membership && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-3">Membership Details</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="font-medium">{membership.membership_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Start Date:</span>
                                        <span className="font-medium">
                                            {new Date(membership.start_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>End Date:</span>
                                        <span className="font-medium">
                                            {new Date(membership.end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {status.message && (
                            <div className="mt-4 p-4 bg-gray-50 rounded">
                                <p className="text-gray-700">{status.message}</p>
                            </div>
                        )}

                        <div className="mt-6 space-y-3">
                            {status.isSuccess && (
                                <button
                                    onClick={handleViewMembership}
                                    className="w-full bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                                >
                                    View My Membership
                                </button>
                            )}
                            <button
                                onClick={handleBackToHome}
                                className={`w-full px-4 py-2 rounded ${
                                    status.isSuccess 
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                        : 'bg-primary-500 text-white hover:bg-primary-600'
                                }`}
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus; 