import { useState, useEffect } from "react";
import { Link, useParams, Outlet } from "react-router-dom";

function Batch() {
  const { batchId } = useParams();
  const [questions, setQuestions] = useState([]);
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

  return (
    <div className="min-h-screen py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Batch {batchId}</h1>
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
              const available = isQuestionAvailable(
                question.startTime,
                question.endTime
              );
              return (
                <Link
                  to={
                    available ? `/codingSpace/${batchId}/${question.id}` : "#"
                  }
                  key={question.id}
                  className={`block ${!available ? "cursor-not-allowed" : ""}`}
                  onClick={(e) => !available && e.preventDefault()}
                >
                  <div
                    className={`p-5 border border-zinc-700 rounded-lg 
                        ${
                          available
                            ? "hover:bg-zinc-700"
                            : "bg-zinc-800 opacity-70"
                        } 
                        transition-colors duration-200`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">{question.title}</h3>
                      {!available &&
                        question.startTime &&
                        new Date(question.startTime) > new Date() && (
                          <span className="bg-yellow-600 text-white px-2 py-1 rounded-md text-xs">
                            Starts at {formatDateTime(question.startTime)}
                          </span>
                        )}
                      {!available &&
                        question.endTime &&
                        new Date(question.endTime) < new Date() && (
                          <span className="bg-red-600 text-white px-2 py-1 rounded-md text-xs">
                            Ended
                          </span>
                        )}
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
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Batch;
