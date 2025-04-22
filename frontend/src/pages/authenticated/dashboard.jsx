import React from "react";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  if (user === null) {
    return <div>Loading...</div>;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen w-full p-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900 rounded-lg p-6 shadow-lg">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-4xl text-zinc-400">
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="flex-grow">
              <h1 className="text-2xl font-bold text-white mb-4">
                {user.username}
              </h1>
              <div className="space-y-2 text-zinc-300">
                <p>
                  <span className="text-zinc-500">Email:</span> {user.email}
                </p>
                <p>
                  <span className="text-zinc-500">Role:</span> {user.role}
                </p>
                <p>
                  <span className="text-zinc-500">User ID:</span> {user.userId}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-6 text-right">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
