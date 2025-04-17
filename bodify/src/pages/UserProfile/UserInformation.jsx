import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SectionTitle } from '../../components/Title/SectionTitle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import Header from '../../layout/Header';
import AuthService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import BMICalculator from './BMICalculator';

const UserInformation = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phoneNum: '',
    imgUrl: '',
    name: ''
  });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'bmi'
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

      // Kiểm tra đăng nhập
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        setError('Vui lòng đăng nhập để xem thông tin cá nhân');
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
        return;
      }

      console.log('Đang tải thông tin cá nhân cho người dùng:', currentUser);
      // Log thông tin ID của người dùng
      if (currentUser.user_id) {
        console.log('ID (user_id) từ currentUser:', currentUser.user_id);
      } else if (currentUser.id) {
        console.log('ID (id) từ currentUser:', currentUser.id);
      } else {
        console.log('Không tìm thấy ID trong currentUser:', Object.keys(currentUser));
      }

      // Gọi API để lấy profile từ AuthService
      const profile = await AuthService.getProfile();
      
      if (profile) {
        console.log('Thông tin cá nhân đã tải:', profile);
        
        // Log thông tin ID từ profile
        if (profile.user_id) {
          console.log('ID (user_id) từ profile:', profile.user_id);
        } else if (profile.id) {
          console.log('ID (id) từ profile:', profile.id);
        } else {
          console.log('Không tìm thấy ID trong profile:', Object.keys(profile));
        }
        
        // Xác định ID người dùng từ nhiều nguồn
        const userId = profile?.user_id || profile?.id || currentUser?.user_id || currentUser?.id;
        
        // Đảm bảo ID được Save vào profile
        if (userId) {
          const updatedProfile = {
            ...profile,
            user_id: userId,
            id: userId
          };
          
          // Cập nhật vào localStorage
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          
          // Cập nhật userData với toàn bộ dữ liệu đã có ID
          setUserData(updatedProfile);
          
          // Cập nhật editData với các trường cần thiết
          setEditData({
            username: updatedProfile.username || '',
            email: updatedProfile.email || '',
            phoneNum: updatedProfile.phoneNum || '',
            name: updatedProfile.name || '',
          });
        } else {
          // Nếu không tìm thấy ID, vẫn cập nhật dữ liệu
          setUserData(profile);
          setEditData({
            username: profile.username || '',
            email: profile.email || '',
            phoneNum: profile.phoneNum || '',
            name: profile.name || '',
          });
        }
      } else {
        setError('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin cá nhân:', error);
      setError('Không thể tải thông tin cá nhân: ' + (error.message || 'Lỗi không xác định'));
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
        
        // Lấy thông tin người dùng hiện tại
        const currentUser = AuthService.getCurrentUser();
        console.log('CurrentUser trong handleEditProfile:', currentUser);
        
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
        
        // Tạo dữ liệu cập nhật - chỉ cập nhật tên
        const updateData = {
          name: editData.name
        };
        
        // Kiểm tra trường name
        if (!updateData.name) {
          throw new Error('Tên không được để trống');
        }
        
        console.log(`Cập nhật hồ sơ người dùng với ID: ${userId}, dữ liệu:`, updateData);
        
        // Gọi phương thức updateProfile từ AuthService
        const result = await AuthService.updateProfile(userId, updateData);
        console.log('Kết quả cập nhật:', result);
        
        // Save thông tin mới vào localStorage để đảm bảo dữ liệu được cập nhật
        if (result) {
          // Cập nhật profile trong localStorage
          const updatedProfile = {
            ...profile,
            ...updateData,
            // Đảm bảo ID được Save trong profile
            user_id: userId,
            id: userId
          };
          
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          console.log('Đã cập nhật profile trong localStorage:', updatedProfile);
          
          // Hiển thị thông báo thành công
          alert('Cập nhật hồ sơ thành công! Trang sẽ được tải lại để áp dụng các thay đổi.');
          
          // Tải lại trang để hiển thị thông tin mới nhất
          window.location.reload();
        }
      } catch (error) {
        console.error('Lỗi cập nhật hồ sơ:', error);
        setError(error.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Nếu chưa đang chỉnh Edit, bắt đầu chỉnh Edit
      setIsEditingProfile(true);
    }
  };

  const handleEditPersonal = async () => {
    if (isEditingPersonal) {
      try {
        setIsLoading(true);
        setError(null);
        
        // Lấy thông tin người dùng hiện tại
        const currentUser = AuthService.getCurrentUser();
        console.log('CurrentUser trong handleEditPersonal:', currentUser);
        
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

        // Tạo dữ liệu cập nhật
        const updateData = {};
        
        // Thêm vào các trường thông tin cần cập nhật
        if (editData.email !== undefined) {
          updateData.email = editData.email?.trim() || null;
        }
        
        if (editData.phoneNum !== undefined) {
          updateData.phoneNum = editData.phoneNum?.trim() || null;
        }
        
        if (editData.username) {
          updateData.username = editData.username.trim();
        }
        
        // Kiểm tra xem có dữ liệu để cập nhật không
        if (Object.keys(updateData).length === 0) {
          setIsEditingPersonal(false);
          setError('Không có thông tin nào được thay đổi');
          setIsLoading(false);
          return;
        }

        console.log(`Cập nhật thông tin cá nhân với ID: ${userId}, dữ liệu:`, updateData);
        
        // Gọi phương thức updateProfile từ AuthService
        const updatedUser = await AuthService.updateProfile(userId, updateData);
        console.log('Kết quả cập nhật:', updatedUser);
        
        if (updatedUser) {
          // Cập nhật profile trong localStorage
          const updatedProfile = {
            ...profile,
            ...updateData,
            // Đảm bảo ID được Save trong profile
            user_id: userId,
            id: userId
          };
          
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          console.log('Đã cập nhật profile trong localStorage:', updatedProfile);
          
          // Hiển thị thông báo thành công
          alert('Cập nhật thông tin cá nhân thành công! Trang sẽ được tải lại để áp dụng các thay đổi.');
          
          // Tải lại trang để hiển thị thông tin mới nhất
          window.location.reload();
        }
      } catch (error) {
        console.error('Lỗi cập nhật thông tin:', error);
        setError(error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex h-full bg-gray-100'>
        <div className="w-full">
          {/* Tab Navigation */}
          <div className="flex mb-6 border-b">
            <button
              className={`py-2 px-4 mr-4 font-medium ${
                activeTab === 'profile'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Thông tin cá nhân
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'bmi'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('bmi')}
            >
              Tính BMI
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' ? (
            <>
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
                        alt={`Ảnh đại diện của ${userData.name || 'Người dùng'}`} 
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
                          <div className="text-xs">Đổi ảnh</div>
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
                            placeholder="Nhập tên của bạn"
                          />
                        ) : (
                          userData.name || 'Chưa có tên'
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
                          placeholder="Nhập tên đăng nhập"
                        />
                      ) : (
                        userData.username || 'Chưa có'
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
                          placeholder="Nhập địa chỉ email"
                        />
                      ) : (
                        userData.email || 'Chưa có'
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
                          placeholder="Nhập số điện thoại"
                        />
                      ) : (
                        userData.phoneNum || 'Chưa có'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <BMICalculator />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInformation;