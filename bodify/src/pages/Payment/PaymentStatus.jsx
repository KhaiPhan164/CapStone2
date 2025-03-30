import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentService from '../../services/paymentservice';
import Header from '../../layout/Header';

const PaymentStatus = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Lấy orderId từ URL query parameters
                const params = new URLSearchParams(location.search);
                const orderId = params.get('orderId');

                if (!orderId) {
                    // Nếu không có orderId, kiểm tra xem có phải đang ở trang callback không
                    const isCallback = location.pathname === '/payment-callback';
                    if (isCallback) {
                        // Nếu đang ở trang callback, chuyển hướng về trang chủ
                        navigate('/');
                        return;
                    }
                    throw new Error('Không tìm thấy mã đơn hàng. Vui lòng thử lại.');
                }

                const result = await PaymentService.checkPaymentStatus(orderId);
                setStatus(result);
            } catch (err) {
                setError(err.message);
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
                        <strong className="font-bold">Lỗi!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                    <button
                        onClick={handleBackToHome}
                        className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                    >
                        Về trang chủ
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
                            status.payment.status_id === 2 
                                ? 'bg-green-100' 
                                : status.payment.status_id === 1
                                    ? 'bg-yellow-100'
                                    : 'bg-red-100'
                        }`}>
                            {status.payment.status_id === 2 ? (
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : status.payment.status_id === 1 ? (
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
                            {status.payment.status_id === 2 
                                ? 'Thanh toán thành công!' 
                                : status.payment.status_id === 1
                                    ? 'Đang xử lý thanh toán'
                                    : 'Thanh toán thất bại'}
                        </h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Mã đơn hàng:</span>
                            <span>{status.payment.order_id}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Số tiền:</span>
                            <span className="font-bold text-primary-500">
                                {status.payment.amount_paid.toLocaleString('vi-VN')}đ
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Trạng thái:</span>
                            <span className={`px-3 py-1 rounded-full ${
                                status.payment.status_id === 2 
                                    ? 'bg-green-100 text-green-800' 
                                    : status.payment.status_id === 1
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                            }`}>
                                {status.payment.status_id === 2 ? 'Thành công' : 
                                 status.payment.status_id === 1 ? 'Đang xử lý' : 'Thất bại'}
                            </span>
                        </div>

                        {status.zaloPayStatus && (
                            <div className="mt-4 p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold mb-2">Thông tin ZaloPay:</h3>
                                <p className="text-gray-700">{status.zaloPayStatus.return_message}</p>
                            </div>
                        )}

                        <div className="mt-6 space-y-3">
                            {status.payment.status_id === 2 && (
                                <button
                                    onClick={handleViewMembership}
                                    className="w-full bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                                >
                                    Xem Membership của tôi
                                </button>
                            )}
                            <button
                                onClick={handleBackToHome}
                                className={`w-full px-4 py-2 rounded ${
                                    status.payment.status_id === 2 
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                        : 'bg-primary-500 text-white hover:bg-primary-600'
                                }`}
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus; 