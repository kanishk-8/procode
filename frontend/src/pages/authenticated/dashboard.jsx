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
    <div className="min-h-screen py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
        <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700">
                <span className="text-4xl text-zinc-300">
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="flex-grow space-y-4">
              <h2 className="text-2xl font-bold text-white">{user.username}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700">
                  <span className="text-zinc-400">Email</span>
                  <p className="text-lg mt-1">{user.email}</p>
                </div>
                <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700">
                  <span className="text-zinc-400">Role</span>
                  <p className="text-lg mt-1 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors shadow-lg"
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
