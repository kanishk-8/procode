import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

const ClassRoom = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [batchCode, setBatchCode] = useState("");
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);

  // Fetch batches based on user role
  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const endpoint =
        user?.role === "teacher"
          ? API_ENDPOINTS.GET_BATCHES_BY_TEACHER
          : API_ENDPOINTS.GET_STUDENT_BATCHES;

      const response = await fetch(endpoint, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch batches");

      const data = await response.json();
      setBatches(data.batches || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setBatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBatches();
    }
  }, [user]);

  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.ADD_BATCH, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newBatchName }),
      });

      if (!response.ok) throw new Error("Failed to create batch");

      setShowAddBatchModal(false);
      setNewBatchName("");
      fetchBatches();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;

    try {
      const response = await fetch(API_ENDPOINTS.DELETE_BATCH, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batch_id: batchId }),
      });

      if (!response.ok) throw new Error("Failed to delete batch");
      fetchBatches();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinBatch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.JOIN_BATCH(batchCode), {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to join batch");
      }

      setShowJoinModal(false);
      setBatchCode("");
      fetchBatches();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchStudentsInBatch = async (batchId) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.GET_STUDENTS_IN_BATCH(batchId),
        {
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch students");

      const data = await response.json();
      setStudents(data.students || []);
      setSelectedBatch(batches.find((b) => b.ID === batchId));
      setShowStudentsModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Your Classroom</h1>
        </div>

        <div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl text-zinc-400">Loading classrooms...</p>
            </div>
          ) : (
            <>
              {batches.length === 0 && !error ? (
                <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <p className="text-xl text-zinc-400">
                    No classrooms available
                  </p>
                  <p className="text-zinc-500 mt-2">
                    {user?.role === "teacher"
                      ? "Create your first classroom to get started"
                      : "Join a classroom to start learning"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {batches.map((batch) => (
                    <div
                      key={batch.ID}
                      className="bg-white/5 rounded-lg border border-white/10 p-6 hover:border-white/20 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Link
                          to={
                            user?.role === "teacher"
                              ? `/batchTeacher/${batch.ID}`
                              : `/batch/${batch.ID}`
                          }
                          className="text-xl font-medium hover:text-blue-400 transition-colors"
                        >
                          {batch.Name || `Batch ${batch.ID}`}
                        </Link>
                        {user?.role === "teacher" && (
                          <button
                            onClick={() => handleDeleteBatch(batch.ID)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-zinc-400">
                        <p>
                          Created:{" "}
                          {new Date(batch.CreatedAt).toLocaleDateString()}
                        </p>
                        <p>Join Code: {batch.ID}</p>
                      </div>

                      {user?.role === "teacher" && (
                        <button
                          onClick={() => fetchStudentsInBatch(batch.ID)}
                          className="w-full mt-4 px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                        >
                          View Enrolled Students
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="fixed bottom-8 right-8">
          {user?.role === "teacher" ? (
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors shadow-lg"
            >
              Create Classroom
            </button>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors shadow-lg"
            >
              Join Classroom
            </button>
          )}
        </div>

        {showAddBatchModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 w-[400px] backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-4">Create New Classroom</h3>
              <form onSubmit={handleAddBatch}>
                <input
                  type="text"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="Classroom Name"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-4"
                  required
                />
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddBatchModal(false)}
                    className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-lg hover:bg-zinc-500/20 transition-colors shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors shadow-lg"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 w-[400px] backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-4">Join Classroom</h3>
              <form onSubmit={handleJoinBatch}>
                <input
                  type="text"
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  placeholder="Enter Classroom Code"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-4"
                  required
                />
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-lg hover:bg-zinc-500/20 transition-colors shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors shadow-lg"
                  >
                    Join
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showStudentsModal && selectedBatch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 w-[500px] max-h-[80vh] overflow-y-auto backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-4">
                Students in {selectedBatch.Name || `Batch ${selectedBatch.ID}`}
              </h3>
              {students.length === 0 ? (
                <p className="text-zinc-400">No students enrolled yet</p>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.ID}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <p className="font-medium">{student.Username}</p>
                      <p className="text-sm text-zinc-400">{student.Email}</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowStudentsModal(false)}
                className="mt-6 w-full px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-lg hover:bg-zinc-500/20 transition-colors shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassRoom;
