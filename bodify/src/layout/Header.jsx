import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserCircle,
  faDumbbell,
  faUserPlus,
  faHouseUser,
} from "@fortawesome/free-solid-svg-icons";
import AuthService from "../services/auth.service";

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const checkLoginStatus = () => {
    try {
      // Sử dụng AuthService để lấy thông tin người dùng
      const user = AuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setShowAccount(true);
      } else {
        setCurrentUser(null);
        setShowAccount(false);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      setCurrentUser(null);
      setShowAccount(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();

    // Thêm event listener để lắng nghe thay đổi localStorage
    window.addEventListener("storage", checkLoginStatus);

    // Custom event để handle login
    window.addEventListener("login", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("login", checkLoginStatus);
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
    <div className="">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-6">
        <Link to="/" className="flex-shrink-0">
          <img
            src="/icon/logo.svg"
            alt="Logo"
            className="h-10 w-auto md:ml-10 cursor-pointer"
          />
        </Link>
        {/* Desktop menu */}
        <ul className="hidden md:flex gap-10 items-center text-lg font-semibold tracking-wide">
          <li>
            <Link
              to="/"
              className="text-gray-600 hover:text-orange-500 transition duration-300 ease-in-out"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/exercise"
              className="text-gray-600 hover:text-orange-500 transition duration-300 ease-in-out"
            >
              Exercise
            </Link>
          </li>
          <li>
            <Link
              to="/gyms"
              className="text-gray-600 hover:text-orange-500 transition duration-300 ease-in-out"
            >
              Gyms
            </Link>
          </li>
          <li>
            <Link
              to="/pt-list"
              className="text-gray-600 hover:text-orange-500 transition duration-300 ease-in-out"
            >
              PT List
            </Link>
          </li>
        </ul>

        {/* Hiển thị nút Sign up nếu chưa đăng nhập */}
        {!showAccount && (
          <div className="hidden md:flex gap-4 mr-10">
            <Link to="/register-pt">
              <button className="bg-gradient-to-r from-[#ffd26a] to-primary-500 text-white px-8 py-2 rounded-full">
                Register PT
              </button>
            </Link>
            <button
              className="border border-primary-500 text-primary-500 px-8 py-2 rounded-full"
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
          <div className="relative hidden md:block">
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
                {/* Hiển thị Dashboard đầu tiên cho Gym Owner */}
                {currentUser && currentUser.role_id === 4 && (
                  <Link
                    to="/"
                    className="block px-4 py-2 text-black hover:rounded-md hover:bg-gray-200"
                  >
                    DashBoard
                  </Link>
                )}

                <Link
                  to="/userprofile"
                  className="block px-4 py-2 text-black hover:rounded-md hover:bg-gray-200"
                >
                  User Profile
                </Link>

                {currentUser && currentUser.role_id === 3 && (
                  <>
                    <Link
                      to="/pt/exercises"
                      className="block px-4 py-2 text-black hover:rounded-md hover:bg-gray-200"
                    >
                      Create Exercies
                    </Link>
                    {/* Ẩn Dashboard theo yêu cầu */}
                    {/* <Link
                      to="/"
                      className="block px-4 py-2 text-black hover:rounded-md hover:bg-gray-200"
                    >
                      DashBoard
                    </Link> */}
                  </>
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

        {/* Hamburger icon for mobile */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <svg
            className="w-7 h-7 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {showMobileMenu ? (
              null
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Mobile menu overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex flex-col">
            <div className="bg-white w-4/5 max-w-xs h-full shadow-lg flex flex-col p-6">
              <div className="flex justify-between items-center mb-6">
                <Link to="/" onClick={() => setShowMobileMenu(false)}>
                  <img
                    src="/icon/logo.svg"
                    alt="Logo"
                    className="h-10 w-auto"
                  />
                </Link>
                <button
                  className="p-2"
                  onClick={() => setShowMobileMenu(false)}
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <ul className="flex flex-col gap-4 text-lg font-medium">
                <Link
                  to="/"
                  className="px-4 py-2 rounded-full items-center gap-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FontAwesomeIcon icon={faHouseUser} className="text-orange-500 pr-3" />
                  Home
                </Link>
                <Link
                  to="/exercise"
                  className="px-4 py-2 rounded-full items-center gap-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FontAwesomeIcon icon={faDumbbell} className="text-orange-500 pr-3" />
                  Exercise
                </Link>
                <Link
                  to="/gyms"
                  className="px-4 py-2 rounded-full items-center gap-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="text-orange-500 pr-5" />
                  Gyms
                </Link>
                <Link
                  to="/pt-list"
                  className="px-4 py-2 rounded-full items-center gap-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FontAwesomeIcon icon={faUserPlus} className="text-orange-500 pr-3" />
                  PT List
                </Link>
              </ul>
            <div className="border-b border-gray-300 my-4"></div>
              {/* Mobile login/register/account */}
              <div className=" flex flex-col gap-3">
                {!showAccount ? (
                  <>
                    <Link to="/register-pt" onClick={() => setShowMobileMenu(false)}>
                      <button className="w-full bg-gradient-to-r from-[#ffd26a] to-primary-500 text-white px-6 py-2 rounded-full">
                        Register PT
                      </button>
                    </Link>
                    <button
                      className="w-full border border-primary-500 text-primary-500 px-6 py-2 rounded-full"
                      onClick={() => {
                        setShowMobileMenu(false);
                        navigate("/sign-in");
                      }}
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/userprofile"
                      className="w-full px-4 py-2 rounded-full text-left"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      User Profile
                    </Link>
                    {currentUser && currentUser.role_id === 3 && (
                      <Link
                        to="/pt/exercises"
                        className="w-full px-4 py-2 rounded-full text-left"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Create Exercises
                      </Link>
                    )}
                    {currentUser && currentUser.role_id === 4 && (
                      <>
                        <Link
                          to="/"
                          className="w-full px-4 py-2 rounded-full text-left"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          DashBoard
                        </Link>
                        <Link
                          to="/gymowner/approve-exercises"
                          className="w-full px-4 py-2 rounded-full text-left"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          Approve
                        </Link>
                      </>
                    )}
                    <button
                      className="w-full px-4 py-2 rounded-full text-left"
                      onClick={() => {
                        setShowMobileMenu(false);
                        handleLogout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Click outside to close */}
            <div
              className="flex-1"
              onClick={() => setShowMobileMenu(false)}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
