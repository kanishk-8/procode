import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// Check if a previous session exists in storage
const hasPreviousSession = () => {
  return localStorage.getItem("hadSession") === "true";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(hasPreviousSession());

  // Use cookie-based authentication to check current user status
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/currentUser", {
        method: "GET",
        credentials: "include", // Important: Includes cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, clear user state and session flag
          setUser(null);
          localStorage.removeItem("hadSession");
          setIsLoggedIn(false);
          return;
        }
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data.user);
      setError(null);
      // Mark that we've had a session before
      localStorage.setItem("hadSession", "true");
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Error fetching current user:", err);
      setError(err.message);
      setUser(null);
      localStorage.removeItem("hadSession");
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  // Check authentication status only if we had a previous session
  useEffect(() => {
    if (hasPreviousSession()) {
      fetchCurrentUser();
    } else {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        credentials: "include", // Important: Includes cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      setUser(data.user);
      setError(null);
      // Mark that we've had a session after successful login
      localStorage.setItem("hadSession", "true");
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/logout", {
        method: "GET",
        credentials: "include", // Important: Includes cookies in the request
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setError(null);
      // Clear session marker
      localStorage.removeItem("hadSession");
      setIsLoggedIn(false);
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Method to refresh user data when needed
  const refreshUser = () => {
    if (isLoggedIn) {
      fetchCurrentUser();
    }
  };

  const authContextValue = {
    user,
    login,
    logout,
    loading,
    error,
    refreshUser,
    isInitialized,
    isLoggedIn,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
