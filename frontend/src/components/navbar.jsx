import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();
  const isLoggedIn = user !== null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-4">
      <div className="flex justify-between w-[90%] mt-4 rounded-4xl h-16 items-center bg-white/10 backdrop-blur-lg text-white p-4 px-8 ">
        <Link to="/" className="flex items-center text-2xl font-bold">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
          <span className="text-lg font-bold">ProCode</span>
        </Link>

        {!isLoggedIn ? (
          <nav className="flex space-x-10 mr-3">
            <Link to="/" className="hover:text-gray-200 text-lg font-bold">
              Home
            </Link>
            <Link to="/login" className="hover:text-gray-200 text-lg font-bold">
              Login
            </Link>
          </nav>
        ) : (
          <nav className="flex space-x-10">
            <Link
              to="/classroom"
              className="hover:text-gray-200 text-lg font-bold"
            >
              Classroom
            </Link>
            {/* <Link
              to="/dashboard"
              className="hover:text-gray-200 flex items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-lg font-bold text-zinc-400">
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </Link> */}
          </nav>
        )}
      </div>
      {isLoggedIn && (
        <Link
          to="/dashboard"
          className="mt-4 w-16 h-16 flex items-center justify-center bg-white/10 backdrop-blur-lg text-white rounded-full"
        >
          <span className="text-lg font-bold text-zinc-400">
            {user.username?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </Link>
      )}
    </div>
  );
};

export default Navbar;
