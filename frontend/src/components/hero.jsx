import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="w-[90%] flex flex-col md:flex-row bg-gray-400/20 min-h-[400px] md:h-full rounded-2xl">
      <div className="flex flex-col justify-center items-center md:items-start w-full p-4 md:p-10">
        <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight text-center md:text-left">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Elevate
          </span>{" "}
          Your Coding
        </h1>

        <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 md:mb-8 max-w-lg text-center md:text-left px-4 md:px-0">
          A comprehensive platform for learning, assessment, and student
          management. Join us to enhance your coding skills and prepare for
          success in the tech industry.
        </p>
        <Link to={"/signup"}>
          <button className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-medium shadow-lg text-sm md:text-base">
            Get Started
          </button>
        </Link>
      </div>
      <div className="flex md:hidden justify-center items-center w-full p-4 mb-4">
        <img
          src="/image.png"
          alt="Hero"
          className="w-4/5 h-auto rounded-lg shadow-lg"
        />
      </div>
      <div className="hidden md:flex flex-col justify-center items-center w-full">
        <img
          src="/image.png"
          alt="Hero"
          className="w-3/4 h-auto rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default Hero;
