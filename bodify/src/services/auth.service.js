import ApiService from './plan.service';
import UserService from './user.service';
import axios from 'axios';

class AuthService {
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error reading user information from localStorage:', e);
      // Clear invalid data
      localStorage.removeItem('user');
      return null;
    }
  }

  isLoggedIn() {
    const user = this.getCurrentUser();
    const token = localStorage.getItem('token');
    return !!user && !!token;
  }

  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async login(username, password) {
    // Clear old user data before new login
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    try {
      const response = await ApiService.login(username, password);
      // Dispatch event after successful login
      window.dispatchEvent(new Event('login'));
      return response;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    // Clear user data on logout
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return ApiService.logout ? ApiService.logout() : Promise.resolve();
  }

  register(userData) {
    return ApiService.register(userData);
  }

  async getProfile() {
    try {
      // Get user information from localStorage
      const currentUser = this.getCurrentUser();
      const token = localStorage.getItem('token');
      
      // Check if user information exists
      if (!currentUser) {
        console.warn('No user information in localStorage');
        
        // If profile exists in localStorage, use it temporarily
        const storedProfileStr = localStorage.getItem('profile');
        if (storedProfileStr) {
          try {
            const storedProfile = JSON.parse(storedProfileStr);
            console.warn('Using profile from localStorage');
            return storedProfile;
          } catch (e) {
            console.error('Error parsing profile from localStorage:', e);
          }
        }
        
        console.error('User information not found');
        return null;
      }

      // Find any usable ID
      const userId = currentUser.user_id || currentUser.id || currentUser.userId || currentUser._id;
      
      // If no ID exists, cannot call API by userID
      if (!userId) {
        console.warn('User ID not found in standard fields');
        
        // Use currentUser as profile if no other option
        console.warn('Using currentUser as profile due to missing ID');
        return currentUser;
      }
      
      console.log('Calling API to get profile with ID:', userId);
      
      // Use getUserProfile directly with userId
      try {
        console.log('Trying to call getUserProfile API with ID:', userId);
        const response = await UserService.getUserProfile(userId);
        const profileData = response?.data;

        // Check if profileData is an array and get the first element
        if (Array.isArray(profileData)) {
          console.warn('API returned an array, getting current user info');
          // Find user with matching userId in the array
          const userProfile = profileData.find(user => user.user_id === userId);
          if (userProfile) {
            // If user is found in the array, use that information
            const updatedProfile = {
              ...userProfile,
              user_id: userId,
              id: userId
            };
            localStorage.setItem('profile', JSON.stringify(updatedProfile));
            return updatedProfile;
          }
          // If not found, use currentUser
          return currentUser;
        }

        if (profileData) {
          console.log('Successfully retrieved profile from getUserProfile:', profileData);
          
          // Ensure profile has both user_id and id
          const updatedProfile = {
            ...profileData,
            user_id: profileData.user_id || userId,
            id: profileData.id || userId
          };
          
          // Save new information to localStorage
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          return updatedProfile;
        }
      } catch (profileError) {
        console.error('Error calling getUserProfile API:', profileError);
      }
      
      // If API fails, use data from localStorage
      console.warn('Cannot get profile from API, trying localStorage');
      
      // Check profile in localStorage
      const storedProfileStr = localStorage.getItem('profile');
      if (storedProfileStr) {
        try {
          const storedProfile = JSON.parse(storedProfileStr);
          console.warn('Using profile from localStorage due to API error');
          
          // Ensure profile has both user_id and id
          return {
            ...storedProfile,
            user_id: storedProfile.user_id || userId,
            id: storedProfile.id || userId
          };
        } catch (e) {
          console.error('Error parsing profile from localStorage:', e);
        }
      }
      
      // Finally, return user info from localStorage
      console.warn('Using information from currentUser as profile');
      return currentUser;
    } catch (error) {
      console.error('Error getting profile:', error);
      return currentUser;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const response = await UserService.updateUserProfile(userId, updateData);
      
      // Update information in localStorage if update is successful
      if (response && response.data) {
        // Save new information to localStorage
        localStorage.setItem('profile', JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      if (error.response.status === 500) {
        return new Error('System error, please try again later');
      }
      if (error.response.status === 401) {
        // Remove token and user if unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return new Error('Your session has expired, please login again');
      }
      return new Error(message);
    }
    return error;
  }
  
  registerPT(userData, certificates) {
    const formData = new FormData();
    
    // Add user information to formData
    formData.append('username', userData.username);
    formData.append('password', userData.password);
    formData.append('role_id', 3); // Ensure role_id is 3 for PT
    formData.append('gym', userData.gym);
    
    // Add certificate files to formData
    certificates.forEach(certificate => {
      formData.append('certificates', certificate);
    });

    return axios.post('http://localhost:3000/auth/register-pt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      // Ensure user data is valid before saving to localStorage
      if (response.data && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
        }
        
        // Trigger login event to update UI
        window.dispatchEvent(new Event('login'));
      }
      return response;
    });
  }
  
  async checkUserStatus() {
    try {
      // Check if user is logged in
      if (!this.isLoggedIn()) {
        console.warn('User not logged in, cannot check status');
        return { isActive: false, status_id: null, status_name: 'Not Logged In' };
      }
      
      // Add logs for debugging
      console.log('Token:', localStorage.getItem('token'));
      const headers = this.getAuthHeader();
      console.log('Headers:', headers);
      
      // Call API to check status using GET instead of PUT
      const response = await axios.get('http://localhost:3000/users/status', {
        headers: headers
      });
      
      console.log('API response:', response.data);
      
      if (response.data && response.data.status === 'success') {
        const userData = response.data.data;
        const isActive = userData.status_id === 2; // 2 = Active
        
        return {
          isActive,
          status_id: userData.status_id,
          status_name: userData.status_name,
          role_id: userData.role_id,
          user_id: userData.user_id,
          username: userData.username
        };
      } else {
        // If API doesn't return valid data
        console.warn('API returned invalid data:', response.data);
        return { isActive: false, status_id: null, status_name: 'Unknown' };
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      
      // Show detailed error for debugging
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      // Handle 401 error (Unauthorized)
      if (error.response && error.response.status === 401) {
        // Clear login information
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        return { 
          isActive: false, 
          status_id: null, 
          status_name: 'Session Expired',
          error: 'Your session has expired, please login again'
        };
      }
      
      return { 
        isActive: false, 
        status_id: null, 
        status_name: 'Error',
        error: error.message || 'An error occurred while checking status'
      };
    }
  }
}

export default new AuthService();