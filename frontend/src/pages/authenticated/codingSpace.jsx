import React, { useState, useEffect, useRef } from "react";
import { useParams, Outlet } from "react-router-dom";
import Editor from "@monaco-editor/react";

const CodingSpace = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [languageId, setLanguageId] = useState(71); // Default: Python (as number)
  const editorRef = useRef(null);
  const [outputMessage, setOutputMessage] = useState("");

  // Language mapping for Monaco Editor
  const languageMap = {
    71: "python",
    54: "cpp",
    62: "java",
    50: "c",
    63: "javascript",
  };

  // Default code for different languages
  const defaultCodes = {
    71: "# Write your Python code here\n\n",
    54: "// Write your C++ code here\n#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}\n",
    62: "// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n",
    50: "// Write your C code here\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}\n",
    63: "// Write your JavaScript code here\n\n",
  };

  // Fetch question details when component mounts
  useEffect(() => {
    fetchQuestionDetails();
  }, [questionId]);

  const fetchQuestionDetails = async () => {
    try {
      setLoading(true);
      // We need to get batch ID from the URL or from local storage
      // For now, we'll use a fixed batchId of 1
      const response = await fetch(
        `http://localhost:8080/getquestiondetailsbyid/1/${questionId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch question details");
      }

      const data = await response.json();

      if (data.data) {
        setQuestion(data.data.Question);
        setTestCases(data.data.TestCases);
      } else {
        throw new Error("No question data returned");
      }
    } catch (err) {
      setError("Error loading question: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e) => {
    const newLanguageId = parseInt(e.target.value, 10);
    setLanguageId(newLanguageId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editorRef.current) return;

    try {
      setSubmitting(true);
      setResults(null);
      setError(null);
      setOutputMessage("");

      const code = editorRef.current.getValue();

      // Debug log
      console.log("Submitting request:", {
        question_id: parseInt(questionId),
        code: code,
        language_id: languageId,
      });

      const response = await fetch("http://localhost:8080/evalques", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: parseInt(questionId),
          code: code,
          language_id: languageId,
        }),
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Failed to parse response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to evaluate code");
      }

      // Check if response contains expected data structure
      console.log("Parsed response:", data);

      if (data && data.data) {
        setResults(data.data);
        setOutputMessage(data.message || "Code evaluation completed");
      } else {
        setOutputMessage("No results returned from evaluation");
      }
    } catch (err) {
      setError("Error evaluating code: " + err.message);
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen p-4 mt-24 flex flex-col lg:flex-row gap-4 ">
      {/* Question Panel */}
      <div className="lg:w-[40%] h-[50vh] lg:h-[80vh] border border-zinc-700 rounded-lg overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading question...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : question ? (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{question.Title}</h1>
            <div className="prose prose-invert max-w-none">
              <p className="mb-6 whitespace-pre-wrap">{question.Description}</p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Test Cases</h2>
              {testCases.length > 0 ? (
                <div className="space-y-4">
                  {testCases.map((testCase, index) => (
                    <div
                      key={index}
                      className="border border-zinc-700 rounded-lg p-4"
                    >
                      <h3 className="font-medium mb-2">
                        Test Case {index + 1}
                      </h3>
                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-zinc-400">
                          Input:
                        </h4>
                        <pre className="bg-zinc-800 p-2 rounded mt-1 text-sm overflow-x-auto">
                          {testCase.InputText}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400">
                          Expected Output:
                        </h4>
                        <pre className="bg-zinc-800 p-2 rounded mt-1 text-sm overflow-x-auto">
                          {testCase.ExpectedOutput}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400">No test cases available.</p>
              )}
            </div>

            {/* Results Area */}
            {outputMessage && (
              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-md">
                {outputMessage}
              </div>
            )}

            {results && (
              <div className="mt-6 border border-zinc-700 rounded-lg p-4 bg-zinc-800">
                <h3 className="text-lg font-medium mb-2">Results</h3>
                <div className="mb-2 flex justify-between items-center">
                  <span>Total Tests: {results.total_tests}</span>
                  <span>Passed: {results.passed_tests}</span>
                  <span
                    className={
                      results.status === "correct"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    Status: {results.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {results.test_results &&
                    results.test_results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md ${
                          result.status === "PASS"
                            ? "bg-green-900/30"
                            : "bg-red-900/30"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>Test Case {index + 1}</span>
                          <span
                            className={
                              result.status === "PASS"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {result.status}
                          </span>
                        </div>

                        {result.status !== "PASS" && (
                          <div className="mt-2 text-sm">
                            {result.error ? (
                              // Display runtime or compilation error
                              <div className="text-red-300 bg-red-900/30 p-2 rounded-md mt-1 overflow-x-auto">
                                <pre>{result.error}</pre>
                              </div>
                            ) : (
                              // Display input/output comparison for non-hidden test cases
                              !result.is_hidden && (
                                <>
                                  <div className="mb-1">
                                    <span className="text-zinc-400">
                                      Input:{" "}
                                    </span>
                                    <pre className="inline">{result.input}</pre>
                                  </div>
                                  <div className="mb-1">
                                    <span className="text-zinc-400">
                                      Expected:{" "}
                                    </span>
                                    <pre className="inline">
                                      {result.expected_output}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="text-zinc-400">Got: </span>
                                    <pre className="inline">
                                      {result.actual_output}
                                    </pre>
                                  </div>
                                </>
                              )
                            )}

                            {/* For hidden test cases that failed but don't have errors */}
                            {!result.error && result.is_hidden && (
                              <div className="text-amber-300">
                                This is a hidden test case. Details are not
                                displayed.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p>No question found.</p>
          </div>
        )}
      </div>

      {/* Code Editor Panel */}
      <div className="lg:w-[60%] h-[50vh] lg:h-[80vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div>
              <select
                id="language"
                className="p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                value={languageId}
                onChange={handleLanguageChange}
              >
                <option value={71}>Python 3</option>
                <option value={54}>C++ (GCC 9.2.0)</option>
                <option value={62}>Java</option>
                <option value={50}>C</option>
                <option value={63}>JavaScript</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || !question}
              className={`px-4 py-2 rounded-md ${
                submitting || !question
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {submitting ? "Running..." : "Submit Solution"}
            </button>
          </div>
          <div className="border border-zinc-700 rounded-md overflow-hidden flex-grow">
            <Editor
              height="100%"
              width="100%"
              language={languageMap[languageId]}
              defaultValue={defaultCodes[languageId]}
              theme="vs-dark"
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                automaticLayout: true,
                wordWrap: "on",
              }}
              onMount={handleEditorDidMount}
              key={languageId} // Re-render editor when language changes
            />
          </div>
        </form>
      </div>
      <Outlet />
    </div>
  );
};

export default CodingSpace;
