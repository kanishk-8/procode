import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EvalStudentDetail = () => {
  const { batchId, questionId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    fetchQuestionStatus();
  }, [batchId, questionId]);

  const fetchQuestionStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/question-status/${batchId}/${questionId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch question status");
      }

      const data = await response.json();
      setData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusBadge = (status) => {
    const colors = {
      correct: "bg-green-500/20 text-green-400 border-green-500/20",
      partially_correct:
        "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
      incorrect: "bg-red-500/20 text-red-400 border-red-500/20",
      in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/20",
      not_started: "bg-zinc-500/20 text-zinc-400 border-zinc-600/20",
    };
    return colors[status] || colors.not_started;
  };

  const getFilteredStudents = () => {
    if (!data?.students) return [];

    switch (activeTab) {
      case "completed":
        return data.students.filter((s) => s.attempt?.isAttempted);
      case "inProgress":
        return data.students.filter((s) => s.attempt?.status === "in_progress");
      case "notStarted":
        return data.students.filter((s) => !s.attempt);
      default:
        return data.students;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-28 px-4 md:px-8 flex justify-center items-center">
        <p className="text-xl text-zinc-400">Loading evaluation data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-28 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-500">{error}</p>
            <Link
              to={`/batchTeacher/${batchId}`}
              className="text-blue-500 hover:underline mt-4 inline-block"
            >
              ← Back to Batch
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredStudents = getFilteredStudents();

  return (
    <div className="min-h-screen py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              to={`/batchTeacher/${batchId}`}
              className="text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2 mb-4"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Questions
            </Link>
            <h1 className="text-4xl font-bold mb-2">
              {data?.questionTitle || "Question Evaluation"}
            </h1>
            <p className="text-zinc-400">Batch: {data?.batchName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">
              Total Students
            </h3>
            <p className="text-3xl font-bold">{data?.students?.length || 0}</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">
              Completed
            </h3>
            <p className="text-3xl font-bold text-green-400">
              {data?.students?.filter((s) => s.attempt?.isAttempted).length ||
                0}
            </p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">
              In Progress
            </h3>
            <p className="text-3xl font-bold text-blue-400">
              {data?.students?.filter(
                (s) => s.attempt?.status === "in_progress"
              ).length || 0}
            </p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">
              Average Score
            </h3>
            <p className="text-3xl font-bold text-yellow-400">
              {(
                data?.students
                  ?.filter((s) => s.attempt?.score !== undefined)
                  .reduce((acc, s) => acc + (s.attempt?.score || 0), 0) /
                (data?.students?.filter((s) => s.attempt?.score !== undefined)
                  .length || 1)
              ).toFixed(2)}
              %
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-zinc-400 font-medium">
                    Student
                  </th>
                  <th className="text-left p-4 text-zinc-400 font-medium">
                    Status
                  </th>
                  <th className="text-left p-4 text-zinc-400 font-medium">
                    Score
                  </th>
                  <th className="text-left p-4 text-zinc-400 font-medium">
                    Time Taken
                  </th>
                  <th className="text-left p-4 text-zinc-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.students?.map((student) => (
                  <tr
                    key={student.studentId}
                    className="border-b border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium">{student.username}</div>
                          <div className="text-sm text-zinc-400">
                            {student.studentCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          student.attempt?.status || "not_started"
                        )}`}
                      >
                        {student.attempt?.status || "Not Started"}
                      </span>
                    </td>
                    <td className="p-4">
                      {student.attempt?.score !== undefined
                        ? `${student.attempt.score}%`
                        : "N/A"}
                    </td>
                    <td className="p-4">
                      {formatTime(student.attempt?.timeTaken)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowStudentModal(true);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showStudentModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">
                  {selectedStudent.username}
                </h3>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-zinc-400 mb-1">
                    Student ID
                  </h4>
                  <p>{selectedStudent.studentCode}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-zinc-400 mb-1">
                    Status
                  </h4>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      selectedStudent.attempt?.status || "not_started"
                    )}`}
                  >
                    {selectedStudent.attempt?.status || "Not Started"}
                  </span>
                </div>
                {selectedStudent.attempt && (
                  <>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-zinc-400 mb-1">
                        Score
                      </h4>
                      <p>
                        {selectedStudent.attempt.score !== undefined
                          ? `${selectedStudent.attempt.score}%`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-zinc-400 mb-1">
                        Time Taken
                      </h4>
                      <p>{formatTime(selectedStudent.attempt.timeTaken)}</p>
                    </div>
                  </>
                )}
              </div>

              {selectedStudent.attempt?.submittedCode && (
                <div>
                  <h4 className="text-lg font-medium mb-3">Submitted Code</h4>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                      {selectedStudent.attempt.submittedCode}
                    </pre>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full hover:bg-zinc-500/20 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvalStudentDetail;
