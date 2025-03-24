import React, { useState, useEffect, useRef } from 'react';
import { SectionTitle } from '../../../components/Title/SectionTitle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faCertificate } from "@fortawesome/free-solid-svg-icons";
import Header from '../../../layout/Header';
import AuthService from '../../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const PTProfile = () => {
  const [userData, setUserData] = useState({
    user_id: '',
    username: '',
    email: '',
    phoneNum: '',
    name: '',
    imgUrl: '',
    introduction: '',
    gym: null,
    certificate: {
      imgurl: ''
    }
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          navigate('/sign-in');
          return;
        }

        const response = await fetch(`/api/users/pt/${currentUser.id}`);
        if (!response.ok) {
          throw new Error('Không thể tải thông tin PT');
        }
        const profile = await response.json();
        
        if (profile) {
          setUserData(profile);
          setEditData({
            username: profile.username || '',
            email: profile.email || '',
            phoneNum: profile.phoneNum || '',
            name: profile.name || '',
            introduction: profile.introduction || ''
          });
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin:', error);
        setError('Không thể tải thông tin. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [navigate]);

  const handleEditProfile = async () => {
    if (isEditingProfile) {
      try {
        setIsLoading(true);
        setError(null);
        const currentUser = AuthService.getCurrentUser();
        
        if (!currentUser?.id) {
          throw new Error('Vui lòng đăng nhập lại');
        }

        if (!editData.name?.trim()) {
          throw new Error('Tên không được để trống');
        }

        const updateData = {
          name: editData.name.trim(),
          introduction: editData.introduction?.trim() || null
        };

        const response = await fetch(`/api/users/pt/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          throw new Error('Không thể cập nhật thông tin');
        }

        const updatedUser = await response.json();
        if (updatedUser) {
          setUserData(updatedUser);
          setEditData({
            username: updatedUser.username || '',
            email: updatedUser.email || '',
            phoneNum: updatedUser.phoneNum || '',
            name: updatedUser.name || '',
            introduction: updatedUser.introduction || ''
          });
          setError('Cập nhật thành công');
        }
      } catch (error) {
        console.error('Lỗi cập nhật hồ sơ:', error);
        setError(error.message || 'Không thể cập nhật thông tin');
      } finally {
        setIsLoading(false);
      }
    }
    setIsEditingProfile(!isEditingProfile);
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
        const currentUser = AuthService.getCurrentUser();
        
        if (!currentUser?.id) {
          throw new Error('Vui lòng đăng nhập lại');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/users/pt/${currentUser.id}/avatar`, {
          method: 'PUT',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Không thể cập nhật ảnh đại diện');
        }

        const updatedUser = await response.json();
        if (updatedUser) {
          setUserData(updatedUser);
          setError('Cập nhật ảnh đại diện thành công');
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

  const renderTabContent = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle title="Thông tin cá nhân" />
          <button 
            className={`text-text py-1 px-3 rounded text-xs border-2 border-gray-200 flex items-center justify-center gap-1 hover:bg-slate-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleEditProfile}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
            {isEditingProfile ? 'Lưu' : 'Sửa'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">
              Tên đăng nhập
            </label>
            <div className="font-semibold text-text">
              {userData.username || 'Chưa có'}
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
              Số điện thoại
            </label>
            <div className="font-semibold text-text">
              {isEditingProfile ? (
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

          <div>
            <label className="block text-gray-700 mb-2">
              Phòng tập
            </label>
            <div className="font-semibold text-text">
              {userData.gym?.name || 'Chưa có'}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 mb-2">
              Giới thiệu
            </label>
            <div className="font-semibold text-text">
              {isEditingProfile ? (
                <textarea
                  value={editData.introduction || userData.introduction || ''}
                  onChange={(e) => handleInputChange('introduction', e.target.value)}
                  className="w-full border-b-2 border-gray-300 focus:border-orange-400 outline-none px-2 py-1"
                  placeholder="Nhập giới thiệu về bản thân"
                  rows="4"
                />
              ) : (
                userData.introduction || 'Chưa có'
              )}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 mb-2">
              Bằng cấp
            </label>
            <div className="mt-2">
              {userData.certificate?.imgurl ? (
                <div className="relative group">
                  <img 
                    src={userData.certificate.imgurl} 
                    alt="Bằng cấp" 
                    className="max-w-md rounded-lg shadow-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-white text-center">
                      <FontAwesomeIcon icon={faCertificate} className="text-xl mb-1" />
                      <div className="text-xs">Xem bằng cấp</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Chưa có bằng cấp</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header/>
      <div className='flex h-screen container-auto bg-gray-100'>
        <div className="w-1/4 bg-white p-4 rounded-xl my-5">
          <ul className="space-y-4">
            <li className="cursor-pointer block p-2 text-gray-600 bg-primary-500 rounded-xl border border-red-500">
              <div className="flex items-center font-bold text-white">
                <img
                  src="./images/pt.png" 
                  alt="Ảnh đại diện"
                  className="mr-3 ml-2 w-6 h-6 filter invert" 
                />
                Thông tin PT
              </div>
            </li>
          </ul>
        </div>
        
        <div className="w-3/4 p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <h1 className="text-2xl font-semibold mb-6 text-gray-700">
            Thông tin Personal Trainer
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
                    alt={`Ảnh đại diện của ${userData.name || 'PT'}`} 
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
            </div>
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PTProfile; 