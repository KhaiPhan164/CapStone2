import { useState } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AuthService from "../services/auth.service";

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const [showAccount, setShowAccount] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);
  
  // Thêm effect mới để luôn làm mới thông tin profile
  useEffect(() => {
    // Hàm làm mới profile định kỳ
    const refreshInterval = setInterval(() => {
      if (AuthService.isLoggedIn()) {
        updateUserProfile();
      }
    }, 30000); // Làm mới mỗi 30 giây
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Hàm riêng để cập nhật thông tin profile
  const updateUserProfile = async () => {
    try {
      // Kiểm tra nếu người dùng đã đăng nhập
      if (!AuthService.isLoggedIn()) {
        console.log('Không đăng nhập, không cập nhật profile');
        setUserProfile(null);
        setShowAccount(false);
        return;
      }
      
      // Lấy user hiện tại
      const currentUser = AuthService.getCurrentUser();
      
      // Nếu không có user, không cần gọi API
      if (!currentUser) {
        console.log('Không tìm thấy thông tin người dùng, không cập nhật profile');
        setUserProfile(null);
        setShowAccount(false);
        return;
      }
      
      // Gọi API để lấy profile mới nhất
      const profile = await AuthService.getProfile();
      
      // Kiểm tra kết quả trả về từ getProfile
      if (profile) {
        console.log('Cập nhật profile thành công:', profile);
        setUserProfile(profile);
        setShowAccount(true);
      } else {
        console.warn('getProfile không trả về dữ liệu');
        
        // Nếu không lấy được profile, thử một lần nữa với thông tin từ localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('Sử dụng thông tin user từ localStorage làm profile');
            setUserProfile(parsedUser);
            setShowAccount(true);
          } catch (e) {
            console.error('Lỗi khi parse user data:', e);
            setUserProfile(null);
          }
        } else {
          console.warn('Không có thông tin user trong localStorage');
          setUserProfile(null);
          // Không set showAccount = false để tránh đăng xuất người dùng tự động
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      
      // Fallback: sử dụng thông tin từ localStorage nếu có lỗi
      try {
        const storedProfile = localStorage.getItem('profile');
        const userData = localStorage.getItem('user');
        
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          console.log('Sử dụng profile từ localStorage do lỗi:', parsedProfile);
          setUserProfile(parsedProfile);
          setShowAccount(true);
        } else if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('Sử dụng user từ localStorage do lỗi:', parsedUser);
          setUserProfile(parsedUser);
          setShowAccount(true);
        }
      } catch (e) {
        console.error('Lỗi khi đọc dữ liệu từ localStorage:', e);
        // Không làm gì thêm, giữ nguyên trạng thái hiện tại
      }
    }
  };
  
  // Kiểm tra trạng thái đăng nhập
  const checkLoginStatus = () => {
    console.log('Kiểm tra trạng thái đăng nhập');
    
    // Kiểm tra token trước
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Không tìm thấy token, người dùng chưa đăng nhập');
      setShowAccount(false);
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    
    const isLoggedIn = AuthService.isLoggedIn();
    console.log('Trạng thái đăng nhập:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('Người dùng không đăng nhập');
      setShowAccount(false);
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    
    const user = AuthService.getCurrentUser();
    console.log('Thông tin người dùng hiện tại:', user);
    
    setShowAccount(isLoggedIn);
    setCurrentUser(user);
    
    if (isLoggedIn && user) {
      console.log('Người dùng đã đăng nhập, cập nhật profile');
      // Luôn ưu tiên gọi API để lấy thông tin profile mới nhất
      updateUserProfile();
    } else {
      console.log('Không có thông tin người dùng hoặc không đăng nhập');
      // Nếu không đăng nhập, đảm bảo xóa userProfile
      setUserProfile(null);
    }
  };
  
  // Xử lý đăng xuất
  const handleLogout = () => {
    // Xóa tất cả thông tin người dùng khỏi localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    localStorage.removeItem('plans');
    localStorage.removeItem('exercisePosts');
    
    // Logout qua AuthService
    AuthService.logout();
    
    // Reset state
    setShowAccount(false);
    setCurrentUser(null);
    setUserProfile(null);
    setShowDropdown(false);
    
    // Đặt một thông báo cho người dùng biết họ đã đăng xuất thành công
    alert('Đăng xuất thành công!');
    
    // Chuyển hướng về trang chủ
    window.location.href = "/";
  };

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMobileMenu]);

  return (
    <div className=" ">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link to="/">
          <img
            src="./icon/logo.svg"
            alt="Logo"
            className="h-10 w-auto ml-10 cursor-pointer"
          />
        </Link>
        <ul className="hidden md:flex gap-7 text-black">
          <Link to="/">
          <a className="cursor-pointer hover:text-gray-400">
            Home
          </a>
          </Link>

          <Link to="/exercise">
          <a className="cursor-pointer hover:text-gray-400">
            Exercise
          </a>
          </Link>
          <a href="#Programs" className="cursor-pointer hover:text-gray-400">
            Programs
          </a>
          <a href="#Contact" className="cursor-pointer hover:text-gray-400">
            Contact
          </a>
        </ul>
        
        {/* Hiển thị nút Sign up nếu chưa đăng nhập */}
        {!showAccount && (
          <button
            className="hidden md:block bg-black text-white px-8 py-2 rounded-full mr-10"
            onClick={() => {
              navigate("/sign-up"); 
            }}
          >
            Sign up
          </button>
        )}
        
        {/* Hiển thị avatar và dropdown nếu đã đăng nhập */}
        {showAccount && (
          <div className="relative">
            {userProfile && userProfile.imgUrl ? (
              <img
                src={userProfile.imgUrl}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover cursor-pointer mr-10 border-2 border-primary-500"
                onClick={() => setShowDropdown(!showDropdown)}
              />
            ) : (
              <FontAwesomeIcon
                icon={faUserCircle}
                className="text-black text-3xl cursor-pointer mr-10"
                onClick={() => setShowDropdown(!showDropdown)} 
              />
            )}

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
                <Link
                  to="/userprofile"
                  className="block px-4 py-2 text-black hover:rounded-md hover:bg-gray-200"
                >
                  User Profile
                </Link>
                <Link
                  to="/register-pt"
                  className="block px-4 py-2 text-black hover:rounded-md hover:bg-gray-200"
                >
                  Register PT
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-black hover:rounded-md hover:bg-gray-200"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* ------ mobile menu -------- */}
      <div
        className={`md:hidden ${
          showMobileMenu ? "fixed w-full" : "h-0 w-0"
        } right-0 top-0 bottom-0 overflow-hidden bg-white transition-all`}
      >
        <div className="flex justify-end p-6 cursor-pointer"></div>
        <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
          <a
            onClick={() => setShowMobileMenu(false)}
            href="#Home"
            className="px-4 py-2 rounded-full inline-block"
          >
            Home
          </a>
          <a
            onClick={() => setShowMobileMenu(false)}
            href="#About"
            className="px-4 py-2 rounded-full inline-block"
          >
            About
          </a>
          <a
            onClick={() => setShowMobileMenu(false)}
            href="#Projects"
            className="px-4 py-2 rounded-full inline-block"
          >
            Projects
          </a>
          <a
            onClick={() => setShowMobileMenu(false)}
            href="#Testimonails"
            className="px-4 py-2 rounded-full inline-block"
          >
            Testimonails
          </a>
        </ul>
      </div>
    </div>
  );
};

export default Header;
