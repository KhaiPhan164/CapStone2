import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SectionTitle } from '../../components/Title/SectionTitle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import Header from '../../layout/Header';
import AuthService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const UserInformation = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phoneNum: '',
    imgUrl: '',
    name: ''
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

      // Lấy thông tin user từ localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser) {
        setError('Vui lòng đăng nhập để xem thông tin cá nhân');
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
        return;
      }

      // Cập nhật userData trực tiếp từ localStorage
      setUserData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        phoneNum: currentUser.phoneNum || '',
        name: currentUser.name || '',
        imgUrl: currentUser.imgUrl || '',
        user_id: currentUser.user_id || currentUser.id
      });

      // Cập nhật editData
      setEditData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        phoneNum: currentUser.phoneNum || '',
        name: currentUser.name || ''
      });

    } catch (error) {
      console.error('Lỗi khi tải thông tin:', error);
      setError('Không thể tải thông tin. Vui lòng thử lại.');
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
        
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const userId = currentUser?.user_id || currentUser?.id;
        
        if (!userId) {
          throw new Error('Không thể xác định ID người dùng');
        }

        const updateData = {
          username: editData.username,
          email: editData.email,
          phoneNum: editData.phoneNum,
          name: editData.name
        };

        const updatedUser = await AuthService.updateProfile(updateData);
        
        if (updatedUser) {
          // Cập nhật localStorage
          const newUserData = { ...currentUser, ...updateData };
          localStorage.setItem('user', JSON.stringify(newUserData));
          
          // Cập nhật state
          setUserData(newUserData);
          setIsEditingProfile(false);
          setError('Cập nhật thông tin thành công');
        }
      } catch (error) {
        console.error('Lỗi cập nhật thông tin:', error);
        setError(error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditingProfile(true);
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
        
        // Lấy thông tin người dùng hiện tại
        const currentUser = AuthService.getCurrentUser();
        console.log('CurrentUser trong handleAvatarChange:', currentUser);
        
        // Lấy profile từ AuthService
        const profile = await AuthService.getProfile();
        console.log('Profile từ AuthService.getProfile():', profile);
        
        // Xác định ID người dùng từ nhiều nguồn
        const userId = profile?.user_id || profile?.id || currentUser?.user_id || currentUser?.id;
        console.log('UserID được xác định:', userId);
        
        // Kiểm tra userId
        if (!userId) {
          throw new Error('Không thể xác định ID người dùng. Vui lòng đăng nhập lại.');
        }

        const formData = new FormData();
        formData.append('image', file);  // Đổi key thành 'image' cho phù hợp với API
        // Thêm content-type để đảm bảo API hiểu đây là multipart/form-data
        
        console.log(`Cập nhật ảnh đại diện với ID: ${userId}, file:`, file.name);
        
        // Gọi phương thức updateProfile từ AuthService để cập nhật ảnh đại diện
        const updatedUser = await AuthService.updateProfile(userId, formData);
        console.log('Kết quả cập nhật ảnh đại diện:', updatedUser);
        
        if (updatedUser) {
          // Cập nhật cả userData và editData với dữ liệu mới từ API
          setUserData(updatedUser); // Cập nhật userData trực tiếp với dữ liệu mới
          
          // Cập nhật profile trong localStorage
          // Đảm bảo giữ nguyên các trường có sẵn trong profile
          const updatedProfile = {
            ...profile,
            imgUrl: updatedUser.imgUrl,
            // Đảm bảo ID được Save trong profile
            user_id: userId,
            id: userId
          };
          
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          console.log('Đã cập nhật profile trong localStorage:', updatedProfile);
          
          setEditData({
            username: updatedUser.username || '',
            email: updatedUser.email || '',
            phoneNum: updatedUser.phoneNum || '',
            name: updatedUser.name || '',
          });
          
          // Hiển thị thông báo thành công
          alert('Cập nhật ảnh đại diện thành công! Trang sẽ được tải lại để hiển thị ảnh mới.');
          
          // Tải lại trang sau khi cập nhật thành công
          window.location.reload();
        }
      } catch (error) {
        console.error('Lỗi cập nhật ảnh đại diện:', error);
        setError(error.message || 'Không thể cập nhật ảnh đại diện');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className={`mb-4 p-4 rounded ${error.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

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
                alt={`Ảnh đại diện của ${userData.name || 'Người dùng'}`} 
                className="w-16 h-16 rounded-full mr-4 object-cover cursor-pointer"
                src={userData.imgUrl || "https://storage.googleapis.com/a1aa/image/cD-sKP-sj6D5N0EfMvBgXVgHCnSaBHEl4rdOuhfaNkQ.jpg"} 
                onClick={handleAvatarClick}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary-500">
                {userData.name || 'Chưa có tên'}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle title="Detailed information" />
          <button 
            className={`text-text py-1 px-3 rounded text-xs border-2 border-gray-200 flex items-center justify-center gap-1 hover:bg-slate-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleEditProfile}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
            {isEditingProfile ? 'Save' : 'Edit'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">
              Username
            </label>
            <div className="font-semibold text-text">
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editData.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full border-b-2 border-gray-300 focus:border-orange-400 outline-none px-2 py-1"
                  placeholder="Enter username"
                />
              ) : (
                userData.username || 'Not set'
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">
              Full Name
            </label>
            <div className="font-semibold text-text">
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border-b-2 border-gray-300 focus:border-orange-400 outline-none px-2 py-1"
                  placeholder="Enter full name"
                />
              ) : (
                userData.name || 'Not set'
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Email
            </label>
            <div className="font-semibold text-text">
              {isEditingProfile ? (
                <input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border-b-2 border-gray-300 focus:border-orange-400 outline-none px-2 py-1"
                  placeholder="Enter email"
                />
              ) : (
                userData.email || 'Not set'
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Phone
            </label>
            <div className="font-semibold text-text">
              {isEditingProfile ? (
                <input
                  type="tel"
                  value={editData.phoneNum || ''}
                  onChange={(e) => handleInputChange('phoneNum', e.target.value)}
                  className="w-full border-b-2 border-gray-300 focus:border-orange-400 outline-none px-2 py-1"
                  placeholder="Enter phone number"
                />
              ) : (
                userData.phoneNum || 'Not set'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInformation;