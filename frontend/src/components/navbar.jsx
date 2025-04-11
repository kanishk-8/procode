import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const user = useAuth().user;
  const isLoggedIn = user !== null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center">
      <div className="flex justify-between w-[90%] mt-4 rounded-4xl h-16 items-center bg-white/10 backdrop-blur-lg text-white p-4 px-8 ">
        <Link to="/" className="flex items-center text-2xl font-bold">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
          <span className="text-lg font-bold">ProCode</span>
        </Link>

        <nav className="flex space-x-4">
          <Link to="/" className="hover:text-gray-200 text-lg font-bold">
            Home
          </Link>

          {!isLoggedIn ? (
            <Link to="/login" className="hover:text-gray-200 text-lg font-bold">
              Login
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="hover:text-gray-200 text-lg font-bold"
            >
              Dashboard
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
