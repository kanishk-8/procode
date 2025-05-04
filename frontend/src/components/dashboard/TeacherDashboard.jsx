import React from "react";
import { Line } from "react-chartjs-2";
import ActivityFeed from "./ActivityFeed";
import StatsGrid from "./StatsGrid";

const TeacherDashboard = ({ stats }) => {
  if (!stats) {
    return <div>Loading dashboard data...</div>;
  }

  // Ensure all required arrays exist
  const questionAttemptStats = stats.questionAttemptStats || [];
  const topStudents = stats.topStudents || [];
  const recentBatches = stats.recentBatches || [];

  const questionAttemptData = {
    labels: questionAttemptStats.map((q) => q.questionTitle || "Untitled"),
    datasets: [
      {
        label: "Average Score",
        data: questionAttemptStats.map((q) => q.avgScore || 0),
        borderColor: "rgb(59, 130, 246)",
        tension: 0.1,
      },
      {
        label: "Attempt Count",
        data: questionAttemptStats.map((q) => q.attemptCount || 0),
        borderColor: "rgb(34, 197, 94)",
        tension: 0.1,
      },
    ],
  };

  const teacherStats = [
    {
      label: "Total Students",
      value: stats.totalStudents > 0 ? stats.totalStudents : "No",
      color: "blue",
    },
    {
      label: "Active Batches",
      value: stats.activeBatches > 0 ? stats.activeBatches : "No",
      color: "green",
    },
    {
      label: "Total Questions",
      value: stats.totalQuestions > 0 ? stats.totalQuestions : "No",
      color: "purple",
    },
    {
      label: "Average Score",
      value:
        stats.averageBatchScore > 0
          ? `${Number(stats.averageBatchScore).toFixed(1)}%`
          : "No scores yet",
      color: "yellow",
    },
    {
      label: "Total Blogs",
      value: stats.totalBlogs > 0 ? stats.totalBlogs : "No",
      color: "indigo",
    },
    {
      label: "Verified Blogs",
      value: stats.verifiedBlogs > 0 ? stats.verifiedBlogs : "No",
      color: "green",
    },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={teacherStats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Question Performance
          </h2>
          <Line
            data={questionAttemptData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: "rgba(255,255,255,0.1)" },
                  ticks: { color: "rgba(255,255,255,0.7)" },
                },
                x: {
                  grid: { color: "rgba(255,255,255,0.1)" },
                  ticks: { color: "rgba(255,255,255,0.7)" },
                },
              },
            }}
          />
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Top Students</h2>
          <div className="space-y-4">
            {topStudents.map((student, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">
                    {student.username || "Unknown"}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {student.completedQuestions || 0} questions completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">
                    {(student.avgScore || 0).toFixed(1)}%
                  </p>
                  <p className="text-sm text-zinc-400">
                    {student.batchCount || 0} batches
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ActivityFeed recentActivity={recentBatches} type="teacher" />
    </div>
  );
};

export default TeacherDashboard;
