package db

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// Language IDs for Judge0 API
// const (
// 		PYTHON3    = 71
// 		GO         = 60
// 		JAVA       = 62
// 		CPP        = 54
// 		C          = 50
// 		JAVASCRIPT = 63
// 		// Add more languages as needed
// )

// TestResult represents the result of a single test case
type TestResult struct {
	Status         string `json:"status"`
	Input          string `json:"input,omitempty"`
	ExpectedOutput string `json:"expected_output,omitempty"`
	ActualOutput   string `json:"actual_output"`
	IsHidden       bool   `json:"is_hidden"`
	Error          string `json:"error,omitempty"` // For runtime or compilation errors
}

// EvaluationResult represents the complete result of code evaluation
type EvaluationResult struct {
	TotalTests  int          `json:"total_tests"`
	PassedTests int          `json:"passed_tests"`
	TestResults []TestResult `json:"test_results"`
	Status      string       `json:"status"`
}

// Judge0Submission represents the JSON structure for Judge0 API submission
type Judge0Submission struct {
	SourceCode string `json:"source_code"`
	LanguageID int    `json:"language_id"`
	Stdin      string `json:"stdin"`
}

// Judge0Response represents the JSON structure for Judge0 API response
type Judge0Response struct {
	Stdout        string `json:"stdout"`
	Stderr        string `json:"stderr"`
	CompileOutput string `json:"compile_output"`
	Message       string `json:"message"`
	Status        struct {
		ID          int    `json:"id"`
		Description string `json:"description"`
	} `json:"status"`
}

// EvaluateCode evaluates a code submission against test cases using Judge0 API
func EvaluateCode(userID int64, questionID int64, code string, languageID int, calculateScore bool) (*EvaluationResult, error) {
	// 1. Validate if the user is a student
	var studentID int64
	err := Con.QueryRow("SELECT id FROM student WHERE user_id = ?", userID).Scan(&studentID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user is not a student")
		}
		return nil, fmt.Errorf("error finding student: %w", err)
	}

	// 2. Find the batch to which the question belongs and get time limit
	var batchID int64
	var timeLimit int
	err = Con.QueryRow("SELECT batch_id, time_limit FROM question WHERE id = ?", questionID).Scan(&batchID, &timeLimit)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("question not found")
		}
		return nil, fmt.Errorf("error finding question: %w", err)
	}

	// 3. Check if the student is enrolled in the batch
	var enrolled bool
	err = Con.QueryRow(`
		SELECT EXISTS(SELECT 1 FROM batch_student 
		WHERE batch_id = ? AND student_id = ?)`,
		batchID, studentID).Scan(&enrolled)
	if err != nil {
		return nil, fmt.Errorf("error checking batch enrollment: %w", err)
	}
	if !enrolled {
		return nil, errors.New("student is not enrolled in the batch containing this question")
	}

	// 4. Check if a final submission has already been made
	var attemptID int64
	var endTimeExists bool
	var startTime time.Time
	var alreadyAttempted bool

	err = Con.QueryRow(`
		SELECT id, start_time, (end_time IS NOT NULL) as has_end_time, attempted
		FROM attempt 
		WHERE student_id = ? AND question_id = ?
		ORDER BY id DESC LIMIT 1`,
		studentID, questionID).Scan(&attemptID, &startTime, &endTimeExists, &alreadyAttempted)

	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("error checking for existing attempt: %w", err)
	}

	// If no attempt found, it's an error since an attempt should have been created when question was retrieved
	if err == sql.ErrNoRows {
		return nil, errors.New("no attempt record found, please access the question details first")
	}

	// If end_time exists, no more submissions allowed
	if endTimeExists {
		return nil, errors.New("final submission has already been made for this question")
	}

	// If this is a graded submission (calculateScore is true) and the attempt is already marked as attempted
	if calculateScore && alreadyAttempted {
		return nil, errors.New("this attempt has already been submitted for grading")
	}

	// 5. Fetch all test cases for the question
	rows, err := Con.Query(`
		SELECT input_text, expected_output, is_hidden
		FROM test_case 
		WHERE question_id = ?`, questionID)
	if err != nil {
		return nil, fmt.Errorf("error retrieving test cases: %w", err)
	}
	defer rows.Close()

	// 5. Prepare test cases for evaluation
	var testCases []struct {
		Input          string
		ExpectedOutput string
		IsHidden       bool
	}

	for rows.Next() {
		var tc struct {
			Input          string
			ExpectedOutput string
			IsHidden       bool
		}
		if err := rows.Scan(&tc.Input, &tc.ExpectedOutput, &tc.IsHidden); err != nil {
			return nil, fmt.Errorf("error scanning test case row: %w", err)
		}
		testCases = append(testCases, tc)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating test case rows: %w", err)
	}

	if len(testCases) == 0 {
		return nil, errors.New("no test cases found for this question")
	}

	// 6. Setup Judge0 API
	apiKey := os.Getenv("JUDGE0_API")
	if apiKey == "" {
		return nil, errors.New("Judge0 API key not found in environment")
	}

	apiURL := "https://judge0-ce.p.rapidapi.com"

	// 7. Evaluate code against each test case
	result := EvaluationResult{
		TotalTests:  len(testCases),
		PassedTests: 0,
		TestResults: make([]TestResult, 0, len(testCases)),
	}

	// Run the first test case
	if len(testCases) > 0 {
		firstTestCase := testCases[0]
		testResult, err := runTestCase(apiURL, apiKey, code, languageID,
			firstTestCase.Input, firstTestCase.ExpectedOutput, firstTestCase.IsHidden)
		if err != nil {
			return nil, fmt.Errorf("error running test case: %w", err)
		}

		result.TestResults = append(result.TestResults, testResult)
		if testResult.Status == "PASS" {
			result.PassedTests++
		}

		// If the first test case has an error, don't run the rest
		if testResult.Error != "" {
			// Add remaining test cases as NOT_EVALUATED
			for i := 1; i < len(testCases); i++ {
				tc := testCases[i]
				notEvaluatedResult := TestResult{
					Status:         "NOT_EVALUATED",
					Input:          tc.Input,
					ExpectedOutput: tc.ExpectedOutput,
					IsHidden:       tc.IsHidden,
					ActualOutput:   "",
					Error:          "Not evaluated due to error in first test case",
				}

				// Don't include input and expected output for hidden test cases
				if tc.IsHidden {
					notEvaluatedResult.Input = ""
					notEvaluatedResult.ExpectedOutput = ""
				}

				result.TestResults = append(result.TestResults, notEvaluatedResult)
			}
		} else {
			// Process the remaining test cases only if the first one didn't have errors
			for i := 1; i < len(testCases); i++ {
				tc := testCases[i]
				testResult, err := runTestCase(apiURL, apiKey, code, languageID, tc.Input, tc.ExpectedOutput, tc.IsHidden)
				if err != nil {
					return nil, fmt.Errorf("error running test case: %w", err)
				}

				result.TestResults = append(result.TestResults, testResult)
				if testResult.Status == "PASS" {
					result.PassedTests++
				}
			}
		}
	}

	// 8. Determine overall status
	status := "incorrect"
	if result.PassedTests == result.TotalTests {
		status = "correct"
	} else if result.PassedTests > 0 {
		status = "partially_correct"
	}
	result.Status = status

	// 9. Calculate score if flag is provided
	score := 0
	if calculateScore {
		score = int((float64(result.PassedTests) / float64(result.TotalTests)) * 100)
	}

	// 10. Handle timing using the retrieved start_time
	endTime := time.Now()
	var timeTaken int = 0

	// Calculate time taken in seconds using the start_time from the existing attempt
	if !startTime.IsZero() {
		timeTaken = int(endTime.Sub(startTime).Seconds())

		// Validate if time is within limits (with 10s relaxation)
		// Convert timeLimit from minutes to seconds and add relaxation
		maxAllowedTimeSeconds := (timeLimit * 60) + 10
		if timeTaken > maxAllowedTimeSeconds {
			status = "timed_out"
			result.Status = status
		}
	}

	// 11. Update the attempt record only if this is a final submission
	if calculateScore {
		// Final submission - update all fields including end_time
		_, err = Con.Exec(`
			UPDATE attempt 
			SET submitted_code = ?, status = ?, score = ?, end_time = ?, time_taken_seconds = ?, attempted = ?
			WHERE id = ?`,
			code, status, score, endTime, timeTaken, calculateScore, attemptID)
		if err != nil {
			return nil, fmt.Errorf("error updating attempt: %w", err)
		}
	}
	// No else block - we don't update the attempt table at all when calculateScore is false

	return &result, nil
}

// runTestCase executes a single test case against the Judge0 API
func runTestCase(apiURL, apiKey, code string, languageID int, input, expectedOutput string, isHidden bool) (TestResult, error) {
	submission := Judge0Submission{
		SourceCode: code,
		LanguageID: languageID,
		Stdin:      input,
	}

	jsonData, err := json.Marshal(submission)
	if err != nil {
		return TestResult{}, fmt.Errorf("error marshaling submission: %w", err)
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/submissions", apiURL), bytes.NewBuffer(jsonData))
	if err != nil {
		return TestResult{}, fmt.Errorf("error creating request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-RapidAPI-Host", "judge0-ce.p.rapidapi.com")
	req.Header.Set("X-RapidAPI-Key", apiKey)

	// Add query parameters
	q := req.URL.Query()
	q.Add("base64_encoded", "false")
	q.Add("wait", "true")
	req.URL.RawQuery = q.Encode()

	// Make the request
	client := &http.Client{
		Timeout: 30 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		return TestResult{}, fmt.Errorf("error sending request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return TestResult{}, fmt.Errorf("error reading response: %w", err)
	}

	var result Judge0Response
	if err := json.Unmarshal(body, &result); err != nil {
		return TestResult{}, fmt.Errorf("error unmarshaling response: %w", err)
	}

	// Process the result
	actualOutput := strings.TrimSpace(result.Stdout)
	expectedOutput = strings.TrimSpace(expectedOutput)

	// Create the test result
	testResult := TestResult{
		ActualOutput: actualOutput,
		IsHidden:     isHidden,
	}

	// Check for compilation or runtime errors
	if result.Status.ID != 3 { // 3 is the status ID for "Accepted" in Judge0
		// There was some error
		errorOutput := ""

		// Prioritize error messages in this order
		if result.CompileOutput != "" {
			errorOutput = result.CompileOutput
		} else if result.Stderr != "" {
			errorOutput = result.Stderr
		} else if result.Message != "" {
			errorOutput = result.Message
		} else {
			errorOutput = "Execution error: " + result.Status.Description
		}

		testResult.Status = "FAIL"
		testResult.Error = errorOutput
		return testResult, nil
	}

	// No errors, check if output matches expected
	if actualOutput == expectedOutput {
		testResult.Status = "PASS"
	} else {
		testResult.Status = "FAIL"
	}

	// Only include input and expected output for non-hidden test cases
	if !isHidden {
		testResult.Input = input
		testResult.ExpectedOutput = expectedOutput
	}

	return testResult, nil
}
