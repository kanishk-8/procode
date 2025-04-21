import React, { useState } from "react";

const TeacherDashboard = ({ id }) => {
  const [activeTab, setActiveTab] = useState("students");
  const [activeBatchTab, setActiveBatchTab] = useState("questions");
  const [showAddBatchForm, setShowAddBatchForm] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [batchMessage, setBatchMessage] = useState("");

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/addBatch", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newBatchName,
          user_id: id, // Replace with actual teacher ID if available
        }),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (response.ok) {
        setBatchMessage(
          "Batch created successfully with ID " + data.batch.batch_id
        );
      } else {
        setBatchMessage(data.message || "Error creating batch");
      }
      setNewBatchName("");
      setShowAddBatchForm(false);
    } catch (error) {
      setBatchMessage("Error: " + error.message);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 p-8 mt-16 overflow-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        </header>
        {/* Main Navigation Tabs */}
        <nav className="flex space-x-4 mb-4 p-4 bg-gray-900 rounded-lg shadow">
          <button
            onClick={() => setActiveTab("students")}
            className={`text-lg font-bold ${
              activeTab === "students"
                ? "underline text-white"
                : "text-gray-300"
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab("batches")}
            className={`text-lg font-bold ${
              activeTab === "batches" ? "underline text-white" : "text-gray-300"
            }`}
          >
            Batches
          </button>
        </nav>

        {activeTab === "students" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Manage Students</h2>
            {/* Student Management Table */}
            <table className="min-w-full shadow rounded">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b">Student A</td>
                  <td className="py-2 px-4 border-b">Pending Verification</td>
                  <td className="py-2 px-4 border-b">
                    <button className="bg-green-600 text-white py-1 px-2 rounded mr-2">
                      Verify
                    </button>
                    <button className="bg-blue-600 text-white py-1 px-2 rounded">
                      Add to Batch
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {activeTab === "batches" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Batch Management</h2>
            {/* Add Batch Button and Form */}
            <div className="mb-4">
              {!showAddBatchForm ? (
                <button
                  onClick={() => setShowAddBatchForm(true)}
                  className="bg-green-600 text-white py-2 px-4 rounded"
                >
                  Add Batch
                </button>
              ) : (
                <form onSubmit={handleAddBatchSubmit} className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter batch name"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    className="border p-2 mr-2"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddBatchForm(false)}
                    className="ml-2 py-2 px-4 rounded border"
                  >
                    Cancel
                  </button>
                </form>
              )}
              {batchMessage && <p>{batchMessage}</p>}
            </div>
            {/* Inner Navigation for Batch Content */}
            <nav className="flex space-x-4 mb-4 p-4 bg-gray-700 rounded-lg shadow">
              <button
                onClick={() => setActiveBatchTab("questions")}
                className={`text-lg font-bold ${
                  activeBatchTab === "questions"
                    ? "underline text-white"
                    : "text-gray-300"
                }`}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveBatchTab("assignments")}
                className={`text-lg font-bold ${
                  activeBatchTab === "assignments"
                    ? "underline text-white"
                    : "text-gray-300"
                }`}
              >
                Assignments
              </button>
              <button
                onClick={() => setActiveBatchTab("notes")}
                className={`text-lg font-bold ${
                  activeBatchTab === "notes"
                    ? "underline text-white"
                    : "text-gray-300"
                }`}
              >
                Notes
              </button>
            </nav>
            {activeBatchTab === "questions" && (
              <div>
                <h3 className="text-lg font-bold mb-2">Post a Question</h3>
                <form>
                  <textarea
                    placeholder="Post a question"
                    className="border p-2 w-full mb-4"
                  ></textarea>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                  >
                    Submit
                  </button>
                </form>
              </div>
            )}
            {activeBatchTab === "assignments" && (
              <div>
                <h3 className="text-lg font-bold mb-2">Post an Assignment</h3>
                <form>
                  <textarea
                    placeholder="Post an assignment"
                    className="border p-2 w-full mb-4"
                  ></textarea>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                  >
                    Submit
                  </button>
                </form>
              </div>
            )}
            {activeBatchTab === "notes" && (
              <div>
                <h3 className="text-lg font-bold mb-2">Post Notes</h3>
                <form>
                  <textarea
                    placeholder="Post notes"
                    className="border p-2 w-full mb-4"
                  ></textarea>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                  >
                    Submit
                  </button>
                </form>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
