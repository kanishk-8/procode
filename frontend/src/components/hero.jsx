import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="w-[90%] flex flex-col md:flex-row bg-gray-400/20 h-full rounded-2xl">
      <div className="flex flex-col justify-center items-center w-full p-8 md:p-10">
        <h1 className="text-white text-4xl md:text-6xl font-bold mb-6 leading-tight text-center md:text-left">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Elevate
          </span>{" "}
          Your Coding
        </h1>

        <p className="text-gray-300 text-base md:text-lg mb-8 max-w-lg text-center md:text-left">
          A comprehensive platform for learning, assessment, and student
          management. Join us to enhance your coding skills and prepare for
          success in the tech industry.
        </p>
        <Link to={"/signup"}>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-medium shadow-lg">
            Get Started
          </button>
        </Link>
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
