import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (user && user.role === "student") {
        try {
          const response = await axios.get(API_ENDPOINTS.STUDENT_DASHBOARD, {
            withCredentials: true,
          });
          setStats(response.data.stats);
        } catch (err) {
          console.error("Error fetching dashboard stats:", err);
          setError("Failed to load dashboard data");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
      <div className="text-red-500 text-xl">{error}</div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
      <div className="text-white text-xl">Please log in to view dashboard</div>
    </div>
  );

  // Use real data from API if available, otherwise use empty defaults
  const dashboardStats = stats || {
    totalAttempted: 0,
    completedQuestions: 0,
    averageScore: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    partialAnswers: 0,
    highestScore: 0,
    totalBatches: 0,
    recentActivity: [],
  };

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
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <p className="text-zinc-400">Total Attempted</p>
            <p className="text-2xl font-bold text-white mt-2">{dashboardStats.totalAttempted}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <p className="text-zinc-400">Completed Questions</p>
            <p className="text-2xl font-bold text-white mt-2">{dashboardStats.completedQuestions}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <p className="text-zinc-400">Average Score</p>
            <p className="text-2xl font-bold text-white mt-2">{dashboardStats.averageScore.toFixed(1)}%</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <p className="text-zinc-400">Correct Answers</p>
            <p className="text-2xl font-bold text-green-400 mt-2">{dashboardStats.correctAnswers}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <p className="text-zinc-400">Highest Score</p>
            <p className="text-2xl font-bold text-yellow-400 mt-2">{dashboardStats.highestScore}%</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <p className="text-zinc-400">Total Batches</p>
            <p className="text-2xl font-bold text-blue-400 mt-2">{dashboardStats.totalBatches}</p>
          </div>
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
                {dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                  dashboardStats.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 text-zinc-300 p-3 rounded-lg bg-white/5"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center 
                        ${
                          activity.status === "correct"
                            ? "bg-green-500/20 text-green-400"
                            : activity.status === "partially_correct"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {activity.status === "correct" ? "✓" : activity.status === "partially_correct" ? "P" : "✕"}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">{activity.questionTitle}</p>
                        <p className="text-sm text-zinc-500">
                          {activity.batchName} • {new Date(activity.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`font-bold ${
                        activity.status === "correct" 
                          ? "text-green-400" 
                          : activity.status === "partially_correct"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}>
                        {activity.score}%
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500">No recent activity</p>
                )}
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Performance Distribution
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-full bg-green-500/20 rounded-lg p-4 mb-2">
                    <span className="text-2xl font-bold text-green-400">
                      {dashboardStats.correctAnswers}
                    </span>
                  </div>
                  <p className="text-zinc-400">Correct</p>
                </div>
                <div>
                  <div className="w-full bg-yellow-500/20 rounded-lg p-4 mb-2">
                    <span className="text-2xl font-bold text-yellow-400">
                      {dashboardStats.partialAnswers}
                    </span>
                  </div>
                  <p className="text-zinc-400">Partial</p>
                </div>
                <div>
                  <div className="w-full bg-red-500/20 rounded-lg p-4 mb-2">
                    <span className="text-2xl font-bold text-red-400">
                      {dashboardStats.incorrectAnswers}
                    </span>
                  </div>
                  <p className="text-zinc-400">Incorrect</p>
                </div>
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

            {/* Progress Summary */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Progress Summary
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-400">Completion Rate</span>
                    <span className="text-zinc-300">
                      {dashboardStats.totalAttempted > 0 
                        ? Math.round((dashboardStats.completedQuestions / dashboardStats.totalAttempted) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${dashboardStats.totalAttempted > 0 
                          ? Math.round((dashboardStats.completedQuestions / dashboardStats.totalAttempted) * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-400">Accuracy Rate</span>
                    <span className="text-zinc-300">
                      {dashboardStats.completedQuestions > 0 
                        ? Math.round((dashboardStats.correctAnswers / dashboardStats.completedQuestions) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ 
                        width: `${dashboardStats.completedQuestions > 0 
                          ? Math.round((dashboardStats.correctAnswers / dashboardStats.completedQuestions) * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
