import React, { useState, useEffect } from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import { useLocation, useNavigate } from "react-router-dom";
import AuthService from "../../services/auth.service";

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
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
        if (!username || !email || !password) {
          setError("Please fill in all fields");
          return;
        }
        await AuthService.register(username, email, password);
        navigate("/sign-in"); // Redirect to sign in after successful registration
      } else {
        if (!username || !password) {
          setError("Please fill in all fields");
          return;
        }
        const response = await AuthService.login(username, password);
        if (response.access_token) {
          navigate("/"); // Redirect to home page after successful login
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred during authentication");
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
                ? "New to this site? Log In"
                : "Already a member? Sign Up"}
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
                type="email"
                placeholder="Email"
                className="w-full py-2 border-b-2 border-gray-300 focus:border-orange-400 outline-none text-gray-400 placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-4 text-gray-500">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        {/* Social login buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          {/* Facebook button */}
          <a href="#facebook-login" className="inline-block">
            <FacebookIcon />
          </a>

          <a href="#google-login" className="inline-block">
            <GoogleIcon />
          </a>
        </div>

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
