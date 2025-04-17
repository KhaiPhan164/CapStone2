import axios from 'axios';

const API_URL = 'http://localhost:3000';

/**
 * Các trạng thái thanh toán:
 * - SUCCESS (2): Thanh toán thành công
 * - FAILED (0): Thanh toán thất bại
 */
class PaymentService {
    /**
     * Tạo thanh toán mới và tùy chọn tự động chuyển hướng đến trang thanh toán
     * @param {Object} paymentData - Dữ liệu thanh toán
     * @param {boolean} autoRedirect - Có tự động điều hướng đến trang thanh toán hay không (mặc định: true)
     * @returns {Promise<Object>} - Thông tin thanh toán
     */
    static async createPayment(paymentData, autoRedirect = true) {
        try {
            // Sử dụng token từ localStorage (có thể là 'token' hoặc 'accessToken')
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            console.log('Đang gửi dữ liệu thanh toán:', paymentData);
            const response = await axios.post(
                `${API_URL}/payment`,
                paymentData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const paymentResult = response.data;
            console.log('Kết quả tạo thanh toán:', paymentResult);

            // Lưu trữ order_id và toàn bộ thông tin thanh toán trong localStorage
            if (paymentResult.order_id) {
                localStorage.setItem('currentPaymentOrderId', paymentResult.order_id);
                localStorage.setItem('lastPaymentData', JSON.stringify(paymentResult));
            }

            // Kiểm tra và chuyển hướng đến URL thanh toán nếu có và autoRedirect = true
            if (autoRedirect && paymentResult.payment_url) {
                console.log('Đang chuyển hướng đến trang thanh toán:', paymentResult.payment_url);
                window.location.href = paymentResult.payment_url;
            }

            return paymentResult;
        } catch (error) {
            console.error('Lỗi tạo thanh toán:', error);
            
            if (error.response) {
                const errorMessage = error.response.data?.message || 
                                    error.response.data?.error || 
                                    'Không thể tạo thanh toán';
                throw new Error(errorMessage);
            }
            
            throw new Error('Đã xảy ra lỗi khi tạo thanh toán, vui lòng thử lại sau');
        }
    }

    /**
     * Lấy URL thanh toán đã lưu trong localStorage hoặc từ đối tượng thanh toán
     * @param {Object|null} paymentData - Đối tượng thanh toán (tùy chọn)
     * @returns {string|null} - URL thanh toán hoặc null nếu không tìm thấy
     */
    static getPaymentUrl(paymentData = null) {
        // Nếu có dữ liệu thanh toán từ tham số, lấy URL từ đó
        if (paymentData && paymentData.payment_url) {
            return paymentData.payment_url;
        }
        
        // Nếu không có dữ liệu thanh toán, thử lấy từ localStorage
        const lastPaymentData = localStorage.getItem('lastPaymentData');
        if (lastPaymentData) {
            try {
                const parsedData = JSON.parse(lastPaymentData);
                if (parsedData.payment_url) {
                    return parsedData.payment_url;
                }
            } catch (e) {
                console.error('Lỗi khi parse dữ liệu thanh toán từ localStorage:', e);
                return null;
            }
        }
        
        return null;
    }

    /**
     * Chuyển hướng người dùng đến trang thanh toán
     * @param {string|Object} urlOrPaymentData - URL thanh toán hoặc đối tượng thanh toán
     * @returns {boolean} - true nếu chuyển hướng thành công, false nếu không
     */
    static redirectToPayment(urlOrPaymentData) {
        let paymentUrl = null;
        
        if (typeof urlOrPaymentData === 'string') {
            paymentUrl = urlOrPaymentData;
        } else if (urlOrPaymentData && urlOrPaymentData.payment_url) {
            paymentUrl = urlOrPaymentData.payment_url;
            
            // Lưu thông tin thanh toán vào localStorage
            localStorage.setItem('lastPaymentData', JSON.stringify(urlOrPaymentData));
            
            // Lưu order_id để kiểm tra trạng thái
            if (urlOrPaymentData.order_id) {
                localStorage.setItem('currentPaymentOrderId', urlOrPaymentData.order_id);
            }
        }
        
        if (!paymentUrl) {
            console.error('Không tìm thấy URL thanh toán');
            return false;
        }
        
        console.log('Đang chuyển hướng đến trang thanh toán:', paymentUrl);
        window.location.href = paymentUrl;
        return true;
    }

    /**
     * Kiểm tra trạng thái thanh toán bằng orderId
     * @param {string|null} orderId - Mã đơn hàng (nếu null, sẽ lấy từ localStorage)
     * @returns {Promise<Object>} - Thông tin trạng thái thanh toán
     */
    static async checkPaymentStatus(orderId = null) {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            // Nếu không cung cấp orderId, thử lấy từ localStorage
            if (!orderId) {
                orderId = localStorage.getItem('currentPaymentOrderId');
                if (!orderId) {
                    throw new Error('Không tìm thấy mã đơn hàng');
                }
            }

            const response = await axios.get(
                `${API_URL}/payment/check-status/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const paymentStatus = response.data;
            
            // Đơn giản hóa trạng thái thanh toán thành thành công hoặc thất bại
            paymentStatus.isSuccess = paymentStatus.status_id === 2;
            paymentStatus.isFailed = paymentStatus.status_id === 0;
            
            // Log trạng thái thanh toán để debug
            console.log('Thông tin trạng thái thanh toán:', {
                orderId: paymentStatus.order_id,
                statusId: paymentStatus.status_id,
                status: paymentStatus.status,
                description: paymentStatus.status_description,
                isSuccess: paymentStatus.isSuccess,
                isFailed: paymentStatus.isFailed
            });

            return paymentStatus;
        } catch (error) {
            console.error('Lỗi kiểm tra trạng thái thanh toán:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Không thể kiểm tra trạng thái thanh toán');
            }
            throw new Error('Không thể kết nối đến máy chủ');
        }
    }

    /**
     * Phân tích URL hiện tại để lấy thông tin trạng thái thanh toán
     * Sử dụng khi người dùng được redirect về từ cổng thanh toán
     * @returns {Object} Thông tin trạng thái thanh toán
     */
    static parsePaymentStatus() {
        // Phân tích URL hiện tại
        const searchParams = new URLSearchParams(window.location.search);
        const orderId = searchParams.get('orderId');
        const statusId = parseInt(searchParams.get('status'));
        const errorParam = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        console.log('Phân tích thông tin thanh toán từ URL:', {
            orderId,
            statusId,
            error: errorParam,
            message: errorMessage
        });

        // Nếu có lỗi từ URL
        if (errorParam === '1') {
            return {
                orderId,
                statusId: 0, // Thất bại
                status: 'FAILED',
                status_description: errorMessage || 'Thanh toán thất bại',
                isSuccess: false,
                isFailed: true,
                error: true,
                errorMessage: errorMessage || 'Đã xảy ra lỗi trong quá trình thanh toán'
            };
        }

        // Nếu có status từ URL
        if (statusId) {
            const statusInfo = this.getPaymentStatusInfo(statusId);
            
            // Log rõ ràng về ý nghĩa của status
            console.log(`QUAN TRỌNG: status_id=${statusId} có nghĩa là "${statusInfo.description}"`);
            
            // CHÚ Ý: status 2 = SUCCESS, status 0 = FAILED
            // Backend trả về:
            // - status_id=2 cho SUCCESS
            // - status_id=0 cho FAILED
            
            return {
                orderId,
                statusId,
                status: statusInfo.text,
                status_description: statusInfo.description,
                isSuccess: statusId === 2,
                isFailed: statusId === 0,
                color: statusInfo.color,
                className: statusInfo.className,
                icon: statusInfo.icon
            };
        }

        // Nếu không có thông tin từ URL nhưng có orderId, gọi API để kiểm tra
        if (orderId) {
            // Lưu orderId để sau này kiểm tra
            localStorage.setItem('currentPaymentOrderId', orderId);
            console.log('Đã lưu order_id để kiểm tra trạng thái:', orderId);
            
            // Trả về null để component có thể gọi checkPaymentStatus
            return null;
        }

        // Trường hợp không có thông tin gì
        return {
            orderId: null,
            statusId: 0, // Mặc định là thất bại nếu không xác định được
            status: 'FAILED',
            status_description: 'Không thể xác định trạng thái thanh toán',
            isSuccess: false,
            isFailed: true,
            error: true,
            errorMessage: 'Không thể xác định trạng thái thanh toán'
        };
    }

    /**
     * Xử lý kết quả thanh toán khi người dùng quay lại từ cổng thanh toán
     * @param {Function} callback - Hàm callback để xử lý kết quả thanh toán
     * @returns {void}
     */
    static handlePaymentResult(callback) {
        // Phân tích URL
        const paymentResult = this.parsePaymentStatus();
        
        // Nếu có thông tin thanh toán từ URL
        if (paymentResult) {
            callback(paymentResult);
            return;
        }
        
        // Nếu không có thông tin từ URL nhưng có orderId, gọi API để kiểm tra
        const orderId = localStorage.getItem('currentPaymentOrderId');
        if (orderId) {
            this.checkPaymentStatus(orderId)
                .then(status => callback(status))
                .catch(error => {
                    console.error('Lỗi kiểm tra trạng thái thanh toán:', error);
                    callback({
                        orderId,
                        statusId: 0,
                        status: 'FAILED',
                        status_description: 'Lỗi khi kiểm tra trạng thái',
                        isSuccess: false,
                        isFailed: true,
                        error: true,
                        errorMessage: error.message
                    });
                });
            return;
        }
        
        // Không có thông tin gì cả
        callback({
            error: true,
            statusId: 0,
            status: 'FAILED',
            status_description: 'Không tìm thấy thông tin thanh toán',
            isSuccess: false,
            isFailed: true,
            errorMessage: 'Không tìm thấy thông tin thanh toán'
        });
    }

    /**
     * Lấy mô tả trạng thái thanh toán dựa vào status_id
     * @param {number} statusId - ID trạng thái thanh toán
     * @returns {Object} - Thông tin trạng thái bao gồm text, description và className
     */
    static getPaymentStatusInfo(statusId) {
        // CHÚ Ý: Frontend chỉ hiển thị 2 trạng thái:
        // - Thành công (2)
        // - Thất bại (0)
        switch (statusId) {
            case 2:
                return {
                    text: 'SUCCESS',
                    description: 'Thanh toán thành công',
                    className: 'status-success', 
                    color: 'green',
                    icon: 'check-circle'
                };
            case 0:
            default:
                return {
                    text: 'FAILED',
                    description: 'Thanh toán thất bại',
                    className: 'status-failed',
                    color: 'red',
                    icon: 'x-circle'
                };
        }
    }

    /**
     * Kiểm tra xem thanh toán có thành công không
     * @param {number} statusId - ID trạng thái thanh toán 
     * @returns {boolean} - true nếu thành công, false nếu thất bại
     */
    static isPaymentSuccessful(statusId) {
        return statusId === 2;
    }

    /**
     * Kiểm tra xem thanh toán có thất bại không
     * @param {number} statusId - ID trạng thái thanh toán
     * @returns {boolean} - true nếu thất bại, false nếu thành công
     */
    static isPaymentFailed(statusId) {
        return statusId === 0;
    }

    /**
     * Xử lý callback từ cổng thanh toán
     * @param {Object} callbackData - Dữ liệu callback 
     * @returns {Promise<Object>} - Kết quả xử lý callback
     */
    static async handlePaymentCallback(callbackData) {
        try {
            const response = await axios.post(
                `${API_URL}/payment/callback`,
                callbackData
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi xử lý callback:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Không thể xử lý callback');
            }
            throw new Error('Đã xảy ra lỗi khi xử lý callback');
        }
    }

    // Các phương thức liên quan đến membership
    static async createMembership(membershipData) {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            // Đảm bảo có user_id
            if (!membershipData.user_id) {
                const profile = JSON.parse(localStorage.getItem('profile'));
                const user = JSON.parse(localStorage.getItem('user'));
                membershipData.user_id = profile?.user_id || profile?.id || user?.user_id || user?.id;
                
                if (!membershipData.user_id) {
                    throw new Error('Không tìm thấy thông tin người dùng');
                }
            }

            const response = await axios.post(
                `${API_URL}/membership`,
                membershipData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Lỗi tạo membership:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Không thể tạo membership');
            }
            throw new Error('Đã xảy ra lỗi khi tạo membership');
        }
    }

    static async getMembershipTypes() {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            const response = await axios.get(
                `${API_URL}/membership/types`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Lỗi lấy danh sách membership type:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Không thể lấy danh sách loại membership');
            }
            throw new Error('Không thể kết nối đến máy chủ');
        }
    }

    static async getMyMemberships() {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            // Lấy user_id từ localStorage
            let userId = null;
            try {
                const profile = JSON.parse(localStorage.getItem('profile'));
                const user = JSON.parse(localStorage.getItem('user'));
                userId = profile?.user_id || profile?.id || user?.user_id || user?.id;
            } catch (e) {
                console.error('Lỗi khi đọc thông tin user từ localStorage:', e);
            }

            if (!userId) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            const response = await axios.get(
                `${API_URL}/membership/user/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Thêm thông tin trạng thái cho mỗi membership
            const memberships = response.data.map(membership => {
                const statusInfo = this.getPaymentStatusInfo(membership.status_id);
                return {
                    ...membership,
                    status: statusInfo.text,
                    status_description: statusInfo.description,
                    isSuccess: this.isPaymentSuccessful(membership.status_id),
                    isFailed: this.isPaymentFailed(membership.status_id),
                    color: statusInfo.color,
                    className: statusInfo.className,
                    icon: statusInfo.icon
                };
            });

            return memberships;
        } catch (error) {
            console.error('Lỗi lấy danh sách membership của tôi:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Không thể lấy danh sách membership của bạn');
            }
            throw new Error('Không thể kết nối đến máy chủ');
        }
    }

    static async getMembershipDetail(membershipId) {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            const response = await axios.get(
                `${API_URL}/membership/${membershipId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Thêm thông tin trạng thái
            const membership = response.data;
            const statusInfo = this.getPaymentStatusInfo(membership.status_id);
            return {
                ...membership,
                status: statusInfo.text,
                status_description: statusInfo.description,
                isSuccess: this.isPaymentSuccessful(membership.status_id),
                isFailed: this.isPaymentFailed(membership.status_id),
                color: statusInfo.color,
                className: statusInfo.className,
                icon: statusInfo.icon
            };
        } catch (error) {
            console.error('Lỗi lấy chi tiết membership:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Không thể lấy chi tiết membership');
            }
            throw new Error('Không thể kết nối đến máy chủ');
        }
    }

    static async updateMembership(membershipId, updateData) {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            const response = await axios.patch(
                `${API_URL}/membership/${membershipId}`,
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Thêm thông tin trạng thái
            const membership = response.data;
            const statusInfo = this.getPaymentStatusInfo(membership.status_id);
            return {
                ...membership,
                status: statusInfo.text,
                status_description: statusInfo.description,
                isSuccess: this.isPaymentSuccessful(membership.status_id),
                isFailed: this.isPaymentFailed(membership.status_id),
                color: statusInfo.color,
                className: statusInfo.className,
                icon: statusInfo.icon
            };
        } catch (error) {
            console.error('Lỗi cập nhật membership:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Không thể cập nhật membership');
            }
            throw new Error('Đã xảy ra lỗi khi cập nhật membership');
        }
    }

    static async deleteMembership(membershipId) {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            const response = await axios.delete(
                `${API_URL}/membership/${membershipId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Lỗi xóa membership:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Không thể xóa membership');
            }
            throw new Error('Đã xảy ra lỗi khi xóa membership');
        }
    }

    /**
     * Lấy danh sách thanh toán theo ID người dùng
     * @param {number} userId - ID của người dùng cần lấy lịch sử thanh toán
     * @returns {Promise<Array>} - Danh sách các thanh toán của người dùng
     */
    static async getPaymentsByUserId(userId) {
        try {
            console.log(`Đang lấy lịch sử thanh toán cho user ${userId}`);
            const response = await axios.get(
                `${API_URL}/payment/my-payments/${userId}`
            );

            // Thêm các thuộc tính bổ sung cho mỗi payment
            const payments = response.data.map(payment => {
                const statusInfo = this.getPaymentStatusInfo(payment.status_id);
                return {
                    ...payment,
                    status: statusInfo.text,
                    status_description: statusInfo.description,
                    isSuccess: this.isPaymentSuccessful(payment.status_id),
                    isFailed: this.isPaymentFailed(payment.status_id),
                    color: statusInfo.color,
                    className: statusInfo.className,
                    icon: statusInfo.icon
                };
            });

            console.log(`Đã lấy được ${payments.length} thanh toán cho user ${userId}`);
            return payments;
        } catch (error) {
            console.error('Lỗi lấy lịch sử thanh toán:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Không thể lấy lịch sử thanh toán');
            }
            throw new Error('Không thể kết nối đến máy chủ');
        }
    }

    /**
     * Lấy lịch sử thanh toán của người dùng hiện tại
     * @returns {Promise<Array>} - Danh sách các thanh toán của người dùng, được nhóm theo membership_id
     */
    static async getMyPaymentHistory() {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tiếp tục');
            }

            // Lấy user_id từ localStorage
            let userId = null;
            try {
                const profile = JSON.parse(localStorage.getItem('profile'));
                const user = JSON.parse(localStorage.getItem('user'));
                userId = profile?.user_id || profile?.id || user?.user_id || user?.id;
            } catch (e) {
                console.error('Lỗi khi đọc thông tin user từ localStorage:', e);
            }

            if (!userId) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            // Chỉ đơn giản lấy payments theo user ID
            const response = await axios.get(
                `${API_URL}/payment/my-payments/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Log để debug
            console.log('Raw payments data:', response.data);

            // Trả về nguyên bản data từ API
            return response.data;

        } catch (error) {
            console.error('Lỗi lấy lịch sử thanh toán:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Không thể lấy lịch sử thanh toán');
            }
            throw new Error('Không thể kết nối đến máy chủ');
        }
    }
}

export default PaymentService; 