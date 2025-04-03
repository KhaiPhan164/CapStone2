import axios from 'axios';
import AuthService from './auth.service';

const API_URL = 'http://localhost:3000/schedule';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`
    };
};

// Hàm format dữ liệu cho FullCalendar
const formatScheduleForCalendar = (schedule) => {
    try {
        // Xác định title dựa trên note và plan
        let title = 'Lịch tập';
        if (schedule.note && schedule.note.trim()) {
            title = schedule.note;
        } else if (schedule.plan && schedule.plan.name) {
            title = schedule.plan.name;
        }

        // Lấy giờ từ chuỗi thời gian
        const getTimeFromString = (timeStr) => {
            const time = timeStr.split('T')[1].split('.')[0].split(':');
            return {
                hours: parseInt(time[0]),
                minutes: parseInt(time[1])
            };
        };

        // Lấy ngày từ day
        const day = new Date(schedule.day);
        
        // Lấy giờ từ start_hour và end_hour
        const startTime = getTimeFromString(schedule.start_hour);
        const endTime = getTimeFromString(schedule.end_hour);

        // Tạo thời gian bắt đầu và kết thúc
        const start = new Date(day);
        start.setHours(startTime.hours);
        start.setMinutes(startTime.minutes);
        start.setSeconds(0);

        const end = new Date(day);
        end.setHours(endTime.hours);
        end.setMinutes(endTime.minutes);
        end.setSeconds(0);

        console.log('Original times:', {
            start_hour: schedule.start_hour,
            end_hour: schedule.end_hour,
            parsed_start: `${startTime.hours}:${startTime.minutes}`,
            parsed_end: `${endTime.hours}:${endTime.minutes}`,
            final_start: start,
            final_end: end
        });

        return {
            id: schedule.schedule_id,
            title: title,
            start: start,
            end: end,
            allDay: false,
            backgroundColor: '#4F46E5',
            extendedProps: {
                plan_id: schedule.plan_id,
                note: schedule.note,
                plan: schedule.plan
            }
        };
    } catch (error) {
        console.error('Error formatting schedule:', error);
        console.error('Schedule data:', schedule);
        return null;
    }
};

const ScheduleService = {
    getSchedules: async () => {
        try {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser || !currentUser.user_id) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
            const response = await axios.get(`${API_URL}`, {
                headers: getAuthHeader()
            });
            console.log('Response from server:', response.data);
            
            // Kiểm tra và lấy dữ liệu từ response.data.data
            if (response.data && response.data.data) {
                // Format dữ liệu cho FullCalendar
                return response.data.data.map(formatScheduleForCalendar);
            } else {
                console.error('Invalid response format:', response.data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            throw error;
        }
    },

    createSchedule: async (scheduleData) => {
        try {
            const currentUser = await AuthService.getCurrentUser();
            console.log('Current user from token:', currentUser);

            if (!currentUser || !currentUser.user_id) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            // Format thời gian sang ISO string và giữ nguyên giờ địa phương
            const formatTimeToISO = (timeString, dayString) => {
                const time = new Date(timeString);
                const hours = time.getHours().toString().padStart(2, '0');
                const minutes = time.getMinutes().toString().padStart(2, '0');
                const day = new Date(dayString).toISOString().split('T')[0];
                
                // Tạo chuỗi ISO với giờ địa phương
                return `${day}T${hours}:${minutes}:00.000Z`;
            };

            // Format dữ liệu theo yêu cầu của DTO
            const dataToSend = {
                user_id: Number(currentUser.user_id),
                note: scheduleData.note || '',
                plan_id: scheduleData.plan_id ? Number(scheduleData.plan_id) : undefined,
                day: new Date(scheduleData.day).toISOString(),
                start_hour: formatTimeToISO(scheduleData.start_hour, scheduleData.day),
                end_hour: formatTimeToISO(scheduleData.end_hour, scheduleData.day)
            };

            console.log('Schedule data received:', {
                original_start: scheduleData.start_hour,
                original_end: scheduleData.end_hour,
                formatted_start: dataToSend.start_hour,
                formatted_end: dataToSend.end_hour
            });

            console.log('Data being sent to server:', JSON.stringify(dataToSend, null, 2));

            const response = await axios.post(`${API_URL}`, dataToSend, {
                headers: getAuthHeader()
            });
            
            console.log('Server response:', response.data);
            // Format dữ liệu trả về cho FullCalendar
            return formatScheduleForCalendar(response.data);
        } catch (error) {
            console.error('Error creating schedule:', error);
            if (error.response) {
                console.log('Server error response:', error.response.data);
                console.log('Request data:', error.response.config.data);
            }
            throw error;
        }
    },

    updateSchedule: async (id, scheduleData) => {
        try {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser || !currentUser.user_id) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
            const response = await axios.patch(`${API_URL}/${id}`, scheduleData, {
                headers: getAuthHeader()
            });
            // Format dữ liệu trả về cho FullCalendar
            return formatScheduleForCalendar(response.data);
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    },

    deleteSchedule: async (id) => {
        try {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser || !currentUser.user_id) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
            const response = await axios.delete(`${API_URL}/${id}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    },

    getPlans: async () => {
        try {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser || !currentUser.user_id) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }
            const response = await axios.get(`${API_URL}/plans/user/${currentUser.user_id}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching plans:', error);
            throw error;
        }
    }
};

export default ScheduleService; 