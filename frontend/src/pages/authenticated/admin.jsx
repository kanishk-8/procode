import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

const AdminPanel = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchTeachers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_TEACHERS, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleStatusUpdate = async (teacherId, action) => {
    try {
      setError(null);
      const response = await fetch(
        action === "approve"
          ? API_ENDPOINTS.APPROVE_TEACHER(teacherId)
          : API_ENDPOINTS.REVOKE_TEACHER(teacherId),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${action} teacher`);
      }

      // Refresh the teachers list after successful update
      fetchTeachers();
    } catch (err) {
      setError(err.message);
      console.error(`Error ${action}ing teacher:`, err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-zinc-400">Loading teachers...</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Teacher Management</h2>
            {teachers.length === 0 ? (
              <p className="text-zinc-400">No teachers found</p>
            ) : (
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <div
                    key={`teacher-${teacher.id}`}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{teacher.username}</p>
                      <p className="text-sm text-zinc-400">{teacher.email}</p>
                      <p className="text-sm text-zinc-400">
                        Status: {teacher.status}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {teacher.status !== "approved" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(teacher.id, "approve")
                          }
                          className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {teacher.status !== "revoked" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(teacher.id, "revoke")
                          }
                          className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
