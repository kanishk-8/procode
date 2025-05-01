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

  return (
    <div className="min-h-screen py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Batch {batchId}</h1>
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
                to={`/codingSpace/${question.id}`}
                key={question.id}
                className="block"
              >
                <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all">
                  <h3 className="text-xl font-medium">{question.title}</h3>
                </div>
              </Link>
            ))}
            {questions.length === 0 && (
              <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <p className="text-xl text-zinc-400">No questions available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Batch;
