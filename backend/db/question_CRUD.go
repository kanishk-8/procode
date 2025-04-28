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
	CreatedAt   time.Time
	UpdatedAt   time.Time
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

// TestCase represents a test case to be added to a question
type TestCase struct {
	InputText      string
	ExpectedOutput string
	IsHidden       bool
}

func CreateQuestion(userID int64, batchID int64, title, description string, testCases []TestCase) (int64, error) {
	// First, get the teacher ID from the user ID
	var teacherID int64
	err := Con.QueryRow("SELECT id FROM teacher WHERE user_id = ?", userID).Scan(&teacherID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, errors.New("teacher not found for this user")
		}
		return 0, fmt.Errorf("error finding teacher: %w", err)
	}

	// Verify if the batch exists and belongs to this teacher
	var exists bool
	err = Con.QueryRow("SELECT EXISTS(SELECT 1 FROM batch WHERE id = ? AND teacher_id = ?)",
		batchID, teacherID).Scan(&exists)
	if err != nil {
		return 0, fmt.Errorf("error checking batch ownership: %w", err)
	}
	if !exists {
		return 0, errors.New("batch not found or you don't have permission to add questions to it")
	}

	// Validate required fields
	if title == "" || description == "" {
		return 0, errors.New("title and description are required")
	}

	// Start a transaction
	tx, err := Con.Begin()
	if err != nil {
		return 0, fmt.Errorf("error starting transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Insert the question
	questionQuery := `
		INSERT INTO question (teacher_id, batch_id, title, description)
		VALUES (?, ?, ?, ?)
	`

	result, err := tx.Exec(questionQuery, teacherID, batchID, title, description)
	if err != nil {
		return 0, fmt.Errorf("error creating question: %w", err)
	}

	questionID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("error getting new question ID: %w", err)
	}

	// Insert the test cases
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

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return 0, fmt.Errorf("error committing transaction: %w", err)
	}

	return questionID, nil
}
