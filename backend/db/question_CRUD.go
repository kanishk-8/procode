package db

import (
	"database/sql"
	"errors"
	"fmt"
	"time"
)

type QuestionData struct {
	ID          int64
	TeacherID   int64
	BatchID     int64
	Title       string
	Description string
	TimeLimit   int // Time limit in minutes
	CreatedAt   time.Time
	StartTime   *time.Time // Add StartTime field
	EndTime     *time.Time // Add EndTime field
}

type TestCaseData struct {
	ID             int64
	QuestionID     int64
	InputText      string
	ExpectedOutput string
	IsHidden       bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type TestCase struct {
	InputText      string
	ExpectedOutput string
	IsHidden       bool
}

type QuestionBasicInfo struct {
	ID        int64      `json:"id"`
	Title     string     `json:"title"`
	TimeLimit int        `json:"timeLimit"`
	StartTime *time.Time `json:"startTime"`
	EndTime   *time.Time `json:"endTime"`
}

type QuestionWithTestCases struct {
	Question  QuestionData
	TestCases []TestCaseData
}

// Add new structs to contain attempt information
type AttemptInfo struct {
	ID            int64     `json:"id"`
	StartTime     time.Time `json:"startTime"`
	TimeTakenSecs int       `json:"timeTakenSecs"`
	Status        string    `json:"status"`
}

type QuestionWithTestCasesAndAttempt struct {
	Question  QuestionData
	TestCases []TestCaseData
	Attempt   *AttemptInfo
}

func CreateQuestion(userID int64, batchID int64, title, description string, testCases []TestCase, timeLimit int, startTime, endTime *time.Time) (int64, error) {
	var teacherID int64
	err := Con.QueryRow("SELECT id FROM teacher WHERE user_id = ?", userID).Scan(&teacherID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, errors.New("teacher not found for this user")
		}
		return 0, fmt.Errorf("error finding teacher: %w", err)
	}

	var exists bool
	err = Con.QueryRow("SELECT EXISTS(SELECT 1 FROM batch WHERE id = ? AND teacher_id = ?)",
		batchID, teacherID).Scan(&exists)
	if err != nil {
		return 0, fmt.Errorf("error checking batch ownership: %w", err)
	}
	if !exists {
		return 0, errors.New("batch not found or you don't have permission to add questions to it")
	}

	if title == "" || description == "" {
		return 0, errors.New("title and description are required")
	}

	tx, err := Con.Begin()
	if err != nil {
		return 0, fmt.Errorf("error starting transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Update query to include start_time and end_time
	questionQuery := `
		INSERT INTO question (teacher_id, batch_id, title, description, time_limit, start_time, end_time)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	result, err := tx.Exec(questionQuery, teacherID, batchID, title, description, timeLimit, startTime, endTime)
	if err != nil {
		return 0, fmt.Errorf("error creating question: %w", err)
	}

	questionID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("error getting new question ID: %w", err)
	}

	if len(testCases) > 0 {
		testCaseQuery := `
			INSERT INTO test_case (question_id, input_text, expected_output, is_hidden)
			VALUES (?, ?, ?, ?)
		`
		for _, tc := range testCases {
			_, err = tx.Exec(testCaseQuery, questionID, tc.InputText, tc.ExpectedOutput, tc.IsHidden)
			if err != nil {
				return 0, fmt.Errorf("error creating test case: %w", err)
			}
		}
	}

	if err = tx.Commit(); err != nil {
		return 0, fmt.Errorf("error committing transaction: %w", err)
	}

	return questionID, nil
}

func GetQuestionsByBatch(userID int64, batchID int64) ([]QuestionBasicInfo, error) {
	// Check if the user is a teacher
	var teacherID int64
	err := Con.QueryRow("SELECT id FROM teacher WHERE user_id = ?", userID).Scan(&teacherID)
	if err == nil {
		// User is a teacher, check if they own the batch
		var exists bool
		err = Con.QueryRow("SELECT EXISTS(SELECT 1 FROM batch WHERE id = ? AND teacher_id = ?)",
			batchID, teacherID).Scan(&exists)
		if err != nil {
			return nil, fmt.Errorf("error checking batch ownership: %w", err)
		}
		if !exists {
			return nil, errors.New("batch not found or you don't have permission to access it")
		}
	} else if err != sql.ErrNoRows {
		return nil, fmt.Errorf("error querying database: %w", err)
	} else {
		// User is not a teacher, check if they are a student in this batch
		var studentID int64
		err = Con.QueryRow("SELECT id FROM student WHERE user_id = ?", userID).Scan(&studentID)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, errors.New("user is neither a teacher nor a student")
			}
			return nil, fmt.Errorf("error finding student: %w", err)
		}

		// Check if student is enrolled in the batch
		var exists bool
		err = Con.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM batch_student 
			WHERE batch_id = ? AND student_id = ?)`,
			batchID, studentID).Scan(&exists)
		if err != nil {
			return nil, fmt.Errorf("error checking batch enrollment: %w", err)
		}
		if !exists {
			return nil, errors.New("you are not enrolled in this batch")
		}
	}

	// Changed from ORDER BY created_at DESC to order by start_time
	rows, err := Con.Query(`
		SELECT id, title, time_limit, start_time, end_time 
		FROM question 
		WHERE batch_id = ? 
		ORDER BY CASE WHEN start_time IS NULL THEN 0 ELSE 1 END, start_time DESC
	`, batchID)
	if err != nil {
		return nil, fmt.Errorf("error querying questions: %w", err)
	}
	defer rows.Close()

	var questions []QuestionBasicInfo
	for rows.Next() {
		var q QuestionBasicInfo
		if err := rows.Scan(&q.ID, &q.Title, &q.TimeLimit, &q.StartTime, &q.EndTime); err != nil {
			return nil, fmt.Errorf("error scanning question row: %w", err)
		}
		questions = append(questions, q)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating question rows: %w", err)
	}

	return questions, nil
}

func GetQuestionByID(userID int64, batchID int64, questionID int64) (*QuestionWithTestCasesAndAttempt, error) {
	// Check if user is a student (teachers cannot access this function)
	var studentID int64
	err := Con.QueryRow("SELECT id FROM student WHERE user_id = ?", userID).Scan(&studentID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("only students can access this function")
		}
		return nil, fmt.Errorf("error finding student: %w", err)
	}

	// Check if student is enrolled in the batch
	var exists bool
	err = Con.QueryRow(`
		SELECT EXISTS(SELECT 1 FROM batch_student 
		WHERE batch_id = ? AND student_id = ?)`,
		batchID, studentID).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("error checking batch enrollment: %w", err)
	}
	if !exists {
		return nil, errors.New("you are not enrolled in this batch")
	}

	// Validate question exists in the batch
	err = Con.QueryRow("SELECT EXISTS(SELECT 1 FROM question WHERE id = ? AND batch_id = ?)",
		questionID, batchID).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("error checking question: %w", err)
	}
	if !exists {
		return nil, errors.New("question not found in this batch")
	}

	// Get question details
	var question QuestionData
	err = Con.QueryRow(`
		SELECT id, teacher_id, batch_id, title, description, time_limit, created_at, start_time, end_time 
		FROM question 
		WHERE id = ?`, questionID).Scan(
		&question.ID, &question.TeacherID, &question.BatchID,
		&question.Title, &question.Description, &question.TimeLimit, &question.CreatedAt, &question.StartTime, &question.EndTime)
	if err != nil {
		return nil, fmt.Errorf("error retrieving question: %w", err)
	}

	// Get non-hidden test cases
	rows, err := Con.Query(`
		SELECT id, question_id, input_text, expected_output, is_hidden, created_at, updated_at
		FROM test_case 
		WHERE question_id = ? AND is_hidden = false`, questionID)
	if err != nil {
		return nil, fmt.Errorf("error retrieving test cases: %w", err)
	}
	defer rows.Close()

	var testCases []TestCaseData
	for rows.Next() {
		var tc TestCaseData
		if err := rows.Scan(&tc.ID, &tc.QuestionID, &tc.InputText, &tc.ExpectedOutput,
			&tc.IsHidden, &tc.CreatedAt, &tc.UpdatedAt); err != nil {
			return nil, fmt.Errorf("error scanning test case row: %w", err)
		}
		testCases = append(testCases, tc)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating test case rows: %w", err)
	}

	// Check for an existing in-progress attempt
	var attemptInfo AttemptInfo

	err = Con.QueryRow(`
		SELECT id, start_time, IFNULL(time_taken_seconds, 0), status
		FROM attempt
		WHERE student_id = ? AND question_id = ? AND status = 'in_progress'
		ORDER BY id DESC
		LIMIT 1
	`, studentID, questionID).Scan(&attemptInfo.ID, &attemptInfo.StartTime, &attemptInfo.TimeTakenSecs, &attemptInfo.Status)

	if err != nil {
		if err != sql.ErrNoRows {
			return nil, fmt.Errorf("error checking existing attempt: %w", err)
		}

		// No existing attempt found, create a new one with current time as start time
		// This only happens the first time a student accesses the question
		now := time.Now()
		result, err := Con.Exec(`
			INSERT INTO attempt (student_id, question_id, status, start_time)
			VALUES (?, ?, 'in_progress', ?)
		`, studentID, questionID, now)
		if err != nil {
			return nil, fmt.Errorf("error creating attempt record: %w", err)
		}

		attemptID, err := result.LastInsertId()
		if err != nil {
			return nil, fmt.Errorf("error getting new attempt ID: %w", err)
		}

		attemptInfo.ID = attemptID
		attemptInfo.StartTime = now
		attemptInfo.TimeTakenSecs = 0
		attemptInfo.Status = "in_progress"
	}
	// Note: If an attempt already exists, we use it without modification to preserve the original start time

	return &QuestionWithTestCasesAndAttempt{
		Question:  question,
		TestCases: testCases,
		Attempt:   &attemptInfo,
	}, nil
}
