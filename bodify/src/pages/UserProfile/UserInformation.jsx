import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SectionTitle } from '../../components/Title/SectionTitle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faUpload } from "@fortawesome/free-solid-svg-icons";
import Header from '../../layout/Header';
import AuthService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const UserInformation = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phoneNum: '',
    imgUrl: '',
    name: '',
    introduction: '',
    role_id: null
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check login status
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        setError('Please login to view your personal information');
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
        return;
      }

      // Call API to get profile from AuthService
      const profile = await AuthService.getProfile();
      
      if (profile) {
        // Determine user ID from multiple sources
        const userId = profile?.user_id || profile?.id || currentUser?.user_id || currentUser?.id;
        
        // Ensure ID is saved in profile
        if (userId) {
          const updatedProfile = {
            ...profile,
            user_id: userId,
            id: userId
          };
          
          // Update localStorage
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          
          // Update userData with all data including ID
          setUserData(updatedProfile);
          
          // Update editData with necessary fields
          setEditData({
            username: updatedProfile.username || '',
            email: updatedProfile.email || '',
            phoneNum: updatedProfile.phoneNum || '',
            name: updatedProfile.name || '',
            introduction: updatedProfile.introduction || ''
          });
        } else {
          // If ID not found, still update data
          setUserData(profile);
          setEditData({
            username: profile.username || '',
            email: profile.email || '',
            phoneNum: profile.phoneNum || '',
            name: profile.name || '',
            introduction: profile.introduction || ''
          });
        }
      } else {
        setError('Unable to load personal information. Please try again later.');
      }
    } catch (error) {
      setError('Unable to load personal information: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleEditProfile = async () => {
    if (isEditingProfile) {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current user information
        const currentUser = AuthService.getCurrentUser();
        
        // Get profile from AuthService
        const profile = await AuthService.getProfile();
        
        // Determine user ID from multiple sources
        const userId = profile?.user_id || profile?.id || currentUser?.user_id || currentUser?.id;
        
        // Check userId
        if (!userId) {
          throw new Error('Unable to identify user ID. Please login again.');
        }
        
        // Create update data
        const updateData = {
          name: editData.name
        };
        
        // Add introduction if PT or Gym Owner
        if (currentUser.role_id === 3 || currentUser.role_id === 4) {
          updateData.introduction = editData.introduction || '';
        }
        
        // Check name field
        if (!updateData.name) {
          throw new Error('Name cannot be empty');
        }
        
        // Call updateProfile method from AuthService
        const result = await AuthService.updateProfile(userId, updateData);
        
        // Save new information to localStorage to ensure data is updated
        if (result) {
          // Update profile in localStorage
          const updatedProfile = {
            ...profile,
            ...updateData,
            // Ensure ID is saved in profile
            user_id: userId,
            id: userId
          };
          
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          
          // Show success message
          alert('Profile updated successfully! The page will reload to apply changes.');
          
          // Reload page to display the latest information
          window.location.reload();
        }
      } catch (error) {
        setError(error.message || 'An error occurred while updating profile');
      } finally {
        setIsLoading(false);
      }
    } else {
      // If not currently editing, start editing
      setIsEditingProfile(true);
    }
  };

  const handleEditPersonal = async () => {
    if (isEditingPersonal) {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current user information
        const currentUser = AuthService.getCurrentUser();
        
        // Get profile from AuthService
        const profile = await AuthService.getProfile();
        
        // Determine user ID from multiple sources
        const userId = profile?.user_id || profile?.id || currentUser?.user_id || currentUser?.id;
        
        // Check userId
        if (!userId) {
          throw new Error('Unable to identify user ID. Please login again.');
        }

        // Create update data
        const updateData = {};
        
        // Add fields to be updated
        if (editData.email !== undefined) {
          updateData.email = editData.email?.trim() || null;
        }
        
        if (editData.phoneNum !== undefined) {
          updateData.phoneNum = editData.phoneNum?.trim() || null;
        }
        
        if (editData.username) {
          updateData.username = editData.username.trim();
        }
        
        // Check if there's data to update
        if (Object.keys(updateData).length === 0) {
          setIsEditingPersonal(false);
          setError('No information has been changed');
          setIsLoading(false);
          return;
        }

        // Call updateProfile method from AuthService
        const updatedUser = await AuthService.updateProfile(userId, updateData);
        
        if (updatedUser) {
          // Update profile in localStorage
          const updatedProfile = {
            ...profile,
            ...updateData,
            // Ensure ID is saved in profile
            user_id: userId,
            id: userId
          };
          
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          
          // Show success message
          alert('Personal information updated successfully! The page will reload to apply changes.');
          
          // Reload page to display the latest information
          window.location.reload();
        }
      } catch (error) {
        setError(error.message || 'Unable to update information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditingPersonal(!isEditingPersonal);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current user information
        const currentUser = AuthService.getCurrentUser();
        
        // Get profile from AuthService
        const profile = await AuthService.getProfile();
        
        // Determine user ID from multiple sources
        const userId = profile?.user_id || profile?.id || currentUser?.user_id || currentUser?.id;
        
        // Check userId
        if (!userId) {
          throw new Error('Unable to identify user ID. Please login again.');
        }

        const formData = new FormData();
        formData.append('image', file);  // Change key to 'image' to match API
        // Add content-type to ensure API understands this is multipart/form-data
        
        // Call updateProfile method from AuthService to update profile picture
        const updatedUser = await AuthService.updateProfile(userId, formData);
        
        if (updatedUser) {
          // Update both userData and editData with new data from API
          setUserData(updatedUser); // Update userData directly with new data
          
          // Update profile in localStorage
          // Ensure existing fields in profile are preserved
          const updatedProfile = {
            ...profile,
            imgUrl: updatedUser.imgUrl,
            // Ensure ID is saved in profile
            user_id: userId,
            id: userId
          };
          
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          
          setEditData({
            username: updatedUser.username || '',
            email: updatedUser.email || '',
            phoneNum: updatedUser.phoneNum || '',
            name: updatedUser.name || '',
            introduction: updatedUser.introduction || ''
          });
          
          // Show success message
          alert('Profile picture updated successfully! The page will reload to display the new image.');
          
          // Reload page after successful update
          window.location.reload();
        }
      } catch (error) {
        setError(error.message || 'Unable to update profile picture');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex h-full bg-gray-100'>
        <div className="w-full">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <h1 className="text-2xl font-semibold mb-3 text-gray-700">
            Personal Information
          </h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="relative group">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <img 
                    alt={`Profile picture of ${userData.name || 'User'}`} 
                    className="w-16 h-16 rounded-full mr-4 object-cover cursor-pointer"
                    src={userData.imgUrl || "https://storage.googleapis.com/a1aa/image/cD-sKP-sj6D5N0EfMvBgXVgHCnSaBHEl4rdOuhfaNkQ.jpg"} 
                    onClick={handleAvatarClick}
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center rounded-full mr-4 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <div className="text-white text-center">
                      <FontAwesomeIcon icon={faEdit} className="text-xl mb-1" />
                      <div className="text-xs">Change</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary-500">
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editData.name || userData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="border-b-2 border-gray-300 focus:border-orange-400 outline-none px-2 py-1"
                        placeholder="Enter your name"
                      />
                    ) : (
                      userData.name || 'No name'
                    )}
                  </h2>
                </div>
              </div>
              <button 
                className={`text-text py-1 px-3 rounded text-xs border-2 border-gray-200 flex items-center justify-center gap-1 hover:bg-slate-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleEditProfile}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                {isEditingProfile ? 'Save' : 'Edit'}
              </button>
            </div>
            
            {/* Add Introduction field for PT in profile section */}
            {userData.role_id === 3 && (
              <div className="mt-4 border-t pt-4">
                <label className="block text-gray-700 mb-2 font-medium">
                  PT Introduction
                </label>
                <div className="font-normal text-text">
                  {isEditingProfile ? (
                    <textarea
                      value={editData.introduction || ''}
                      onChange={(e) => handleInputChange('introduction', e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 focus:border-orange-400 outline-none"
                      placeholder="Introduce yourself to your clients"
                      rows="4"
                    />
                  ) : (
                    userData.introduction || 'No introduction provided'
                  )}
                </div>
              </div>
            )}
            
            {/* Add Introduction field for Gym Owner in profile section */}
            {userData.role_id === 4 && (
              <div className="mt-4 border-t pt-4">
                <label className="block text-gray-700 mb-2 font-medium">
                  Gym Introduction
                </label>
                <div className="font-normal text-text">
                  {isEditingProfile ? (
                    <textarea
                      value={editData.introduction || ''}
                      onChange={(e) => handleInputChange('introduction', e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 focus:border-orange-400 outline-none"
                      placeholder="Introduce your gym to potential customers"
                      rows="4"
                    />
                  ) : (
                    userData.introduction || 'No introduction provided'
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle title="Detailed information" />
              <button 
                className={`text-text py-1 px-3 rounded text-xs border-2 border-gray-200 flex items-center justify-center gap-1 hover:bg-slate-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleEditPersonal}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                {isEditingPersonal ? 'Save' : 'Edit'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Username
                </label>
                <div className="font-semibold text-text">
                  {isEditingPersonal ? (
                    <input
                      type="text"
                      value={editData.username || userData.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full border-b-2 border-gray-300 focus:border-orange-400 outline-none px-2 py-1"
                      placeholder="Enter username"
                    />
                  ) : (
                    userData.username || 'Not available'
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Password
                </label>
                <div className="font-semibold text-text">
                  ********
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Email
                </label>
                <div className="font-semibold text-text">
                  {isEditingPersonal ? (
                    <input
                      type="email"
                      value={editData.email || userData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full border-b-2 border-gray-300 focus:border-orange-400 outline-none px-2 py-1"
                      placeholder="Enter email address"
                    />
                  ) : (
                    userData.email || 'Not available'
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  Phone
                </label>
                <div className="font-semibold text-text">
                  {isEditingPersonal ? (
                    <input
                      type="tel"
                      value={editData.phoneNum === undefined ? userData.phoneNum || '' : editData.phoneNum}
                      onChange={(e) => handleInputChange('phoneNum', e.target.value)}
                      className="w-full border-b-2 border-gray-300 focus:border-orange-400 outline-none px-2 py-1"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    userData.phoneNum || 'Not available'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInformation;