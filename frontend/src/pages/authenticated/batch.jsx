import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";

function Batch() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    // Fetch questions when component mounts
    fetchQuestions();
  }, [batchId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        API_ENDPOINTS.GET_QUESTIONS_BY_BATCH(batchId),
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

  // Helper function to format date
  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);

    // Format as DD/MM/YYYY HH:MM
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Check if question is available now
  const isQuestionAvailable = (startTime, endTime) => {
    const now = new Date();
    if (startTime) {
      const start = new Date(startTime);
      if (now < start) return false;
    }
    if (endTime) {
      const end = new Date(endTime);
      if (now > end) return false;
    }
    return true;
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "correct":
        return "bg-green-600";
      case "partially_correct":
        return "bg-yellow-600";
      case "incorrect":
      case "timed_out":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  // Helper function to get formatted status text
  const getStatusText = (status) => {
    switch (status) {
      case "correct":
        return "Correct";
      case "partially_correct":
        return "Partially Correct";
      case "incorrect":
        return "Incorrect";
      case "timed_out":
        return "Timed Out";
      default:
        return "Unknown";
    }
  };

  const handleStartQuestion = (question) => {
    setSelectedQuestion(question);
    setShowConfirmation(true);
  };

  const handleConfirmStart = () => {
    if (selectedQuestion) {
      navigate(`/codingSpace/${batchId}/${selectedQuestion.id}`);
    }
    setShowConfirmation(false);
  };

  const handleCancelStart = () => {
    setShowConfirmation(false);
    setSelectedQuestion(null);
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
            <p className="text-lg">No questions available for this batch.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {questions.map((question) => {
              const available =
                isQuestionAvailable(question.startTime, question.endTime) &&
                !question.isAttempted;
              return (
                <div
                  key={question.id}
                  className={`p-5 border border-zinc-700 rounded-lg 
                      ${available ? "" : "bg-zinc-800 opacity-70"} 
                      transition-colors duration-200`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg">{question.title}</h3>
                    <div className="flex space-x-2">
                      {question.isAttempted && (
                        <span
                          className={`${getStatusBadgeColor(
                            question.status
                          )} text-white px-2 py-1 rounded-md text-xs`}
                        >
                          {getStatusText(question.status)}
                          {question.score !== null && ` - ${question.score}%`}
                        </span>
                      )}
                      {!available &&
                        !question.isAttempted &&
                        question.startTime &&
                        new Date(question.startTime) > new Date() && (
                          <span className="bg-yellow-600 text-white px-2 py-1 rounded-md text-xs">
                            Starts at {formatDateTime(question.startTime)}
                          </span>
                        )}
                      {!available &&
                        !question.isAttempted &&
                        question.endTime &&
                        new Date(question.endTime) < new Date() && (
                          <span className="bg-red-600 text-white px-2 py-1 rounded-md text-xs">
                            Ended
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-300">
                    {question.timeLimit ? (
                      <p>Time Limit: {question.timeLimit} minutes</p>
                    ) : (
                      <p>No time limit</p>
                    )}
                    {question.startTime && (
                      <p>Start: {formatDateTime(question.startTime)}</p>
                    )}
                    {question.endTime && (
                      <p>End: {formatDateTime(question.endTime)}</p>
                    )}
                    {question.isAttempted && (
                      <p className="mt-1 text-gray-400">
                        You've already attempted this question
                        {question.score !== null &&
                          ` - Score: ${question.score}%`}
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    {available ? (
                      <button
                        onClick={() => handleStartQuestion(question)}
                        className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors shadow-lg"
                      >
                        Start Question
                      </button>
                    ) : question.isAttempted ? (
                      <button
                        className="px-4 py-2 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full cursor-not-allowed"
                        disabled
                      >
                        Already Attempted
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full cursor-not-allowed"
                        disabled
                      >
                        Not Available
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Start Question</h3>
              <p className="mb-6 text-gray-300">
                Warning: Once you start this question, you cannot reattempt it.
                Make sure you're ready to begin!
                {selectedQuestion && selectedQuestion.timeLimit > 0 && (
                  <span className="block mt-2 font-medium">
                    This question has a time limit of{" "}
                    {selectedQuestion.timeLimit} minutes.
                  </span>
                )}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelStart}
                  className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full hover:bg-zinc-500/20 transition-colors shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStart}
                  className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors shadow-lg"
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Batch;
