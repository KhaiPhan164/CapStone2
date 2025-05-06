import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import AuthService from '../services/auth.service';

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const checkLoginStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
      setShowAccount(true);
    } else {
      setCurrentUser(null);
      setShowAccount(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    
    // Thêm event listener để lắng nghe thay đổi localStorage
    window.addEventListener('storage', checkLoginStatus);
    
    // Custom event để handle login
    window.addEventListener('login', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('login', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setShowAccount(false);
    setCurrentUser(null);
    setShowDropdown(false);
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
            src="/icon/logo.svg"
            alt="Logo"
            className="h-10 w-auto ml-10 cursor-pointer"
          />
        </Link>
        <ul className="hidden md:flex gap-7 text-black">
          <Link to="/">
            <a className="cursor-pointer hover:text-gray-400">Home</a>
          </Link>

          <Link to="/exercise">
            <a className="cursor-pointer hover:text-gray-400">Exercise</a>
          </Link>

          <Link to="/gyms">
            <a className="cursor-pointer hover:text-gray-400">Gyms</a>
          </Link>

          <Link to="/pt-list">
            <a className="cursor-pointer hover:text-gray-400">PT List</a>
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
          <div className="flex gap-4 mr-10">
            <Link to="/register-pt">
              <button className="hidden md:block bg-gradient-to-r from-[#ffd26a] to-primary-500 text-white px-8 py-2 rounded-full">
                Register PT
              </button>
            </Link>
            <button
              className="hidden md:block border border-primary-500 text-primary-500 px-8 py-2 rounded-full"
              onClick={() => {
                navigate("/sign-in");
              }}
            >
              Login
            </button>
          </div>
        )}

        {/* Hiển thị avatar và dropdown nếu đã đăng nhập */}
        {showAccount && (
          <div className="relative">
            {currentUser && currentUser.imgUrl ? (
              <img
                src={currentUser.imgUrl}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover cursor-pointer mr-10 border-2 border-primary-500"
                onClick={() => setShowDropdown(!showDropdown)}
              />
            ) : (
              <FontAwesomeIcon
                icon={faUserCircle}
                className="text-gray-400 text-3xl cursor-pointer mr-10"
                onClick={() => setShowDropdown(!showDropdown)}
              />
            )}

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-50">
                <Link
                  to="/userprofile"
                  className="block px-4 py-2 text-black hover:rounded-md hover:bg-gray-200"
                >
                  User Profile
                </Link>
                
                {currentUser && currentUser.role_id === 3 && (
                  <Link
                    to="/pt/exercises"
                    className="block px-4 py-2 text-black hover:rounded-md hover:bg-gray-200"
                  >
                    Create Exercies
                  </Link>
                )}
                
                {currentUser && currentUser.role_id === 4 && (
                  <Link
                    to="/gymowner/approve-exercises"
                    className="block px-4 py-2 text-black hover:rounded-md hover:bg-gray-200"
                  >
                    Approve
                  </Link>
                )}
                
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
    </div>
  );
};

export default Header;
