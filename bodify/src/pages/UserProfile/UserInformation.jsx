import React, { useState, useEffect, useRef } from 'react';
import { SectionTitle } from '../../components/Title/SectionTitle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faClipboardList, faUser } from "@fortawesome/free-solid-svg-icons";
import Header from '../../layout/Header';
import AuthService from '../../services/auth.service';
import { useNavigate, useLocation } from 'react-router-dom';
import PlanListTab from './User/PlanListTab';

const UserInformation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const tabInitialized = useRef(false);
  
  // Đọc tham số URL ngay từ đầu để xác định tab mặc định
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('activeTab');
  const initialTab = tabParam === 'plans' ? 'plan' : 'profile';
  
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
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' hoặc 'plan'

  // Cập nhật tab khi URL thay đổi - kiểm soát chặt chẽ để không ghi đè lên lựa chọn của người dùng
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('activeTab');
    
    if (tabParam === 'plans') {
      console.log('Tab từ URL: plans - Đang kích hoạt tab kế hoạch tập luyện');
      setActiveTab('plan');
      
      // Đánh dấu là đã khởi tạo tab
      tabInitialized.current = true;
    }
  }, [location.search]);

  // Xử lý đặc biệt cho trang PlanList - nếu URL chứa autoOpen, không chuyển tab
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const autoOpenParam = queryParams.get('autoOpen');
    
    if (autoOpenParam) {
      console.log('Phát hiện tham số autoOpen - giữ nguyên tab hiện tại');
      // Không làm gì, giữ nguyên tab hiện tại
    }
  }, [location.search]);

  // Đảm bảo tab được cập nhật khi URL thay đổi
  useEffect(() => {
    // Log thông tin tab hiện tại để debug
    console.log('Tab hiện tại:', activeTab, 'tabInitialized:', tabInitialized.current);
  }, [activeTab]);

  // Force kiểm tra lại URL sau khi component đã render
  useEffect(() => {
    // Kiểm tra lại URL sau khi component đã render
    const checkUrlParams = () => {
      const queryParams = new URLSearchParams(location.search);
      const tabParam = queryParams.get('activeTab');
      
      if (tabParam === 'plans' && activeTab !== 'plan') {
        console.log('Kiểm tra lại URL: Cần kích hoạt tab kế hoạch tập luyện');
        setActiveTab('plan');
      }
    };
    
    // Gọi ngay lần đầu
    checkUrlParams();
    
    // Thiết lập interval để kiểm tra liên tục trong vài giây đầu
    const intervalId = setInterval(checkUrlParams, 500);
    
    // Dừng kiểm tra sau 5 giây
    setTimeout(() => {
      clearInterval(intervalId);
    }, 5000);
    
    // Cleanup khi unmount
    return () => clearInterval(intervalId);
  }, [location.search]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Kiểm tra đăng nhập
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          navigate('/sign-in');
          return;
        }

        const profile = await AuthService.getProfile();
        if (profile) {
          // Cập nhật userData với toàn bộ dữ liệu
          setUserData(profile);
          // Chỉ lấy các trường cần thiết cho form edit
          setEditData({
            username: profile.username || '',
            email: profile.email || '',
            phoneNum: profile.phoneNum || '',
            name: profile.name || ''
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
        
        if (!currentUser?.user_id && !currentUser?.id) {
          throw new Error('Vui lòng đăng nhập lại');
        }

        // Sử dụng user_id nếu có, nếu không thì dùng id (để tương thích với cả 2 cấu trúc)
        const userId = currentUser.user_id || currentUser.id;

        if (!editData.name?.trim()) {
          throw new Error('Tên không được để trống');
        }

        const updateData = {
          name: editData.name.trim()
        };

        const updatedUser = await AuthService.updateProfile(userId, updateData);
        if (updatedUser) {
          // Cập nhật cả userData và editData
          const newData = {
            ...userData,
            ...updatedUser
          };
          setUserData(newData);
          setEditData({
            username: newData.username || '',
            email: newData.email || '',
            phoneNum: newData.phoneNum || '',
            name: newData.name || ''
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

  const handleEditPersonal = async () => {
    if (isEditingPersonal) {
      try {
        setIsLoading(true);
        setError(null);
        const currentUser = AuthService.getCurrentUser();
        
        if (!currentUser?.user_id && !currentUser?.id) {
          throw new Error('Vui lòng đăng nhập lại');
        }

        // Sử dụng user_id nếu có, nếu không thì dùng id
        const userId = currentUser.user_id || currentUser.id;

        const updateData = {
          email: editData.email?.trim() || null,
          phoneNum: editData.phoneNum?.trim() || null
        };
        
        if (editData.username && editData.username.trim() !== userData.username) {
          updateData.username = editData.username.trim();
        }

        const updatedUser = await AuthService.updateProfile(userId, updateData);
        if (updatedUser) {
          // Cập nhật cả userData và editData
          const newData = {
            ...userData,
            ...updatedUser
          };
          setUserData(newData);
          setEditData({
            username: newData.username || '',
            email: newData.email || '',
            phoneNum: newData.phoneNum || '',
            name: newData.name || ''
          });
          setError('Cập nhật thành công');
        }
      } catch (error) {
        console.error('Lỗi cập nhật thông tin:', error);
        setError(error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    }
    setIsEditingPersonal(!isEditingPersonal);
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
        
        if (!currentUser?.user_id && !currentUser?.id) {
          throw new Error('Vui lòng đăng nhập lại');
        }

        // Sử dụng user_id nếu có, nếu không thì dùng id
        const userId = currentUser.user_id || currentUser.id;

        const formData = new FormData();
        formData.append('file', file);  // Giữ nguyên key 'file', auth.service sẽ đổi thành 'image'

        const updatedUser = await AuthService.updateProfile(userId, formData);
        if (updatedUser) {
          // Cập nhật cả userData và editData
          const newData = {
            ...userData,
            ...updatedUser
          };
          setUserData(newData);
          setEditData({
            username: newData.username || '',
            email: newData.email || '',
            phoneNum: newData.phoneNum || '',
            name: newData.name || ''
          });
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

  // Hàm chọn tab có kiểm soát
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Nếu người dùng chọn tab thủ công, đánh dấu là đã khởi tạo
    tabInitialized.current = true;
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
      <Header/>
      <div className='flex h-screen container-auto bg-gray-100'>
        <div className="w-1/4 bg-white p-4 rounded-xl my-5">
          <ul className="space-y-4">
            <li 
              className={`cursor-pointer block p-2 text-gray-600 ${activeTab === 'profile' ? 'bg-primary-500 rounded-xl border border-red-500' : 'hover:bg-gray-200 rounded-xl'}`}
              onClick={() => handleTabChange('profile')}
            >
              <div className={`flex items-center ${activeTab === 'profile' ? 'font-bold text-white' : ''}`}>
                <FontAwesomeIcon
                  icon={faUser} 
                  className={`mr-3 ml-2 w-6 h-6 ${activeTab === 'profile' ? 'filter invert' : ''}`} 
                />
                Thông tin cá nhân
              </div>
            </li>
            <li 
              className={`cursor-pointer block p-2 text-gray-600 ${activeTab === 'plan' ? 'bg-primary-500 rounded-xl border border-red-500' : 'hover:bg-gray-200 rounded-xl'}`}
              onClick={() => handleTabChange('plan')}
            >
              <div className={`flex items-center ${activeTab === 'plan' ? 'font-bold text-white' : ''}`}>
                <FontAwesomeIcon
                  icon={faClipboardList} 
                  className={`mr-3 ml-2 w-6 h-6 ${activeTab === 'plan' ? 'filter invert' : ''}`} 
                />
                Kế hoạch tập luyện
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
          
          {activeTab === 'profile' ? (
            <>
              <h1 className="text-2xl font-semibold mb-6 text-gray-700">
                Thông tin cá nhân
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
                    {isEditingProfile ? 'Lưu' : 'Sửa'}
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <SectionTitle title="Thông tin chi tiết" />
                  <button 
                    className={`text-text py-1 px-3 rounded text-xs border-2 border-gray-200 flex items-center justify-center gap-1 hover:bg-slate-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleEditPersonal}
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                    {isEditingPersonal ? 'Lưu' : 'Sửa'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Tên đăng nhập
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
                      Mật khẩu
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
                      Số điện thoại
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
            <div className="bg-white p-6 rounded-lg shadow-md">
              <PlanListTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInformation;