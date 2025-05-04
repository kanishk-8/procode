import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Add redirect for logged in users
  useEffect(() => {
    if (user) {
      navigate("/classroom", { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!username.trim()) return "Username is required.";
    if (!email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!userId.trim())
      return `${role === "student" ? "Student" : "Teacher"} ID is required.`;
    return null;
  };

  const RegisterHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    setError("");
    try {
      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, userId, role }),
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log("Signed up:", data);
        navigate("/login", { replace: true });
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex flex-col md:flex-row">
      {/* Left side with welcome text */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden ml-10">
        <div className="absolute inset-0  flex flex-col justify-center px-12">
          <h2 className="text-7xl font-bold text-white mb-4">Join ProCode</h2>
          <p className="text-2xl text-white/90 max-w-md">
            Start your coding journey today and become part of our learning
            community.
          </p>
        </div>
      </div>

      {/* Signup Form - Right Side */}
      <div className="flex-1 flex items-start md:items-center justify-center p-4 md:p-10 bg-gradient-to-br overflow-y-auto">
        <div className="w-full max-w-md p-6 bg-white/10 backdrop-blur-2xl shadow-xl rounded-xl">
          <h1 className="text-2xl font-bold mb-4 text-center text-white">
            Create Account
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-3 py-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={RegisterHandler}>
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
                placeholder="Choose a username"
                className="w-full p-2 bg-white/5 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300 block mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full p-2 bg-white/5 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-300 block mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  className="w-full p-2 bg-white/5 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="userId"
                  className="text-sm font-medium text-gray-300 block mb-1"
                >
                  {role === "teacher" ? "Teacher ID" : "Student ID"}
                </label>
                <input
                  id="userId"
                  type="text"
                  placeholder={`Enter ID`}
                  className="w-full p-2 bg-white/5 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={loading}
                />
              </div>
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
                placeholder="Create a password"
                className="w-full p-2 bg-white/5 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={password}
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
                  Creating...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-4 text-center text-gray-300">
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
