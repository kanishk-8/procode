import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Dummy data
  const stats = {
    completedCourses: 12,
    totalScore: 850,
    activeDays: 45,
    rank: "Gold",
    projectsCompleted: 8,
    submissions: 124,
  };

  const recentActivity = [
    {
      type: "submission",
      course: "Advanced JavaScript",
      score: 95,
      date: "2 hours ago",
    },
    { type: "certificate", course: "React Fundamentals", date: "1 day ago" },
    { type: "achievement", title: "10 Day Streak", date: "2 days ago" },
  ];

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen py-24 px-4 md:px-8 bg-gradient-to-b from-zinc-900 to-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-400">Welcome back, {user.username}</p>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20">
              New Project
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div
              key={key}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <p className="text-zinc-400 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-2xl font-bold text-white mt-2">{value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-grow space-y-6">
            {/* Recent Activity */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 text-zinc-300 p-3 rounded-lg bg-white/5"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center 
                      ${
                        activity.type === "submission"
                          ? "bg-green-500/20 text-green-400"
                          : activity.type === "certificate"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {activity.type[0].toUpperCase()}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">
                        {activity.course || activity.title}
                      </p>
                      <p className="text-sm text-zinc-500">{activity.date}</p>
                    </div>
                    {activity.score && (
                      <div className="text-green-400 font-bold">
                        {activity.score}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Progress */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Current Progress
              </h2>
              <div className="space-y-4">
                <div className="w-full bg-white/5 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
                <p className="text-zinc-400">75% through current course</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-80 space-y-6">
            {/* Profile Card */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white mb-4">
                  {user.username[0].toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {user.username}
                </h3>
                <p className="text-zinc-400">{user.email}</p>
                <div className="mt-4 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  {user.role}
                </div>
              </div>
            </div>

            {/* Quick Settings */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Quick Settings
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-zinc-400">Email Notifications</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-blue"
                    defaultChecked
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-zinc-400">Dark Mode</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-blue"
                    defaultChecked
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-zinc-400">Public Profile</span>
                  <input type="checkbox" className="toggle toggle-blue" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
