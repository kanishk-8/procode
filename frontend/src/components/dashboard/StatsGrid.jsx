import React from "react";

const StatsGrid = ({ stats }) => {
  const getColorClass = (color) => {
    const colors = {
      blue: "text-blue-400",
      green: "text-green-400",
      purple: "text-purple-400",
      yellow: "text-yellow-400",
      indigo: "text-indigo-400",
      red: "text-red-400",
    };
    return colors[color] || "text-white";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/5 p-6 rounded-xl border border-white/10"
        >
          <p className="text-zinc-400">{stat.label}</p>
          <p className={`text-2xl font-bold mt-2 ${getColorClass(stat.color)}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
