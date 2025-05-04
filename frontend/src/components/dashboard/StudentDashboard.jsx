import React from "react";
import { Doughnut } from "react-chartjs-2";
import ActivityFeed from "./ActivityFeed";
import StatsGrid from "./StatsGrid";

const StudentDashboard = ({ stats }) => {
  const performanceData = {
    labels: ["Correct", "Partial", "Incorrect"],
    datasets: [
      {
        data: [
          stats.correctAnswers,
          stats.partialAnswers,
          stats.incorrectAnswers,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(234, 179, 8, 0.6)",
          "rgba(239, 68, 68, 0.6)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
          "rgb(239, 68, 68)",
        ],
      },
    ],
  };

  const studentStats = [
    {
      label: "Questions Attempted",
      value: stats.totalAttempted,
      color: "blue",
    },
    {
      label: "Questions Completed",
      value: stats.completedQuestions,
      color: "green",
    },
    {
      label: "Average Score",
      value: `${stats.averageScore.toFixed(1)}%`,
      color: "yellow",
    },
    { label: "Correct Answers", value: stats.correctAnswers, color: "green" },
    { label: "Total Batches", value: stats.totalBatches, color: "indigo" },
    {
      label: "Best Performance",
      value: `${stats.highestScore}%`,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={studentStats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Performance Distribution
          </h2>
          <Doughnut
            data={performanceData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: { color: "rgba(255,255,255,0.7)" },
                },
              },
            }}
          />
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Score Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Correct Answers</span>
              <span className="text-green-400 font-bold">
                {stats.correctAnswers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Partial Answers</span>
              <span className="text-yellow-400 font-bold">
                {stats.partialAnswers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Incorrect Answers</span>
              <span className="text-red-400 font-bold">
                {stats.incorrectAnswers}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ActivityFeed recentActivity={stats.recentActivity} type="student" />
    </div>
  );
};

export default StudentDashboard;
