package db

import (
	"database/sql"
	"errors"
	"fmt"
	"time"
)

type QuestionData struct {
	ID             int64
	TeacherID      int64
	BatchID        int64
	Title          string
	Description    string
	InputTestCases string
	ExpectedOutput string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

func CreateQuestion(userID int64, batchID int64, title, description, inputTestCases, expectedOutput string) (int64, error) {
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

	query := `
		INSERT INTO question (teacher_id, batch_id, title, description, input_test_cases, expected_output)
		VALUES (?, ?, ?, ?, ?, ?)
	`

	result, err := Con.Exec(query, teacherID, batchID, title, description, inputTestCases, expectedOutput)
	if err != nil {
		return 0, fmt.Errorf("error creating question: %w", err)
	}

	questionID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("error getting new question ID: %w", err)
	}

	return questionID, nil
}

func GetQuestion(questionID int64) (*QuestionData, error) {
	query := `
		SELECT id, teacher_id, batch_id, title, description, input_test_cases, 
			expected_output, created_at, updated_at
		FROM question
		WHERE id = ?
	`

	var question QuestionData
	err := Con.QueryRow(query, questionID).Scan(
		&question.ID,
		&question.TeacherID,
		&question.BatchID,
		&question.Title,
		&question.Description,
		&question.InputTestCases,
		&question.ExpectedOutput,
		&question.CreatedAt,
		&question.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("question not found")
		}
		return nil, fmt.Errorf("error fetching question: %w", err)
	}

	return &question, nil
}
