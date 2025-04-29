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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 mt-24">
        <h1 className="text-3xl font-bold mb-6">Batch: {batchId}</h1>

        {/* Content Area - Questions */}
        <div className="p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Practice Questions</h2>
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
              </div>
            ) : (
              <div className="grid gap-4">
                {questions.map((question) => (
                  <Link
                    to={`/codingSpace/${question.id}`}
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
      </div>
      <Outlet />
    </div>
  );
}

export default Batch;
