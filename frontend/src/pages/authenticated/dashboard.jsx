import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth(); // Get user from context

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard!</h1>
      <p className="mb-4">Hello, {user ? user.username : "Guest"}!</p>
      <Link to="/codingSpace">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Coding Space
        </button>
      </Link>
    </div>
  );
};

export default Dashboard;
