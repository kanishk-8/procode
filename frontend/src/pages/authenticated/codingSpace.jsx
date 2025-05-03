import React, { useState, useEffect, useRef, useContext } from "react";
import {
  useParams,
  useNavigate,
  UNSAFE_NavigationContext,
} from "react-router-dom";
import Editor from "@monaco-editor/react";

const CodingSpace = () => {
  const { questionId } = useParams();
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { navigator } = useContext(UNSAFE_NavigationContext);

  const [question, setQuestion] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [languageId, setLanguageId] = useState(71); // Default: Python (as number)
  const editorRef = useRef(null);
  const [outputMessage, setOutputMessage] = useState("");

  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef(null);

  // Navigation warning states
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [navigationDestination, setNavigationDestination] = useState(null);
  const [testInProgress, setTestInProgress] = useState(false);

  // Tab switch warning states
  const [warningCount, setWarningCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Submission confirmation modal state
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

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

  // Set up navigation blocker
  useEffect(() => {
    // Only add the listener if a test is in progress
    if (!testInProgress || submitting || error) return;

    // Store original push method to restore later
    const originalPush = navigator.push;

    // Override push method to intercept navigation attempts
    navigator.push = (to, state) => {
      // Show warning modal and store destination
      setNavigationDestination(to);
      setShowNavigationWarning(true);

      // Return false to block navigation
      return false;
    };

    // Add a listener for popstate events (browser back/forward buttons)
    const handlePopState = (event) => {
      // Prevent the default navigation
      event.preventDefault();

      // Show warning modal with the batch page as destination
      setNavigationDestination(`/batch/${batchId}`);
      setShowNavigationWarning(true);

      // Push the current URL back to the history stack to prevent navigation
      window.history.pushState(null, "", window.location.pathname);
    };

    // Push an entry to the history stack to create a point to return to
    window.history.pushState(null, "", window.location.pathname);

    // Add listener for the back button
    window.addEventListener("popstate", handlePopState);

    // Handle browser close/refresh events
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      const message =
        "You have an ongoing test. Your progress will be submitted if you leave.";
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up function
    return () => {
      // Restore original navigation behavior
      navigator.push = originalPush;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [testInProgress, submitting, error, navigator, batchId]);

  // Set up tab switch detection system
  useEffect(() => {
    // Only add the listener if a test is in progress
    if (!testInProgress || submitting || error) return;

    // Initialize warning count from localStorage if it exists
    const storedWarningCount = localStorage.getItem(`tabWarnings_${questionId}`);
    if (storedWarningCount) {
      setWarningCount(parseInt(storedWarningCount, 10));
    }

    // Handle tab/window visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User switched away from the tab
        const newWarningCount = warningCount + 1;
        setWarningCount(newWarningCount);
        
        // Store the updated warning count in localStorage
        localStorage.setItem(`tabWarnings_${questionId}`, newWarningCount.toString());
        
        // Auto-submit after 3 warnings
        if (newWarningCount >= 3) {
          // Submit the test automatically on the 3rd warning
          handleFinalSubmit();
        } else {
          // Show warning when tab becomes visible again
          setTimeout(() => setShowTabWarning(true), 500);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testInProgress, submitting, error, warningCount, questionId]);

  // Fetch question details when component mounts
  useEffect(() => {
    fetchQuestionDetails();
    setTestInProgress(true);
    return () => {
      // Clear timer interval on unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setTestInProgress(false);
    };
  }, [questionId]);

  const fetchQuestionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/getquestiondetailsbyid/${batchId}/${questionId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Check if this is due to the question being already attempted
        if (
          errorData.message &&
          errorData.message.includes("already been attempted")
        ) {
          setError(
            "This question has already been attempted and cannot be accessed again."
          );
          // Navigate back to batch page after 3 seconds
          setTimeout(() => {
            navigate(`/batch/${batchId}`);
          }, 3000);
          return;
        }
        throw new Error(
          errorData.message || "Failed to fetch question details"
        );
      }

      const data = await response.json();

      if (data.data) {
        setQuestion(data.data.Question);
        setTestCases(data.data.TestCases);

        // Initialize timer based on API response
        if (data.data.Question.TimeLimit && data.data.Attempt) {
          initializeTimer(data.data.Question.TimeLimit, data.data.Attempt);
        }
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

  // Initialize timer based on time limit and attempt information
  const initializeTimer = (timeLimit, attempt) => {
    // Try to get stored timer data from localStorage
    const storedData = localStorage.getItem(`timer_${questionId}`);
    let startTime;
    let elapsedSeconds = 0;

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      startTime = new Date(parsedData.startTime);
      elapsedSeconds = Math.floor((new Date() - startTime) / 1000);
    } else if (attempt && attempt.StartTime) {
      // If no stored data, use the attempt start time from the API
      startTime = new Date(attempt.StartTime);
      elapsedSeconds = attempt.TimeTakenSecs || 0;

      // Store the timer data in localStorage
      localStorage.setItem(
        `timer_${questionId}`,
        JSON.stringify({
          startTime: startTime,
          timeLimit: timeLimit * 60, // Convert minutes to seconds
        })
      );
    } else {
      // If no attempt data, use current time
      startTime = new Date();
      localStorage.setItem(
        `timer_${questionId}`,
        JSON.stringify({
          startTime: startTime,
          timeLimit: timeLimit * 60, // Convert minutes to seconds
        })
      );
    }

    // Calculate remaining time in seconds
    const totalSeconds = timeLimit * 60; // Convert minutes to seconds
    const remainingSeconds = totalSeconds - elapsedSeconds;

    if (remainingSeconds <= 0) {
      // Time already expired, auto-submit
      setTimeRemaining(0);
      handleFinalSubmit();
    } else {
      // Start the timer
      setTimeRemaining(remainingSeconds);
      setTimerActive(true);
      
      // Ensure we clear any existing interval before starting a new one
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      // Explicitly start the timer interval
      startTimer(remainingSeconds);
      
      console.log("Timer started with", remainingSeconds, "seconds remaining");
    }
  };

  // Start the timer countdown
  const startTimer = (initialSeconds) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setTimeRemaining(initialSeconds);
    setTimerActive(true); // Ensure timer is marked as active

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          // Time's up
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          setTimerActive(false);
          handleFinalSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Add console log for debugging
    console.log("Timer interval started:", timerIntervalRef.current);
  };

  // Format the time as mm:ss
  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e) => {
    const newLanguageId = parseInt(e.target.value, 10);
    setLanguageId(newLanguageId);
  };

  // Handle code execution without score calculation (Run Code button)
  const handleRunCode = async (e) => {
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
          calculate_score: false,
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

  // Handle final submission with score calculation
  const handleFinalSubmit = async () => {
    if (!editorRef.current) return;

    try {
      setSubmitting(true);
      setOutputMessage("Submitting final solution...");

      const code = editorRef.current.getValue();

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
          calculate_score: true,
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Failed to parse response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit solution");
      }

      // Clean up timer data from localStorage
      localStorage.removeItem(`timer_${questionId}`);

      // Clear the timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Redirect to classroom page
      navigate(`/batch/${batchId}`);
    } catch (err) {
      setError("Error submitting solution: " + err.message);
      console.error("Final submission error:", err);
      setSubmitting(false);
    }
  };

  // Show confirmation dialog before final submission
  const handleManualSubmit = () => {
    setShowSubmitConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitConfirmation(false);
    handleFinalSubmit();
  };

  // Function to confirm navigation and submit test
  const confirmNavigation = () => {
    setShowNavigationWarning(false);
    // Save the destination before starting the submission process
    const destination = navigationDestination;

    // Submit the test
    handleFinalSubmit();

    // Navigate to the destination (this works because the handleFinalSubmit already
    // has a navigate call, but we're making it more explicit)
    if (destination) {
      setTimeout(() => {
        navigate(destination);
      }, 100);
    }
  };

  // Function to cancel navigation
  const cancelNavigation = () => {
    setShowNavigationWarning(false);
    setNavigationDestination(null);
  };

  // Function to dismiss tab warning
  const dismissTabWarning = () => {
    setShowTabWarning(false);
  };

  return (
    <div className="h-screen w-screen p-4 mt-24 flex flex-col lg:flex-row gap-4">
      {/* Question Panel */}
      <div className="lg:w-[40%] h-[50vh] lg:h-[80vh] border border-zinc-700 rounded-lg overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading question...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-xl mb-4">{error}</p>
              {error.includes("already been attempted") && (
                <p>Redirecting you back to the batch page...</p>
              )}
            </div>
          </div>
        ) : question ? (
          <div className="p-6">
            {/* Timer Display */}
            {timeRemaining !== null && (
              <div
                className={`mb-4 text-center p-2 rounded-md font-mono text-xl ${
                  timeRemaining < 300
                    ? "bg-red-900/30 text-red-400"
                    : "bg-zinc-800"
                }`}
              >
                Time Remaining: {formatTime(timeRemaining)}
              </div>
            )}

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
                            : result.status === "NOT_EVALUATED"
                            ? "bg-gray-900/30"
                            : "bg-red-900/30"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>Test Case {index + 1}</span>
                          <span
                            className={
                              result.status === "PASS"
                                ? "text-green-400"
                                : result.status === "NOT_EVALUATED"
                                ? "text-gray-400"
                                : "text-red-400"
                            }
                          >
                            {result.status}
                          </span>
                        </div>

                        {result.status === "NOT_EVALUATED" ? (
                          <div className="mt-2 text-sm text-gray-400">
                            {result.error || "Test case was not evaluated"}
                          </div>
                        ) : (
                          result.status !== "PASS" && (
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
                                      <pre className="inline">
                                        {result.input}
                                      </pre>
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
                                      <span className="text-zinc-400">
                                        Got:{" "}
                                      </span>
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
                          )
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRunCode}
              disabled={submitting || !question}
              className={`px-6 py-3 ${
                submitting || !question
                  ? "bg-zinc-500/10 text-zinc-400 border border-zinc-600/20"
                  : "bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20"
              } rounded-full transition-colors shadow-lg`}
            >
              {submitting ? "Running..." : "Run Code"}
            </button>

            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={submitting || !question}
              className={`px-6 py-3 ${
                submitting || !question
                  ? "bg-zinc-500/10 text-zinc-400 border border-zinc-600/20"
                  : "bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20"
              } rounded-full transition-colors shadow-lg`}
            >
              Submit Solution
            </button>
          </div>
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
      </div>

      {/* Navigation Warning Modal */}
      {showNavigationWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Submit Test?</h3>
            <p className="mb-6 text-gray-300">
              You are about to leave this page. Your test will be automatically
              submitted with your current answers.
              <span className="block mt-2">
                Are you sure you want to proceed?
              </span>
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelNavigation}
                className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full hover:bg-zinc-500/20 transition-colors shadow-lg"
              >
                Continue Test
              </button>
              <button
                onClick={confirmNavigation}
                className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors shadow-lg"
              >
                Submit & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switch Warning Modal */}
      {showTabWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-amber-500">Tab Switch Warning</h3>
            <p className="mb-4 text-gray-300">
              We detected that you switched away from this tab. This is considered as potential
              cheating behavior.
            </p>
            <p className="mb-6 font-medium">
              Warning {warningCount} of 3. Your test will be automatically submitted after 3 warnings.
            </p>
            <div className="flex justify-end">
              <button
                onClick={dismissTabWarning}
                className="px-6 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full hover:bg-amber-500/20 transition-colors shadow-lg"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Confirmation Modal */}
      {showSubmitConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Submit Solution</h3>
            <p className="mb-6 text-gray-300">
              Are you sure you want to submit your solution? Once submitted, you
              cannot make any more changes or reattempt this question.
              {timeRemaining !== null && (
                <span className="block mt-2 font-medium">
                  You still have {formatTime(timeRemaining)} remaining.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSubmitConfirmation(false)}
                className="px-6 py-3 bg-zinc-500/10 text-zinc-400 border border-zinc-600/20 rounded-full hover:bg-zinc-500/20 transition-colors shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-6 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors shadow-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingSpace;
