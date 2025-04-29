import { useState, useEffect } from "react";
import { useParams, Outlet, Link } from "react-router-dom";

function BatchTeacher() {
  const { batchId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    test_cases: [{ input_text: "", expected_output: "", is_hidden: false }],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch questions when component mounts
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
      });

      // Refresh the questions list after adding a new question
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
    if (field === "is_hidden") {
      updatedTestCases[index][field] = value;
    } else {
      updatedTestCases[index][field] = value;
    }

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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 mt-24">
        <h1 className="text-3xl font-bold mb-6">Batch: {batchId}</h1>

        {/* Content Area - Questions Only */}
        <div className="p-6 rounded-lg shadow-md ">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Practice Questions</h2>
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-md transition-colors duration-200"
              >
                Add Question
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-lg">Loading questions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg">
                  No questions available for this batch.
                </p>
                <p className="text-sm mt-2">Add a question to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {questions.map((question) => (
                  <Link
                    to={`/evalStudentDetail/${question.id}`}
                    key={question.id}
                    className="block"
                  >
                    <div className="p-5 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors duration-200 cursor-pointer">
                      <h3 className="font-medium text-lg">{question.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Question Modal */}
        {showAddQuestionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border-2 rounded-lg p-6 w-[700px] max-h-[90vh] overflow-y-auto">
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

                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">
                        Test Cases
                      </label>
                      <button
                        type="button"
                        onClick={addTestCase}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
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
      </div>
      <Outlet />
    </div>
  );
}

export default BatchTeacher;
