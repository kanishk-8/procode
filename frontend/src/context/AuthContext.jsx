import { createContext, useContext, useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api";

const AuthContext = createContext();

const hasPreviousSession = () => {
  return localStorage.getItem("hadSession") === "true";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(hasPreviousSession());

  // Fetch the current user using cookies
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CURRENT_USER, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
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

  // Check auth status on mount
  useEffect(() => {
    if (hasPreviousSession()) {
      fetchCurrentUser();
    } else {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // Auto-refresh token every 13 minutes
  useEffect(() => {
    let refreshInterval;

    if (isLoggedIn) {
      refreshInterval = setInterval(async () => {
        try {
          const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
            method: "GET",
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to refresh token");
          }

          const data = await response.json();
          console.log("Access token refreshed:", data.message);

          // Optional: refresh user state
          // await fetchCurrentUser();
        } catch (err) {
          console.error("Error refreshing token:", err);
          setUser(null);
          localStorage.removeItem("hadSession");
          setIsLoggedIn(false);
        }
      }, 13 * 60 * 1000); // 13 minutes
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [isLoggedIn]);

  // Add nonce parameter to the login function
  const login = async (username, hashedPassword, nonce) => {
    try {
      setLoading(true);
      setError(null); // Reset error at the start of login attempt
      
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username, 
          password: hashedPassword,
          nonce 
        }),
      });
      
      const data = await response.json();
      console.log("Login response:", response.status, data);
      
      if (!response.ok) {
        // Extract error message from response
        const errorMessage = data.message || "Login failed";
        console.log("Setting error:", errorMessage);
        setError(errorMessage);
        return false;
      }

      setUser(data.user);
      setError(null);
      localStorage.setItem("hadSession", "true");
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
      return false;
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.LOGOUT, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setError(null);
      localStorage.removeItem("hadSession");
      setIsLoggedIn(false);
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
