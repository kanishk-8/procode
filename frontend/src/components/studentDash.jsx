import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Updated DashboardNav component using buttons for dynamic content change
const DashboardNav = ({ activeTab, setActiveTab }) => (
  <nav className="flex space-x-4 mb-4 p-4 bg-gray-900 rounded-lg shadow">
    <button
      onClick={() => setActiveTab("dashboard")}
      className={`text-lg font-bold ${
        activeTab === "dashboard" ? "underline text-white" : "text-gray-300"
      }`}
    >
      Dashboard
    </button>
    <button
      onClick={() => setActiveTab("projects")}
      className={`text-lg font-bold ${
        activeTab === "projects" ? "underline text-white" : "text-gray-300"
      }`}
    >
      Projects
    </button>
    <button
      onClick={() => setActiveTab("attempts")}
      className={`text-lg font-bold ${
        activeTab === "attempts" ? "underline text-white" : "text-gray-300"
      }`}
    >
      Attempts
    </button>
    <button
      onClick={() => setActiveTab("results")}
      className={`text-lg font-bold ${
        activeTab === "results" ? "underline text-white" : "text-gray-300"
      }`}
    >
      Results
    </button>
  </nav>
);

const OverviewSection = () => (
  <section className="mb-8">
    <h2 className="text-xl font-bold mb-4">Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded shadow">
        <h3 className="font-bold">Projects</h3>
        <p>5 active projects</p>
      </div>
      <div className="p-4 rounded shadow">
        <h3 className="font-bold">Tasks</h3>
        <p>12 pending tasks</p>
      </div>
      <div className="p-4 rounded shadow">
        <h3 className="font-bold">Activity</h3>
        <p>Recent activity here</p>
      </div>
    </div>
  </section>
);

const RecentActivitySection = () => (
  <section>
    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
    <div className="p-4 rounded shadow">
      <ul>
        <li className="border-b py-2">
          <span className="font-bold">John Doe</span> updated project Alpha.
        </li>
        <li className="border-b py-2">
          <span className="font-bold">You</span> completed task "Design UI".
        </li>
        <li className="py-2">
          <span className="font-bold">Jane Smith</span> commented on project
          Beta.
        </li>
      </ul>
    </div>
  </section>
);

const StudentDash = () => {
  const { user } = useAuth(); // Get user from context
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 p-8 mt-16 overflow-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome {user ? user.username : "Guest"}!
          </h1>
          <p className="text-gray-600">This is your personalized dashboard.</p>
        </header>
        <DashboardNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Conditionally render content based on activeTab */}
        {activeTab === "dashboard" && (
          <>
            <OverviewSection />
            <RecentActivitySection />
          </>
        )}
        {activeTab === "projects" && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Projects</h2>
            {/* ...existing project content placeholder... */}
            <div className="p-4 rounded shadow">Project details go here</div>
          </section>
        )}
        {activeTab === "attempts" && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Attempts</h2>
            {/* ...existing attempts content placeholder... */}
            <div className="p-4 rounded shadow">User attempts go here</div>
          </section>
        )}
        {activeTab === "results" && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Results</h2>
            {/* ...existing results content placeholder... */}
            <div className="p-4 rounded shadow">Results details go here</div>
          </section>
        )}

        <div className="mt-8">
          <Link to="/codingSpace">
            <button className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">
              Go to Coding Space
            </button>
          </Link>
          {/* New button to navigate to batch */}
          <Link to={`/batch/${user?.batchId || 1}`}>
            <button className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded ml-4">
              Go to Batch
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDash;
