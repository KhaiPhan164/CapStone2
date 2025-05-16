import axios from 'axios';
import AuthService from './auth.service';

const API_URL = 'http://localhost:3000/schedule';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`
    };
};

// Format data for FullCalendar
const formatScheduleForCalendar = (schedule) => {
    try {
        // Determine title based on note and plan
        let title = 'Workout';
        let planName = 'Unknown Plan';
        
        // Always extract plan name first if available
        if (schedule.plan && schedule.plan.name) {
            planName = schedule.plan.name;
        } else if (schedule.plan && schedule.plan.plan_name) {
            planName = schedule.plan.plan_name;
        }
        
        // Always use planName as title
        if (planName && planName !== 'Unknown Plan') {
            title = planName;
        }
        // Keep the note, but don't use it as title

        // Get time from time string
        const getTimeFromString = (timeStr) => {
            const time = timeStr.split('T')[1].split('.')[0].split(':');
            return {
                hours: parseInt(time[0]),
                minutes: parseInt(time[1])
            };
        };

        // Get date from day
        const day = new Date(schedule.day);
        
        // Get hours from start_hour and end_hour
        const startTime = getTimeFromString(schedule.start_hour);
        const endTime = getTimeFromString(schedule.end_hour);

        // Create start and end times
        const start = new Date(day);
        start.setHours(startTime.hours);
        start.setMinutes(startTime.minutes);
        start.setSeconds(0);

        const end = new Date(day);
        end.setHours(endTime.hours);
        end.setMinutes(endTime.minutes);
        end.setSeconds(0);

        // Format date for display
        const formattedDate = day.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Format times for display
        const formattedStartTime = `${startTime.hours.toString().padStart(2, '0')}:${startTime.minutes.toString().padStart(2, '0')}`;
        const formattedEndTime = `${endTime.hours.toString().padStart(2, '0')}:${endTime.minutes.toString().padStart(2, '0')}`;

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
                plan: schedule.plan,
                planName: planName,
                startDate: formattedDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                rawStartDate: day.toISOString().split('T')[0],
                dayOfWeek: day.getDay()
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
                throw new Error('User information not found');
            }
            const response = await axios.get(`${API_URL}`, {
                headers: getAuthHeader()
            });
            console.log('Response from server:', response.data);
            
            // Check and get data from response.data.data
            if (response.data && response.data.data) {
                // Log detailed information about each schedule
                response.data.data.forEach((schedule, index) => {
                    console.log(`Schedule ${index} details:`, {
                        id: schedule.schedule_id,
                        note: schedule.note,
                        plan: schedule.plan,
                        plan_id: schedule.plan_id
                    });
                });
                
                // Format data for FullCalendar
                const formattedSchedules = response.data.data.map(formatScheduleForCalendar);
                
                // Log the formatted schedules to check plan information
                formattedSchedules.forEach((schedule, index) => {
                    if (schedule) {
                        console.log(`Formatted schedule ${index}:`, {
                            id: schedule.id,
                            title: schedule.title,
                            planName: schedule.extendedProps.planName,
                            plan: schedule.extendedProps.plan
                        });
                    }
                });
                
                return formattedSchedules;
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
                throw new Error('User information not found');
            }

            // Format time to ISO string and keep local time
            const formatTimeToISO = (timeString, dayString) => {
                const time = new Date(timeString);
                const hours = time.getHours().toString().padStart(2, '0');
                const minutes = time.getMinutes().toString().padStart(2, '0');
                const day = new Date(dayString).toISOString().split('T')[0];
                
                // Create ISO string with local time
                return `${day}T${hours}:${minutes}:00.000Z`;
            };

            // Format data according to DTO requirements
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
                formatted_end: dataToSend.end_hour,
                plan_id: dataToSend.plan_id
            });

            console.log('Data being sent to server:', JSON.stringify(dataToSend, null, 2));

            const response = await axios.post(`${API_URL}`, dataToSend, {
                headers: getAuthHeader()
            });
            
            // If the response doesn't include plan data but we know the plan_id,
            // try to fetch plan details and add to response
            let responseData = response.data;
            if (responseData && dataToSend.plan_id && 
                (!responseData.plan || 
                (responseData.plan && !responseData.plan.name && !responseData.plan.plan_name))) {
                
                console.log('Plan data missing in response, attempting to add plan info');
                try {
                    // Try to get plan information from the scheduleData if it was provided
                    if (scheduleData.plan && (scheduleData.plan.name || scheduleData.plan.plan_name)) {
                        responseData.plan = scheduleData.plan;
                    }
                } catch (planError) {
                    console.error('Error adding plan information:', planError);
                }
            }
            
            console.log('Server response with plan info:', responseData);
            // Format returned data for FullCalendar
            return formatScheduleForCalendar(responseData);
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
                throw new Error('User information not found');
            }
            const response = await axios.patch(`${API_URL}/${id}`, scheduleData, {
                headers: getAuthHeader()
            });
            // Format returned data for FullCalendar
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
                throw new Error('User information not found');
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
                throw new Error('User information not found');
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