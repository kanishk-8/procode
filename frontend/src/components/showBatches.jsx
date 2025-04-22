import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Assuming you have an auth context

function ShowBatches() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [error, setError] = useState(null);

  // Fetch batches based on user role
  const fetchBatches = async () => {
    try {
      const endpoint =
        user.role === "teacher"
          ? "http://localhost:8080/getBatchesByTeacher"
          : "http://localhost:8080/getStudentBatches"; // Assumed endpoint

      const response = await fetch(endpoint, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch batches");

      const data = await response.json();
      setBatches(data.batches);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchBatches();
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

  // Otherwise show the list of batches
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 mt-24">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Classrooms</h2>
          {user.role === "teacher" && (
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Classroom
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div key={batch.ID} className="border rounded-lg p-4  shadow-sm">
              <div className="flex justify-between items-start">
                <Link to={`/batch/${batch.ID}`}>
                  <h3 className="text-xl font-semibold">{batch.Name}</h3>
                </Link>
                {user.role === "teacher" && (
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

        {/* Add Batch Modal */}
        {showAddBatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="border-2 border-white rounded-lg p-6 w-96">
              <h3 className="text-xl font-bold mb-4">Create New Classroom</h3>
              <form onSubmit={handleAddBatch}>
                <input
                  type="text"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="Classroom Name"
                  className="w-full border rounded p-2 mb-4"
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
