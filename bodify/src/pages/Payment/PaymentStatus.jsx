import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentService from '../../services/paymentservice';
import Header from '../../layout/Header';

const PaymentStatus = () => {
    // Cấu hình: Đặt thành TRUE nếu muốn LUÔN hiển thị thành công
    const FORCE_SUCCESS = false; // true = luôn thành công, false = kiểm tra theo logic thông thường
    
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Cố gắng lấy orderId từ nhiều nguồn khác nhau
                let orderId = null;
                
                // 1. Kiểm tra URL query parameters
                const params = new URLSearchParams(location.search);
                orderId = params.get('orderId') || params.get('apptransid');
                const statusParam = params.get('status');
                const amountParam = params.get('amount');
                const cancelParam = params.get('cancel') || params.get('cancelled');
                
                console.log("Thông tin từ URL query:", { 
                    orderId, 
                    statusParam, 
                    amount: amountParam,
                    cancel: cancelParam,
                    fullUrl: location.search
                });
                
                // Nếu có status=2 trong URL, ưu tiên sử dụng để hiển thị thành công
                if (statusParam === '2') {
                    const amount = parseFloat(amountParam || location.state?.amount) || 0;
                    console.log("Đã tìm thấy status=2 trong URL, hiển thị thành công với số tiền:", amount);
                    
                    setStatus({
                        payment: {
                            order_id: orderId || "ORDER_" + Date.now(),
                            status_id: 2, // Đánh dấu thành công
                            amount_paid: amount
                        }
                    });
                    setLoading(false);
                    return;
                }
                
                // Xử lý trường hợp hủy giao dịch
                if (cancelParam === '1' || cancelParam === 'true' || location.search.includes('cancel') || location.search.includes('cancelled')) {
                    console.log("Phát hiện giao dịch bị hủy, hiển thị màn hình thất bại");
                    
                    setStatus({
                        payment: {
                            order_id: orderId || "CANCEL_" + Date.now(),
                            status_id: 0, // Đánh dấu thất bại
                            amount_paid: parseFloat(amountParam || location.state?.amount) || 0,
                            cancel_reason: "Giao dịch đã bị hủy bởi người dùng"
                        },
                        status: 'CANCELLED',
                        statusId: 0,
                        cancelled: true
                    });
                    setLoading(false);
                    return;
                }
                
                // 2. Nếu không có trong URL, kiểm tra trong location.state
                if (!orderId && location.state && location.state.paymentId) {
                    orderId = location.state.paymentId;
                }
                
                // 3. Nếu vẫn không có, kiểm tra trong localStorage
                if (!orderId) {
                    orderId = localStorage.getItem('currentPaymentOrderId');
                }
                
                // 4. Nếu vẫn không có và có paymentStatus trong location.state
                if (!orderId && location.state && location.state.paymentStatus) {
                    // Nếu có data về payment trong state, hiển thị trực tiếp
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

                // Kiểm tra thêm URL query param
                if (statusParam === '2') {
                    const amount = parseFloat(amountParam || location.state?.amount) || 0;
                    console.log("Đã tìm thấy status=2 trong URL query param, đánh dấu thành công với số tiền:", amount);
                    
                    setStatus({
                        payment: {
                            order_id: orderId || "ORDER_" + Date.now(),
                            status_id: 2, // Đánh dấu thành công
                            amount_paid: amount
                        },
                        statusId: 2,
                        status: 'SUCCESS'
                    });
                    setLoading(false);
                    return;
                }
                
                // Nếu không tìm thấy orderId ở đâu cả, hiển thị trang thất bại thay vì redirect
                if (!orderId) {
                    // Thử tạo trạng thái thành công nếu có dấu hiệu thành công trong URL
                    if (location.search.includes('success') || location.search.includes('Success')) {
                        const amount = parseFloat(amountParam || location.state?.amount) || 0;
                        console.log("Tìm thấy từ khóa 'success' trong URL, đánh dấu thành công với số tiền:", amount);
                        
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
                    
                    // Nếu có dấu hiệu hủy
                    if (location.search.includes('cancel') || location.search.includes('fail') || 
                        location.search.includes('Cancel') || location.search.includes('Fail')) {
                        console.log("Phát hiện từ khóa hủy/thất bại trong URL, hiển thị màn hình thất bại");
                        
                        setStatus({
                            payment: {
                                order_id: "CANCEL_" + Date.now(),
                                status_id: 0,
                                amount_paid: parseFloat(amountParam || location.state?.amount) || 0,
                                cancel_reason: "Giao dịch đã bị hủy hoặc thất bại"
                            },
                            status: 'CANCELLED',
                            statusId: 0,
                            cancelled: true
                        });
                        setLoading(false);
                        return;
                    }
                    
                    // Ngay cả khi không có thông tin gì, vẫn hiển thị màn hình thất bại thay vì redirect
                    console.log("Không tìm thấy thông tin thanh toán, hiển thị màn hình thất bại");
                    setStatus({
                        payment: {
                            order_id: "UNKNOWN_" + Date.now(),
                            status_id: 0,
                            amount_paid: 0,
                            cancel_reason: "Không tìm thấy thông tin thanh toán"
                        },
                        status: 'UNKNOWN',
                        statusId: 0
                    });
                    setLoading(false);
                    return;
                }

                const result = await PaymentService.checkPaymentStatus(orderId);
                
                // Log kết quả chi tiết để debug
                console.log("Kết quả từ API:", result);
                
                // Kiểm tra status_id = 2 để xác định thành công
                if (result) {
                    // LUÔN kiểm tra status_id = 2 trong mọi vị trí có thể
                    if (result.status_id === 2) {
                        console.log("ĐÃ TÌM THẤY status_id = 2 trong API, đánh dấu THÀNH CÔNG");
                        setStatus({
                            payment: {
                                order_id: result.orderId || orderId,
                                status_id: 2, // Luôn đánh dấu thành công
                                amount_paid: parseFloat(result.amount) || 0 // Chuyển đổi chuỗi sang số
                            },
                            statusId: 2
                        });
                    } 
                    // kiểm tra trong payment nếu có
                    else if (result.payment && result.payment.status_id === 2) {
                        console.log("ĐÃ TÌM THẤY payment.status_id = 2 trong API, đánh dấu THÀNH CÔNG");
                        setStatus({
                            payment: {
                                ...result.payment,
                                status_id: 2, // Đảm bảo status_id = 2
                                amount_paid: parseFloat(result.payment.amount_paid || result.amount) || 0
                            },
                            statusId: 2
                        });
                    }
                    // Kiểm tra thêm các thuộc tính khác (để debug)
                    else {
                        console.log("Đang kiểm tra các giá trị khác trong result:", {
                            statusId: result.statusId,
                            status: result.status,
                            isSuccess: result.isSuccess
                        });
                        
                        // Nếu API trả về isSuccess = true hoặc statusId = 2, coi như thành công
                        if (result.statusId === 2 || result.isSuccess === true) {
                            console.log("Tìm thấy statusId = 2 hoặc isSuccess = true, đánh dấu THÀNH CÔNG");
                            setStatus({
                                payment: {
                                    order_id: result.orderId || orderId,
                                    status_id: 2, // Force thành thành công
                                    amount_paid: parseFloat(result.amount) || 0
                                },
                                statusId: 2
                            });
                        }
                        // Nếu không, tạo đối tượng mới từ dữ liệu hiện có
                        else {
                            console.log("Không tìm thấy dấu hiệu thành công, giữ nguyên dữ liệu API");
                            // In ra amount để debug
                            console.log("Số tiền từ API:", result.amount, typeof result.amount);
                            
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
                    console.log("API không trả về kết quả hoặc có lỗi");
                    // Tạo một đối tượng status mặc định nếu không có kết quả
                    setStatus({
                        payment: {
                            order_id: orderId,
                            status_id: 0,
                            amount_paid: 0
                        }
                    });
                }
            } catch (err) {
                console.error("Lỗi khi kiểm tra trạng thái:", err);
                // Hiển thị màn hình thất bại thay vì chuyển hướng về trang chủ
                const params = new URLSearchParams(location.search);
                const amountParam = params.get('amount');
                const orderId = params.get('orderId') || params.get('apptransid') || "ERROR_" + Date.now();
                
                setStatus({
                    payment: {
                        order_id: orderId,
                        status_id: 0,
                        amount_paid: parseFloat(amountParam || 0),
                        cancel_reason: err.message || "Đã xảy ra lỗi khi kiểm tra trạng thái thanh toán"
                    },
                    status: 'ERROR',
                    statusId: 0,
                    error: true
                });
                setLoading(false);
                // Comment dòng navigate('/') để không redirect về trang chủ
                // navigate('/');
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

    // STATUS_ID = 2 là THÀNH CÔNG
    // STATUS_ID = 0 là THẤT BẠI
    // ĐẢM BẢO HIỂN THỊ ĐÚNG TRẠNG THÁI
    console.log("Dữ liệu payment nhận được:", status);
    
    // FORCE_SUCCESS = true sẽ luôn hiển thị thành công bất kể dữ liệu
    if (FORCE_SUCCESS) {
        console.log("⚡ FORCE_SUCCESS được bật - Luôn hiển thị thành công");
    }
    
    // LUÔN ƯU TIÊN HIỂN THỊ THÀNH CÔNG nếu có bất kỳ dấu hiệu nào
    // Status = 2 ở BẤT KỲ nơi nào, hoặc isSuccess = true
    let isSuccess = FORCE_SUCCESS; // Bắt đầu với giá trị của FORCE_SUCCESS
    
    // Nếu FORCE_SUCCESS = true, không cần kiểm tra thêm
    if (!FORCE_SUCCESS) {
        // Kiểm tra tất cả các vị trí có thể chứa status_id/statusId
        if (status?.payment?.status_id === 2) {
            isSuccess = true;
            console.log("✅ Thành công: status.payment.status_id = 2");
        } else if (status?.statusId === 2) {
            isSuccess = true;
            console.log("✅ Thành công: status.statusId = 2");
        } else if (status?.status_id === 2) {
            isSuccess = true;
            console.log("✅ Thành công: status.status_id = 2");
        } else if (status?.isSuccess === true) {
            isSuccess = true;
            console.log("✅ Thành công: status.isSuccess = true");
        }
        // Kiểm tra dấu hiệu giao dịch bị hủy
        else if (status?.cancelled === true || status?.status === 'CANCELLED' || 
                 status?.payment?.cancel_reason || location.search.includes('cancel') || 
                 location.search.includes('Cancel')) {
            isSuccess = false; // Đánh dấu là thất bại
            console.log("❌ Thất bại: Giao dịch bị hủy");
        }
        // Kiểm tra thêm trong URL query param
        else {
            const params = new URLSearchParams(location.search);
            const statusParam = params.get('status');
            if (statusParam === '2') {
                isSuccess = true;
                console.log("✅ Thành công: URL param status = 2");
            } else if (location.search.includes('success') || location.search.includes('Success')) {
                isSuccess = true;
                console.log("✅ Thành công: URL chứa từ khóa 'success'");
            } else {
                console.log("❌ Thất bại: Không tìm thấy dấu hiệu thành công", status);
                console.log("URL search:", location.search);
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
                            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                        </h2>
                    </div>
                    
                    <div className="space-y-4">
                        {status?.payment?.order_id && (
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Mã đơn hàng:</span>
                                <span>{status.payment.order_id}</span>
                            </div>
                        )}

                        {status?.payment?.amount_paid !== undefined && (
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Số tiền:</span>
                                <span className="font-bold text-primary-500">
                                    {typeof status.payment.amount_paid === 'number' 
                                        ? status.payment.amount_paid.toLocaleString('vi-VN') 
                                        : '0'}đ
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Trạng thái:</span>
                            <span className={`px-3 py-1 rounded-full ${
                                isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {isSuccess ? 'Thành công' : 'Thất bại'}
                            </span>
                        </div>

                        {status?.payment?.cancel_reason && (
                            <div className="mt-4 p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold mb-2">Lý do:</h3>
                                <p className="text-gray-700">{status.payment.cancel_reason}</p>
                            </div>
                        )}

                        {status?.zaloPayStatus && (
                            <div className="mt-4 p-4 bg-gray-50 rounded">
                                <h3 className="font-semibold mb-2">Thông tin ZaloPay:</h3>
                                <p className="text-gray-700">{status.zaloPayStatus.return_message}</p>
                            </div>
                        )}

                        <div className="mt-6 space-y-3">
                            {isSuccess && (
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
                                    isSuccess 
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