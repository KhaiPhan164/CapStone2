import axios from 'axios';

const API_URL = 'http://localhost:3000';

class PaymentService {
    static async createPayment(paymentData) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
            }

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

            // Kiểm tra và mở link thanh toán ZaloPay
            if (response.data && response.data.payment_url) {
                window.location.href = response.data.payment_url;
            }

            return response.data;
        } catch (error) {
            console.error('Payment creation error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to create payment');
            }
            throw new Error('An error occurred while creating payment');
        }
    }

    static async handlePaymentCallback(callbackData) {
        try {
            const response = await axios.post(
                `${API_URL}/payment/callback`,
                callbackData
            );
            return response.data;
        } catch (error) {
            console.error('Callback handling error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to process callback');
            }
            throw new Error('An error occurred while processing callback');
        }
    }

    static async checkPaymentStatus(orderId) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
            }

            const response = await axios.get(
                `${API_URL}/payment/check-status/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Payment status check error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to check payment status');
            }
            throw new Error('Cannot connect to server');
        }
    }

    static async createMembership(membershipData) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
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
            console.error('Membership creation error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to create membership');
            }
            throw new Error('An error occurred while creating membership');
        }
    }

    static async getMembershipTypes() {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
            }

            const response = await axios.get(
                `${API_URL}/membership`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Membership types fetch error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to fetch membership types');
            }
            throw new Error('Cannot connect to server');
        }
    }

    static async getMyMemberships() {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
            }

            const response = await axios.get(
                `${API_URL}/membership/my-memberships`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('My memberships fetch error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to fetch your memberships');
            }
            throw new Error('Cannot connect to server');
        }
    }

    static async getMembershipDetail(membershipId) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
            }

            const response = await axios.get(
                `${API_URL}/membership/${membershipId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Membership detail fetch error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to fetch membership details');
            }
            throw new Error('Cannot connect to server');
        }
    }

    static async updateMembership(membershipId, updateData) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
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

            return response.data;
        } catch (error) {
            console.error('Membership update error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to update membership');
            }
            throw new Error('An error occurred while updating membership');
        }
    }

    static async deleteMembership(membershipId) {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Please login to continue');
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
            console.error('Membership deletion error:', error);
            if (error.response) {
                throw new Error(error.response.data.message || 'Unable to delete membership');
            }
            throw new Error('An error occurred while deleting membership');
        }
    }
}

export default PaymentService; 