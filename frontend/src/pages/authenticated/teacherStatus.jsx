import React, { useState, useEffect } from "react";

const dummyData = {
  stats: {
    totalBatches: 5,
    totalStudents: 120,
    questionsCreated: 45,
    averageCompletion: 78,
  },
  recentActivity: [
    {
      id: 1,
      type: "submission",
      student: "John Doe",
      question: "Binary Search",
      batch: "DSA-101",
      timestamp: "2024-01-15T10:30:00",
    },
    {
      id: 2,
      type: "question_added",
      question: "Dynamic Programming",
      batch: "DSA-102",
      timestamp: "2024-01-14T15:45:00",
    },
  ],
  batchPerformance: [
    {
      batchId: "DSA-101",
      name: "Data Structures Batch 1",
      studentsCount: 30,
      completionRate: 85,
      averageScore: 76,
    },
    {
      batchId: "DSA-102",
      name: "Data Structures Batch 2",
      studentsCount: 25,
      completionRate: 72,
      averageScore: 68,
    },
  ],
};

const CircularProgress = ({ percentage, size = 120, color = "blue" }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className={`text-${color}-500`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xl font-bold">{percentage}%</span>
    </div>
  );
};

const ActivityTimeline = ({ activities }) => (
  <div className="relative">
    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-zinc-800"></div>
    {activities.map((activity, index) => (
      <div key={activity.id} className="relative pl-8 pb-6">
        <div
          className={`absolute left-0 w-4 h-4 rounded-full border-2 ${
            activity.type === "submission"
              ? "border-green-500 bg-green-500/20"
              : "border-blue-500 bg-blue-500/20"
          }`}
        />
        <div>
          {activity.type === "submission" ? (
            <p>
              <span className="font-medium">{activity.student}</span> submitted{" "}
              <span className="text-blue-400">{activity.question}</span> in{" "}
              {activity.batch}
            </p>
          ) : (
            <p>
              New question added:{" "}
              <span className="text-blue-400">{activity.question}</span> in{" "}
              {activity.batch}
            </p>
          )}
          <p className="text-sm text-zinc-400 mt-1">
            {new Date(activity.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const BarChart = ({ data }) => {
  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.completionRate, item.averageScore))
  );

  return (
    <div className="space-y-6">
      {data.map((batch) => (
        <div key={batch.batchId} className="relative">
          <div className="flex justify-between mb-2">
            <span className="font-medium">{batch.name}</span>
            <span className="text-sm text-zinc-400">
              {batch.studentsCount} students
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-zinc-800/50 rounded-lg relative overflow-hidden group">
              <div
                className="absolute bottom-0 w-full bg-blue-500/50 transition-all duration-300 group-hover:bg-blue-500"
                style={{
                  height: `${(batch.completionRate / maxValue) * 100}%`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold">
                  {batch.completionRate}%
                </span>
                <span className="text-xs text-zinc-400">Completion</span>
              </div>
            </div>
            <div className="h-20 bg-zinc-800/50 rounded-lg relative overflow-hidden group">
              <div
                className="absolute bottom-0 w-full bg-green-500/50 transition-all duration-300 group-hover:bg-green-500"
                style={{
                  height: `${(batch.averageScore / maxValue) * 100}%`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold">
                  {batch.averageScore}%
                </span>
                <span className="text-xs text-zinc-400">Avg Score</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TeacherStatus = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>

        {/* Stats Overview with Circular Progress */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(dummyData.stats).map(([key, value]) => (
            <div
              key={key}
              className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 flex flex-col items-center"
            >
              <CircularProgress
                percentage={
                  key === "averageCompletion"
                    ? value
                    : (value / (key === "totalBatches" ? 10 : 200)) * 100
                }
                color={
                  key === "totalBatches"
                    ? "blue"
                    : key === "totalStudents"
                    ? "green"
                    : key === "questionsCreated"
                    ? "yellow"
                    : "purple"
                }
              />
              <h3 className="text-zinc-400 text-sm mt-4 text-center">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </h3>
              <p className="text-2xl font-bold mt-2">{value}</p>
            </div>
          ))}
        </div>

        {/* Performance and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-bold mb-6">Batch Performance</h2>
            <BarChart data={dummyData.batchPerformance} />
          </div>

          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <ActivityTimeline activities={dummyData.recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStatus;
