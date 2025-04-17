import React, { useState, useEffect } from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import { useLocation, useNavigate } from "react-router-dom";
import AuthService from "../../services/auth.service";

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if current path contains "signin" or "login"
    const isSignInRoute = location.pathname.includes("sign-in");
    setIsSignUp(!isSignInRoute);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isSignUp) {
        if (!username || !name || !password) {
          setError("Vui lòng điền đầy đủ thông tin");
          return;
        }
        const userData = {
          username,
          name,
          password,
          role_id: 2
        };
        await AuthService.register(userData);
        navigate("/sign-in");
      } else {
        if (!username || !password) {
          setError("Please fill in all fields");
          return;
        }
        
        const response = await AuthService.login(username, password);
        navigate("/");
      }
    } catch (err) {
      console.error('Lỗi đăng nhập/đăng ký:', err);
      if (isSignUp) {
        setError("Tên đăng nhập đã tồn tại");
      } else {
        setError("Tài khoản hoặc mật khẩu không chính xác");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* X button */}
        <button
          className="absolute top-0 right-0 text-black text-3xl font-light"
          onClick={() => navigate("/")}
        >
          X
        </button>
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-4">
            {isSignUp ? "Sign Up" : "Log In"}
          </h1>

          <div className="text-base flex items-center gap-2 justify-center">
            <div
              className="text-gray-400 hover:text-gray-500 cursor-pointer"
              onClick={() =>
                isSignUp ? navigate("/sign-in") : navigate("/sign-up")
              }
            >
              {isSignUp
                ? "Already a member? Log In"
                : "New to this site? Sign Up"}
            </div>
          </div>
        </div>
        {/* Error message */}
        {error && (
          <div className="mb-4 text-red-500 text-center text-sm">
            {error}
          </div>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="User name"
              className="w-full py-2 border-b-2 border-gray-300 focus:border-orange-400 outline-none text-gray-400 placeholder-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {isSignUp && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="Your name"
                className="w-full py-2 border-b-2 border-gray-300 focus:border-orange-400 outline-none text-gray-400 placeholder-gray-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Password input */}
          <div className="mb-8">
            <input
              type="password"
              placeholder="Password"
              className="w-full py-2 border-b-2 border-gray-300 focus:border-orange-400 outline-none text-gray-400 placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Sign Up button */}
          <button
            type="submit"
            className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded"
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>
        {/* Or divider */}

        {isSignUp && (
          <div className="flex items-start">
            <input
              type="checkbox"
              id="publicProfile"
              className="mt-1 mr-2"
              checked={isPublicProfile}
              onChange={() => setIsPublicProfile(!isPublicProfile)}
            />
            <label htmlFor="publicProfile" className="text-gray-700">
              Sign up to this site with a public profile.
              <a
                href="#read-more"
                className="text-black font-medium ml-1 hover:underline"
              >
                Read more
              </a>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpForm;