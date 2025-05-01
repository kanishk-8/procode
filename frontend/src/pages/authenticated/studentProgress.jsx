import React from "react";

const ProgressCircle = ({ percentage, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
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
          strokeWidth={strokeWidth}
          fill="none"
          className="text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-blue-500"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xl font-bold">{percentage}%</span>
    </div>
  );
};

const ActivityChart = ({ data }) => {
  const maxValue = Math.max(...data);

  return (
    <div className="flex items-end h-24 gap-1">
      {data.map((value, index) => (
        <div
          key={index}
          className="w-3 bg-blue-500/50 hover:bg-blue-500 transition-all rounded-t"
          style={{ height: `${(value / maxValue) * 100}%` }}
        />
      ))}
    </div>
  );
};

const dummyData = {
  stats: {
    totalAssigned: 25,
    completed: 18,
    inProgress: 4,
    successRate: 72,
  },
  weeklyActivity: [4, 2, 5, 7, 3, 8, 6],
  strengthAreas: [
    { topic: "Arrays", score: 85 },
    { topic: "Trees", score: 92 },
    { topic: "Dynamic Programming", score: 65 },
    { topic: "Graphs", score: 78 },
  ],
  recentQuestions: [
    {
      id: 1,
      title: "Binary Search Implementation",
      status: "completed",
      score: 100,
    },
    { id: 2, title: "Tree Traversal", status: "completed", score: 85 },
    { id: 3, title: "Dynamic Programming", status: "in_progress", score: null },
    { id: 4, title: "Graph Algorithms", status: "assigned", score: null },
  ],
  savedNotes: [
    { id: 1, title: "Binary Search Notes", lastUpdated: "2024-01-15" },
    { id: 2, title: "Tree Traversal Techniques", lastUpdated: "2024-01-10" },
    { id: 3, title: "DP Patterns", lastUpdated: "2024-01-05" },
  ],
};

const StudentProgress = () => {
  return (
    <div className="min-h-screen py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Progress</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-zinc-400 text-sm mb-2">Total Assigned</h3>
            <p className="text-3xl font-bold">
              {dummyData.stats.totalAssigned}
            </p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-zinc-400 text-sm mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-500">
              {dummyData.stats.completed}
            </p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-zinc-400 text-sm mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-500">
              {dummyData.stats.inProgress}
            </p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-zinc-400 text-sm mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-blue-500">
              {dummyData.stats.successRate}%
            </p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Overall Progress</h2>
            <div className="flex items-center justify-center">
              <ProgressCircle percentage={dummyData.stats.successRate} />
            </div>
          </div>

          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Weekly Activity</h2>
            <ActivityChart data={dummyData.weeklyActivity} />
            <div className="flex justify-between text-sm text-zinc-400 mt-2">
              <span>Mon</span>
              <span>Wed</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Strength Areas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Strength Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dummyData.strengthAreas.map((area) => (
              <div
                key={area.topic}
                className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{area.topic}</span>
                  <span className="text-sm text-zinc-400">{area.score}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2"
                    style={{ width: `${area.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Questions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Questions</h2>
          <div className="bg-zinc-900/50 rounded-lg border border-zinc-800">
            {dummyData.recentQuestions.map((question) => (
              <div
                key={question.id}
                className="p-4 border-b border-zinc-800 last:border-b-0 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{question.title}</h3>
                  <span
                    className={`text-sm ${
                      question.status === "completed"
                        ? "text-green-500"
                        : question.status === "in_progress"
                        ? "text-yellow-500"
                        : "text-zinc-500"
                    }`}
                  >
                    {question.status.replace("_", " ")}
                  </span>
                </div>
                {question.score !== null && (
                  <span className="text-lg font-bold">{question.score}%</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Saved Notes */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Saved Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dummyData.savedNotes.map((note) => (
              <div
                key={note.id}
                className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <h3 className="font-medium mb-2">{note.title}</h3>
                <p className="text-sm text-zinc-400">
                  Last updated: {note.lastUpdated}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
