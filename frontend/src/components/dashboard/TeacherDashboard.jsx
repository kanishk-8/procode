import React from "react";
import { Line } from "react-chartjs-2";
import ActivityFeed from "./ActivityFeed";
import StatsGrid from "./StatsGrid";

const TeacherDashboard = ({ stats }) => {
  const questionAttemptData = {
    labels: stats.questionAttemptStats.map((q) => q.questionTitle),
    datasets: [
      {
        label: "Average Score",
        data: stats.questionAttemptStats.map((q) => q.avgScore),
        borderColor: "rgb(59, 130, 246)",
        tension: 0.1,
      },
      {
        label: "Attempt Count",
        data: stats.questionAttemptStats.map((q) => q.attemptCount),
        borderColor: "rgb(34, 197, 94)",
        tension: 0.1,
      },
    ],
  };

  const teacherStats = [
    { label: "Total Students", value: stats.totalStudents, color: "blue" },
    { label: "Active Batches", value: stats.activeBatches, color: "green" },
    { label: "Total Questions", value: stats.totalQuestions, color: "purple" },
    {
      label: "Average Score",
      value: `${stats.averageBatchScore.toFixed(1)}%`,
      color: "yellow",
    },
    { label: "Total Blogs", value: stats.totalBlogs, color: "indigo" },
    { label: "Verified Blogs", value: stats.verifiedBlogs, color: "green" },
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
            {stats.topStudents.map((student, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{student.username}</p>
                  <p className="text-sm text-zinc-400">
                    {student.completedQuestions} questions completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">
                    {student.avgScore.toFixed(1)}%
                  </p>
                  <p className="text-sm text-zinc-400">
                    {student.batchCount} batches
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ActivityFeed recentActivity={stats.recentBatches} type="teacher" />
    </div>
  );
};

export default TeacherDashboard;
