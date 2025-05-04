import React from "react";

const ActivityFeed = ({ recentActivity, type }) => {
  if (type === "teacher") {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Batches</h2>
        <div className="space-y-4">
          {recentActivity.map((batch, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{batch.name}</p>
                <p className="text-sm text-zinc-400">
                  Created {new Date(batch.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${
                    batch.isActive ? "text-green-400" : "text-zinc-400"
                  }`}
                >
                  {batch.isActive ? "Active" : "Inactive"}
                </p>
                <p className="text-sm text-zinc-400">
                  {batch.studentCount} students
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivity.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
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
              {activity.status === "correct"
                ? "✓"
                : activity.status === "partially_correct"
                ? "P"
                : "✗"}
            </div>
            <div className="flex-grow">
              <p className="font-medium text-white">{activity.questionTitle}</p>
              <p className="text-sm text-zinc-400">
                {activity.batchName} •{" "}
                {new Date(activity.startTime).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-bold ${
                  activity.status === "correct"
                    ? "text-green-400"
                    : activity.status === "partially_correct"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {activity.score}%
              </p>
              <p className="text-sm text-zinc-400">
                {Math.floor(activity.timeTakenSecs / 60)}m{" "}
                {activity.timeTakenSecs % 60}s
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
