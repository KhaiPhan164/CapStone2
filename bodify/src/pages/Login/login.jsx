import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthService from "../../services/auth.service";

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    
    // Handle registration
    if (isSignUp) {
      try {
        if (!username || !name || !password) {
          setError("Please fill in all required information");
          setLoading(false);
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
      } catch (registerError) {
        console.error('Registration error:', registerError);
        setError("Username already exists");
        setLoading(false);
      }
      return; // Ensure code below doesn't run
    }
    
    // Handle login
    if (!username || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Logging in with username:", username);
      
      const loginResponse = await AuthService.login(username, password);
      console.log("Login result:", loginResponse);
      
      // Check if login was successful
      if (!loginResponse?.access_token) {
        throw new Error("No token received from server");
      }
      
      // Get user information
      const user = AuthService.getCurrentUser();
      console.log("User information after login:", user);
      
      // Check if user is PT (role_id = 3)
      if (user && user.role_id === 3) {
        console.log("This is a PT account, checking status...");
        
        try {
          // Use checkUserStatus method to get status_id from API
          const statusCheck = await AuthService.checkUserStatus();
          console.log("Status check result:", statusCheck);
          
          // If not active or status_id is not 2, account is not approved
          if (!statusCheck.isActive || (statusCheck.status_id !== 2 && statusCheck.status_id !== "2")) {
            console.log("PT not approved, status_id =", statusCheck.status_id);
            
            // Logout immediately
            await AuthService.logout();
            
            // Show error message and stop processing
            setError("Your PT account is pending approval. Please try again after being approved.");
            setLoading(false);
            return;
          }
          
          console.log("PT is approved, allowing login");
        } catch (statusError) {
          console.error("Error checking PT status:", statusError);
          
          // If status can't be checked, allow login but log error
          console.warn("Cannot check PT status, allowing login");
        }
      }
      
      // Login successful, redirect user
      console.log("Login successful, redirecting user");
      
      // All users are redirected to home page
      // For gym owners, the home page will automatically display dashboard
      navigate("/");
    } catch (error) {
      console.error("Error during login process:", error);
      // Ensure user-friendly error message is displayed
      setError(error.response?.data?.message || "Login failed. Please check your username and password.");
      setLoading(false);
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
            disabled={loading}
          >
            {loading ? 'Processing...' : (isSignUp ? "Sign Up" : "Log In")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;