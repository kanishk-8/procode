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

type TestCase struct {
	InputText      string
	ExpectedOutput string
	IsHidden       bool
}

type QuestionBasicInfo struct {
	ID    int64  `json:"id"`
	Title string `json:"title"`
}

type QuestionWithTestCases struct {
	Question  QuestionData
	TestCases []TestCaseData
}

func CreateQuestion(userID int64, batchID int64, title, description string, testCases []TestCase) (int64, error) {
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

	rows, err := Con.Query("SELECT id, title FROM question WHERE batch_id = ?", batchID)
	if err != nil {
		return nil, fmt.Errorf("error querying questions: %w", err)
	}
	defer rows.Close()

	var questions []QuestionBasicInfo
	for rows.Next() {
		var q QuestionBasicInfo
		if err := rows.Scan(&q.ID, &q.Title); err != nil {
			return nil, fmt.Errorf("error scanning question row: %w", err)
		}
		questions = append(questions, q)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating question rows: %w", err)
	}

	return questions, nil
}

func GetQuestionByID(userID int64, batchID int64, questionID int64) (*QuestionWithTestCases, error) {
	// Check if user is a teacher
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

	// Validate question exists in the batch
	var exists bool
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
		SELECT id, teacher_id, batch_id, title, description, created_at, updated_at 
		FROM question 
		WHERE id = ?`, questionID).Scan(
		&question.ID, &question.TeacherID, &question.BatchID,
		&question.Title, &question.Description, &question.CreatedAt, &question.UpdatedAt)
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

	return &QuestionWithTestCases{
		Question:  question,
		TestCases: testCases,
	}, nil
}
