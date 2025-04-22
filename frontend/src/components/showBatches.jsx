import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function ShowBatches() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [batchCode, setBatchCode] = useState("");

  // Fetch batches based on user role
  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const endpoint =
        user?.role === "teacher"
          ? "http://localhost:8080/getBatchesByTeacher"
          : "http://localhost:8080/getstudentbatches";

      const response = await fetch(endpoint, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch batches");

      const data = await response.json();
      setBatches(data.batches || []); // Provide empty array as fallback
      setError(null);
    } catch (err) {
      setError(err.message);
      setBatches([]); // Reset to empty array on error
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
      const response = await fetch("http://localhost:8080/addBatch", {
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
      fetchBatches(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;

    try {
      const response = await fetch("http://localhost:8080/deleteBatch", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batch_id: batchId }),
      });

      if (!response.ok) throw new Error("Failed to delete batch");

      fetchBatches(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinBatch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8080/joinbatch/${batchCode}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to join batch");
      }

      setShowJoinModal(false);
      setBatchCode("");
      fetchBatches(); // Refresh the list
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading classrooms...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 mt-24">
        {/* Header with buttons */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Classrooms</h2>
          {user?.role === "teacher" ? (
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Classroom
            </button>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Join Classroom
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Empty State */}
        {batches.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-gray-500">No classrooms found</p>
          </div>
        )}

        {/* Batches Grid */}
        {batches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <div
                key={batch.ID}
                className="border rounded-lg p-4 h-48 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <Link to={`/batch/${batch.ID}`}>
                    <h3 className="text-xl font-semibold">{batch.Name}</h3>
                  </Link>
                  {user?.role === "teacher" && (
                    <button
                      onClick={() => handleDeleteBatch(batch.ID)}
                      className="text-red-600 hover:text-red-800"
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
                <p className="text-gray-600 mt-2">
                  Created: {new Date(batch.CreatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className=" border-2 rounded-lg p-6 w-96">
              <h3 className="text-xl font-bold mb-4 ">Join Classroom</h3>
              <form onSubmit={handleJoinBatch}>
                <input
                  type="text"
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  placeholder="Enter Classroom Code"
                  className="w-full border rounded p-2 mb-4 text-gray-200"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Join
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showAddBatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white border-2 rounded-lg p-6 w-96">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Create New Classroom
              </h3>
              <form onSubmit={handleAddBatch}>
                <input
                  type="text"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="Classroom Name"
                  className="w-full border rounded p-2 mb-4 text-gray-800"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBatchModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowBatches;
