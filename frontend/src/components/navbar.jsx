import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const user = useAuth().user;
  const isLoggedIn = user !== null;

  return (
    <div className="flex justify-between items-center bg-gray-800 text-white p-4">
      <Link to="/" className="flex items-center text-2xl font-bold">
        <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
        <span className="text-lg font-bold">ProCode</span>
      </Link>

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
