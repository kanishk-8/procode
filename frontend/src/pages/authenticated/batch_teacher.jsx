import { useState } from "react";
import { Link, useParams, Outlet } from "react-router-dom";

function BatchTeacher() {
  const { batchId } = useParams();
  const [activeTab, setActiveTab] = useState("questions");
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    input_test_cases: "",
    expected_output: "",
  });
  const [error, setError] = useState(null);

  const tabData = {
    questions: [
      { id: 1, title: "Introduction to Arrays", difficulty: "Easy" },
      { id: 2, title: "Binary Search Implementation", difficulty: "Medium" },
      // Add more questions
    ],
    assignments: [
      {
        id: 1,
        title: "Week 1 Assignment",
        dueDate: "2025-04-28",
        status: "Pending",
      },
      {
        id: 2,
        title: "Week 2 Assignment",
        dueDate: "2025-05-05",
        status: "Not Started",
      },
      // Add more assignments
    ],
    notes: [
      { id: 1, title: "Data Structures Basics", date: "2025-04-21" },
      { id: 2, title: "Algorithm Analysis", date: "2025-04-22" },
      // Add more notes
    ],
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/addquestion", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newQuestion,
          batch_id: parseInt(batchId),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add question");
      }

      setShowAddQuestionModal(false);
      setNewQuestion({
        title: "",
        description: "",
        input_test_cases: "",
        expected_output: "",
      });
      // You might want to refresh the questions list here
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 mt-24">
        <h1 className="text-3xl font-bold mb-6">Class: {batchId}</h1>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === "questions"
                ? "bg-blue-500 text-white"
                : "bg-gray-700"
            }`}
            onClick={() => setActiveTab("questions")}
          >
            Questions
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === "assignments"
                ? "bg-blue-500 text-white"
                : "bg-gray-700"
            }`}
            onClick={() => setActiveTab("assignments")}
          >
            Assignments
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === "notes" ? "bg-blue-500 text-white" : "bg-gray-700"
            }`}
            onClick={() => setActiveTab("notes")}
          >
            Notes
          </button>
        </div>

        {/* Content Area */}
        <div className=" p-6 rounded-lg shadow-md">
          {activeTab === "questions" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Practice Questions</h2>
                <button
                  onClick={() => setShowAddQuestionModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add Question
                </button>
              </div>
              {tabData.questions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 border rounded-lg hover:bg-gray-700"
                >
                  <h3 className="font-medium">{question.title}</h3>
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      question.difficulty === "Easy"
                        ? "bg-green-100 text-green-800"
                        : question.difficulty === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {question.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add Question Modal */}
          {showAddQuestionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-zinc-900 border-2 rounded-lg p-6 w-[600px]">
                <h3 className="text-xl font-bold mb-4">Add New Question</h3>
                <form onSubmit={handleAddQuestion}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newQuestion.title}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            title: e.target.value,
                          })
                        }
                        className="w-full border rounded p-2 bg-zinc-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={newQuestion.description}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            description: e.target.value,
                          })
                        }
                        className="w-full border rounded p-2 h-32 bg-zinc-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Input Test Cases
                      </label>
                      <textarea
                        value={newQuestion.input_test_cases}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            input_test_cases: e.target.value,
                          })
                        }
                        className="w-full border rounded p-2 h-24 bg-zinc-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Expected Output
                      </label>
                      <textarea
                        value={newQuestion.expected_output}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            expected_output: e.target.value,
                          })
                        }
                        className="w-full border rounded p-2 h-24 bg-zinc-800"
                        required
                      />
                    </div>
                  </div>
                  {error && <div className="text-red-500 mt-2">{error}</div>}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddQuestionModal(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add Question
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Assignments</h2>
              {tabData.assignments.map((assignment) => (
                <Link
                  to={`/codingspace/${assignment.id}`}
                  key={assignment.id}
                  className="p-4"
                >
                  <div
                    key={assignment.id}
                    className="p-4 border rounded-lg hover:bg-gray-700"
                  >
                    <h3 className="font-medium">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">
                      Due Date: {assignment.dueDate}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        assignment.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : assignment.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Class Notes</h2>
              {tabData.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 border rounded-lg hover:bg-gray-700"
                >
                  <h3 className="font-medium">{note.title}</h3>
                  <p className="text-sm text-gray-600">Added on: {note.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Outlet />
    </div>
  );
}

export default BatchTeacher;
