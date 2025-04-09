import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="w-[90%] flex bg-gray-800 h-2/3 rounded-2xl">
      <div className="flex flex-col justify-center items-center w-full">
        <h1 className="text-white text-5xl font-bold mb-4">
          Welcome to CodeCrack
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Your ultimate coding challenge platform
        </p>
        <Link to={"/signup"}>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
            Get Started
          </button>
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center w-full">
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
