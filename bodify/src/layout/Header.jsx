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
  
  // Kiểm tra trạng thái đăng nhập
  const checkLoginStatus = () => {
    const isLoggedIn = AuthService.isLoggedIn();
    const user = AuthService.getCurrentUser();
    
    setShowAccount(isLoggedIn);
    setCurrentUser(user);
    
    if (isLoggedIn && user) {
      // Lấy thông tin profile từ localStorage hoặc API
      try {
        const profileStr = localStorage.getItem('profile');
        if (profileStr) {
          setUserProfile(JSON.parse(profileStr));
        } else {
          // Nếu không có thông tin profile trong localStorage, có thể gọi API để lấy
          AuthService.getProfile().then(profile => {
            setUserProfile(profile);
          });
        }
      } catch (error) {
        console.error('Error getting user profile:', error);
      }
    }
  };
  
  // Xử lý đăng xuất
  const handleLogout = () => {
    AuthService.logout();
    setShowAccount(false);
    setCurrentUser(null);
    setUserProfile(null);
    setShowDropdown(false);
    navigate("/");
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
