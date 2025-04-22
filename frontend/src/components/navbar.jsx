import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const user = useAuth().user;
  const { logout } = useAuth();
  const isLoggedIn = user !== null;
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-4">
      <div className="flex justify-between w-[85%] mt-4 rounded-4xl h-16 items-center bg-white/10 backdrop-blur-lg text-white p-4 px-8 ">
        <Link to="/" className="flex items-center text-2xl font-bold">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
          <span className="text-lg font-bold">ProCode</span>
        </Link>

        {!isLoggedIn ? (
          <nav className="flex space-x-4">
            <Link to="/" className="hover:text-gray-200 text-lg font-bold">
              Home
            </Link>
            <Link to="/login" className="hover:text-gray-200 text-lg font-bold">
              Login
            </Link>
          </nav>
        ) : (
          <nav className="flex space-x-4">
            <Link
              to="/dashboard"
              className="hover:text-gray-200 text-lg font-bold"
            >
              Dashboard
            </Link>
            <Link
              to="/classroom"
              className="hower:text-gray-200 text-lg font-bold"
            >
              Classroom
            </Link>
          </nav>
        )}
      </div>
      {isLoggedIn && (
        <div className="flex mt-4 rounded-4xl h-16 w-16 content-center items-center bg-white/10 backdrop-blur-lg text-white p-4">
          <button
            onClick={handleLogout}
            className=" flex items-center justify-center"
          >
            <img src="/logoutwhite.png" alt="Logout" className="h-8 w-8 " />
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
