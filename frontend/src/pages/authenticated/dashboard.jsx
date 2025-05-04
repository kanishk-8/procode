import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import TeacherDashboard from "../../components/dashboard/TeacherDashboard";
import StudentDashboard from "../../components/dashboard/StudentDashboard";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (user) {
        try {
          const endpoint =
            user.role === "student"
              ? API_ENDPOINTS.STUDENT_DASHBOARD
              : API_ENDPOINTS.TEACHER_DASHBOARD;

          const response = await fetch(endpoint, {
            method: "GET",
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to fetch dashboard data");
          }

          const data = await response.json();
          setStats(data.stats);
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-white text-xl">
          Please log in to view dashboard
        </div>
      </div>
    );

  // Simplified default stats based on actual server response
  const defaultStats =
    user?.role === "teacher"
      ? {
          totalStudents: 0,
          activeBatches: 0,
          totalQuestions: 0,
          totalBlogs: 0,
          verifiedBlogs: 0,
          recentActivity: [],
          questionAttemptStats: [],
          topStudents: [],
        }
      : {
          totalAttempted: 0,
          completedQuestions: 0,
          averageScore: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          partialAnswers: 0,
          recentActivity: [],
        };

  const dashboardStats = stats || defaultStats;

  return (
    <div className="min-h-screen py-24 px-4 md:px-8 ">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-400">Welcome back, {user.username}</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>

        {user.role === "teacher" ? (
          <TeacherDashboard stats={dashboardStats} />
        ) : (
          <StudentDashboard stats={dashboardStats} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
