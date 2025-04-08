// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // Not logged in? Redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in? Show the page
  return children;
};

export default ProtectedRoute;
