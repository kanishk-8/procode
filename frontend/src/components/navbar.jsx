import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const user = useAuth().user; // Get user from context
  const isLoggedIn = user !== null; // Check if user is logged in

  return (
    <div className="flex justify-between items-center bg-gray-800 text-white p-4">
      <div className="flex items-center">
        <span className="text-lg font-bold">CodeCrack</span>
      </div>
      <nav className="flex space-x-4">
        <Link to="/" className="hover:text-gray-300">
          Home
        </Link>

        {!isLoggedIn ? (
          <Link to="/login" className="hover:text-gray-300">
            Login
          </Link>
        ) : (
          <Link to="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
