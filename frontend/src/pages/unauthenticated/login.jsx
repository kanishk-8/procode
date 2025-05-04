import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// Utility function for SHA-256 hashing
const sha256Hash = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate 8-digit numeric nonce
const generateNonce = () => {
  // Generate a random number between 10000000 and 99999999 (8 digits)
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, error: authError, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/classroom", { replace: true });
    }
  }, [user, navigate]);

  // Add useEffect to watch for authError changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset error state
    setError("");

    // Validate input
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      // First round of hashing
      const firstHash = await sha256Hash(password);
      
      // Generate a random nonce
      const nonce = generateNonce();
      
      // Second round of hashing with nonce
      const finalHash = await sha256Hash(firstHash + nonce);
      
      // Pass the username, final hash, and nonce to the login function
      const success = await login(username, finalHash, nonce);

      if (success) {
        // Replace current page with classroom after successful login
        navigate("/classroom", { replace: true });
      }
      // Remove the else clause that checks authError since we handle this with useEffect now
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex flex-col md:flex-row">
      {/* Image Section - Left Side */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden ml-10">
        <div className="absolute inset-0 flex flex-col justify-center px-12">
          <h2 className="text-7xl font-bold text-white mb-4">Welcome Back!</h2>
          <p className="text-2xl text-white/90 max-w-md">
            Glad to see you again. Continue your coding journey with ProCode and
            pick up right where you left off.
          </p>
        </div>
      </div>

      {/* Login Form - Right Side */}
      <div className="flex-1 flex items-start md:items-center justify-center p-4 md:p-10 bg-gradient-to-br overflow-y-auto">
        <div className="w-full max-w-md p-6 bg-white/10 backdrop-blur-2xl shadow-xl rounded-xl">
          <h1 className="text-2xl font-bold mb-4 text-center text-white">
            Sign In
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-3 py-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-300 block mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="w-full p-2 bg-white/5 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300 block mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full p-2 bg-white/5 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-800/50 disabled:text-white/50 transition-colors duration-200 mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-gray-300">
            <p>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
