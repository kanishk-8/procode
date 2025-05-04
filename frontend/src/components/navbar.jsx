import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const { user } = useAuth();
  const isLoggedIn = user !== null;
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Hide navbar for admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 p-3">
      <div className="flex justify-between w-[85%] md:w-[90%] rounded-4xl h-14 items-center bg-white/5 border border-white/10 backdrop-blur-xl text-white px-4 md:px-8">
        <Link to="/" className="flex items-center text-2xl font-bold">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-6 w-6 md:h-8 md:w-8 mr-2"
          />
          <span className="text-base md:text-lg font-bold">ProCode</span>
        </Link>

        {/* Desktop Navigation */}
        {!isLoggedIn ? (
          <nav className="hidden md:flex space-x-6 mr-3">
            {isHomePage ? (
              <>
                <ScrollLink
                  to="features"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="hover:text-gray-200 text-lg font-bold cursor-pointer"
                >
                  Home
                </ScrollLink>
                <ScrollLink
                  to="pricing"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="hover:text-gray-200 text-lg font-bold cursor-pointer"
                >
                  Pricing
                </ScrollLink>
                <ScrollLink
                  to="why-choose-us"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="hover:text-gray-200 text-lg font-bold cursor-pointer"
                >
                  Why Us
                </ScrollLink>
                <ScrollLink
                  to="contact"
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="hover:text-gray-200 text-lg font-bold cursor-pointer"
                >
                  Contact Us
                </ScrollLink>
              </>
            ) : (
              <Link
                to="/"
                className="hover:text-gray-200 text-lg font-bold flex items-center"
              >
                <img
                  src="/backButton.svg"
                  alt="Logo"
                  className="h-6 w-6 mr-2"
                />
                Back to Home
              </Link>
            )}
          </nav>
        ) : (
          <nav className="hidden md:flex space-x-6 mr-3">
            <Link
              to="/classroom"
              className="hover:text-gray-200 text-lg font-bold"
            >
              Classroom
            </Link>
            <Link to="/blogs" className="hover:text-gray-200 text-lg font-bold">
              Blogs
            </Link>
          </nav>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 w-[93%]  z-40">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="flex flex-col py-2">
              {!isLoggedIn ? (
                isHomePage ? (
                  <>
                    <ScrollLink
                      to="features"
                      spy={true}
                      smooth={true}
                      duration={500}
                      className="px-8 py-5 hover:bg-white/5 transition-colors text-white text-lg font-bold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </ScrollLink>
                    <ScrollLink
                      to="pricing"
                      spy={true}
                      smooth={true}
                      duration={500}
                      className="px-8 py-5 hover:bg-white/5 transition-colors text-white text-lg font-bold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Pricing
                    </ScrollLink>
                    <ScrollLink
                      to="why-choose-us"
                      spy={true}
                      smooth={true}
                      duration={500}
                      className="px-8 py-5 hover:bg-white/5 transition-colors text-white text-lg font-bold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Why Us
                    </ScrollLink>
                    <ScrollLink
                      to="contact"
                      spy={true}
                      smooth={true}
                      duration={500}
                      className="px-8 py-5 hover:bg-white/5 transition-colors text-white text-lg font-bold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Contact Us
                    </ScrollLink>
                  </>
                ) : (
                  <Link
                    to="/"
                    className="px-8 py-5 hover:bg-white/5 transition-colors text-white text-lg font-bold flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <img
                      src="/backButton.svg"
                      alt="Logo"
                      className="h-6 w-6 mr-2"
                    />
                    Back to Home
                  </Link>
                )
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="px-8 py-5 hover:bg-white/5 transition-colors text-white text-lg font-bold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/classroom"
                    className="px-8 py-5 hover:bg-white/5 transition-colors text-white text-lg font-bold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Classroom
                  </Link>
                  <Link
                    to="/blogs"
                    className="px-8 py-5 hover:bg-white/5 transition-colors text-white text-lg font-bold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Blogs
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden h-14 w-14 flex items-center justify-center bg-white/5 border border-white/10 backdrop-blur-xl text-white rounded-full"
      >
        <span className="text-base font-bold text-zinc-200">
          {isLoggedIn ? (
            user.username?.charAt(0)?.toUpperCase() || "U"
          ) : (
            <img src="/login.png" alt="Login" className="h-8 w-8" />
          )}
        </span>
      </button>

      {/* Desktop Navigation Link */}
      <Link
        to={isLoggedIn ? "/dashboard" : "/login"}
        className="hidden md:flex h-16 w-16 items-center justify-center bg-white/5 border border-white/10 backdrop-blur-xl text-white rounded-full"
      >
        <span className="text-lg font-bold text-zinc-200">
          {isLoggedIn ? (
            user.username?.charAt(0)?.toUpperCase() || "U"
          ) : (
            <img src="/login.png" alt="Login" className="h-10 w-10" />
          )}
        </span>
      </Link>
    </div>
  );
};

export default Navbar;
