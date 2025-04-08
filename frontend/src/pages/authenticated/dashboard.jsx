import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div>
      <Link to="/codingSpace">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Coding Space
        </button>
      </Link>
    </div>
  );
};

export default Dashboard;
