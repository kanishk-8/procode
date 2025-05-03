package db

import (
	"database/sql"
	"errors"
	"fmt"
	"time"
)

// QuestionAttemptStatus represents the status of a student's attempt on a question
type QuestionAttemptStatus struct {
	AttemptID     int64      `json:"attemptId"`
	Status        string     `json:"status"`
	Score         int        `json:"score"`
	StartTime     *time.Time `json:"startTime"`
	EndTime       *time.Time `json:"endTime"`
	TimeTaken     int        `json:"timeTaken"`
	SubmittedCode string     `json:"submittedCode"`
	IsAttempted   bool       `json:"isAttempted"`
}

// StudentAttemptStatus represents a student and their attempt status
type StudentAttemptStatus struct {
	StudentID   int64                  `json:"studentId"`
	UserID      int64                  `json:"userId"`
	Username    string                 `json:"username"`
	StudentCode string                 `json:"studentCode"`
	Attempt     *QuestionAttemptStatus `json:"attempt"`
}

// BatchQuestionStatus represents all students' attempt statuses for a question
type BatchQuestionStatus struct {
	QuestionID    int64                  `json:"questionId"`
	QuestionTitle string                 `json:"questionTitle"`
	BatchID       int64                  `json:"batchId"`
	BatchName     string                 `json:"batchName"`
	Students      []StudentAttemptStatus `json:"students"`
}

// GetQuestionStatus fetches the attempt status of all students for a question in a batch
// This is a teacher-only endpoint
func GetQuestionStatus(userID, batchID, questionID int64) (*BatchQuestionStatus, error) {
	// Check if user is a teacher
	var teacherID int64
	err := Con.QueryRow("SELECT id FROM teacher WHERE user_id = ?", userID).Scan(&teacherID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("only teachers can access this endpoint")
		}
		return nil, fmt.Errorf("error checking teacher status: %w", err)
	}

	// Verify batch ownership
	var batchOwned bool
	var batchName string
	err = Con.QueryRow("SELECT EXISTS(SELECT 1 FROM batch WHERE id = ? AND teacher_id = ?), name FROM batch WHERE id = ?",
		batchID, teacherID, batchID).Scan(&batchOwned, &batchName)
	if err != nil {
		return nil, fmt.Errorf("error checking batch ownership: %w", err)
	}
	if !batchOwned {
		return nil, errors.New("you don't have permission to access this batch")
	}

	// Check if question exists in the batch
	var questionExists bool
	var questionTitle string
	err = Con.QueryRow("SELECT EXISTS(SELECT 1 FROM question WHERE id = ? AND batch_id = ?), title FROM question WHERE id = ?",
		questionID, batchID, questionID).Scan(&questionExists, &questionTitle)
	if err != nil {
		return nil, fmt.Errorf("error checking question: %w", err)
	}
	if !questionExists {
		return nil, errors.New("question not found in this batch")
	}

	// Get all students enrolled in the batch
	rows, err := Con.Query(`
		SELECT s.id, s.user_id, u.username, s.student_id
		FROM batch_student bs
		JOIN student s ON bs.student_id = s.id
		JOIN user u ON s.user_id = u.id
		WHERE bs.batch_id = ?
		ORDER BY u.username
	`, batchID)
	if err != nil {
		return nil, fmt.Errorf("error retrieving batch students: %w", err)
	}
	defer rows.Close()

	var students []StudentAttemptStatus
	for rows.Next() {
		var student StudentAttemptStatus
		student.Attempt = &QuestionAttemptStatus{
			Status:      "not_attempted",
			IsAttempted: false,
			Score:       0,
		}

		err := rows.Scan(&student.StudentID, &student.UserID, &student.Username, &student.StudentCode)
		if err != nil {
			return nil, fmt.Errorf("error scanning student data: %w", err)
		}

		// Get attempt details for each student
		err = Con.QueryRow(`
			SELECT id, status, score, start_time, end_time, 
				   time_taken_seconds, submitted_code, attempted
			FROM attempt
			WHERE student_id = ? AND question_id = ?
			ORDER BY id DESC LIMIT 1
		`, student.StudentID, questionID).Scan(
			&student.Attempt.AttemptID, &student.Attempt.Status, &student.Attempt.Score,
			&student.Attempt.StartTime, &student.Attempt.EndTime, &student.Attempt.TimeTaken,
			&student.Attempt.SubmittedCode, &student.Attempt.IsAttempted,
		)

		// If there's no attempt record, we use the default "not_attempted" status
		if err != nil && err != sql.ErrNoRows {
			return nil, fmt.Errorf("error retrieving attempt details for student %d: %w", student.StudentID, err)
		}

		students = append(students, student)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating through students: %w", err)
	}

	return &BatchQuestionStatus{
		QuestionID:    questionID,
		QuestionTitle: questionTitle,
		BatchID:       batchID,
		BatchName:     batchName,
		Students:      students,
	}, nil
}
