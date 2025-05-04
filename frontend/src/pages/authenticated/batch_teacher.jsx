import { useState, useEffect } from "react";
import { useParams, Outlet, Link } from "react-router-dom";

function BatchTeacher() {
  const { batchId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    test_cases: [{ input_text: "", expected_output: "", is_hidden: false }],
    time_limit: 30, // Default time limit of 30 minutes
    start_time: "", // Add start_time field
    end_time: "", // Add end_time field
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [batchId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/getquestionsbybatch/${batchId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();

      if (data.questions) {
        setQuestions(data.questions);
        setBatchName(data.batchName || "");
      } else {
        setQuestions([]);
      }
    } catch (err) {
      setError("Error loading questions: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      // Validate start and end times if both are provided
      if (newQuestion.start_time && newQuestion.end_time) {
        const startDate = new Date(newQuestion.start_time);
        const endDate = new Date(newQuestion.end_time);

        if (endDate <= startDate) {
          setError("End time must be after the start time");
          return;
        }
      }

      // Format dates in ISO format if they exist
      const formattedStartTime = newQuestion.start_time
        ? new Date(newQuestion.start_time).toISOString()
        : null;
      const formattedEndTime = newQuestion.end_time
        ? new Date(newQuestion.end_time).toISOString()
        : null;

      const response = await fetch("http://localhost:8080/addquestion", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batch_id: parseInt(batchId),
          title: newQuestion.title,
          description: newQuestion.description,
          test_cases: newQuestion.test_cases,
          time_limit: parseInt(newQuestion.time_limit) || 30,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add question");
      }

      setShowAddQuestionModal(false);
      setNewQuestion({
        title: "",
        description: "",
        test_cases: [{ input_text: "", expected_output: "", is_hidden: false }],
        time_limit: 30, // Reset to default
        start_time: "", // Reset start_time
        end_time: "", // Reset end_time
      });

      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  const addTestCase = () => {
    setNewQuestion({
      ...newQuestion,
      test_cases: [
        ...newQuestion.test_cases,
        { input_text: "", expected_output: "", is_hidden: false },
      ],
    });
  };

  const updateTestCase = (index, field, value) => {
    const updatedTestCases = [...newQuestion.test_cases];
    updatedTestCases[index][field] = value;

    setNewQuestion({
      ...newQuestion,
      test_cases: updatedTestCases,
    });
  };

  const removeTestCase = (index) => {
    if (newQuestion.test_cases.length > 1) {
      const updatedTestCases = newQuestion.test_cases.filter(
        (_, i) => i !== index
      );
      setNewQuestion({
        ...newQuestion,
        test_cases: updatedTestCases,
      });
    }
  };

  // Add form-level validation to datetime inputs
  const validateDateRange = () => {
    if (newQuestion.start_time && newQuestion.end_time) {
      const startDate = new Date(newQuestion.start_time);
      const endDate = new Date(newQuestion.end_time);
      return endDate > startDate;
    }
    return true; // Valid if either field is empty
  };

  return (
    <div className="min-h-screen py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-8">
          <h1 className="text-4xl font-bold">
            {batchName ? batchName : `Batch ${batchId}`}
          </h1>
          {batchName && (
            <p className="text-gray-400 mt-2">Batch ID: {batchId}</p>
          )}
          <div className="mt-4">
            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors shadow-lg"
            >
              Add Question
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-zinc-400">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {questions.map((question) => (
              <Link
                to={`/evalStudentDetail/${batchId}/${question.id}`}
                key={question.id}
                className="block"
              >
                <div className="p-5 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg">{question.title}</h3>
                  </div>
                  <div className="mt-2 text-sm text-gray-300">
                    {question.timeLimit ? (
                      <p>Time Limit: {question.timeLimit} minutes</p>
                    ) : (
                      <p>No time limit</p>
                    )}
                    {question.startTime && (
                      <p>
                        Start: {new Date(question.startTime).toLocaleString()}
                      </p>
                    )}
                    {question.endTime && (
                      <p>End: {new Date(question.endTime).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {questions.length === 0 && (
              <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <p className="text-xl text-zinc-400">No questions available</p>
                <p className="text-zinc-500 mt-2">
                  Add your first question to get started
                </p>
              </div>
            )}
          </div>
        )}

        {showAddQuestionModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-8 w-[700px] max-h-[90vh] overflow-y-auto">
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
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newQuestion.time_limit}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          time_limit: e.target.value,
                        })
                      }
                      className="w-full border rounded p-2 bg-zinc-800"
                      required
                    />
                  </div>

                  {/* Add Schedule Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Start Time (optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={newQuestion.start_time}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            start_time: e.target.value,
                          })
                        }
                        className="w-full border rounded p-2 bg-zinc-800"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        When students can start solving this question
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        End Time (optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={newQuestion.end_time}
                        onChange={(e) => {
                          setNewQuestion({
                            ...newQuestion,
                            end_time: e.target.value,
                          });
                          // Clear error when user changes the end time
                          if (
                            error &&
                            error.includes("End time must be after")
                          ) {
                            setError(null);
                          }
                        }}
                        className={`w-full border rounded p-2 bg-zinc-800 ${
                          !validateDateRange() ? "border-red-500" : ""
                        }`}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        When the question will no longer be available
                      </p>
                      {!validateDateRange() && (
                        <p className="text-xs text-red-500 mt-1">
                          End time must be after start time
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">
                        Test Cases
                      </label>
                      <button
                        type="button"
                        onClick={addTestCase}
                        className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors shadow-lg"
                      >
                        + Add Test Case
                      </button>
                    </div>

                    {newQuestion.test_cases.map((testCase, index) => (
                      <div
                        key={index}
                        className="mb-4 p-4 border border-zinc-700 rounded"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Test Case {index + 1}</h4>
                          {newQuestion.test_cases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTestCase(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="block text-sm font-medium mb-1">
                            Input
                          </label>
                          <textarea
                            value={testCase.input_text}
                            onChange={(e) =>
                              updateTestCase(
                                index,
                                "input_text",
                                e.target.value
                              )
                            }
                            className="w-full border rounded p-2 h-24 bg-zinc-800"
                            required
                          />
                        </div>

                        <div className="mb-2">
                          <label className="block text-sm font-medium mb-1">
                            Expected Output
                          </label>
                          <textarea
                            value={testCase.expected_output}
                            onChange={(e) =>
                              updateTestCase(
                                index,
                                "expected_output",
                                e.target.value
                              )
                            }
                            className="w-full border rounded p-2 h-24 bg-zinc-800"
                            required
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`is-hidden-${index}`}
                            checked={testCase.is_hidden}
                            onChange={(e) =>
                              updateTestCase(
                                index,
                                "is_hidden",
                                e.target.checked
                              )
                            }
                            className="mr-2"
                          />
                          <label
                            htmlFor={`is-hidden-${index}`}
                            className="text-sm"
                          >
                            Hidden test case (not visible to students)
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && <div className="text-red-500 mt-2">{error}</div>}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddQuestionModal(false)}
                    className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full hover:bg-zinc-500/20 transition-colors shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors shadow-lg"
                    disabled={!validateDateRange()}
                  >
                    Add Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Outlet />
    </div>
  );
}

export default BatchTeacher;
