package db

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"
)

var ist *time.Location

func init() {
	var err error
	ist, err = time.LoadLocation("Asia/Kolkata")
	if err != nil {
		log.Fatalf("could not load IST location: %v", err)
	}
}

type BatchData struct {
	ID        int64
	Name      string
	TeacherID int64
	CreatedAt time.Time
	IsActive  bool
}

func CreateBatch(name string, userID int64) (int64, error) {
	// First, get the teacher ID from the user ID
	var teacherID int64
	err := Con.QueryRow("SELECT id FROM teacher WHERE user_id = ?", userID).Scan(&teacherID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, errors.New("teacher not found for this user")
		}
		return 0, fmt.Errorf("error finding teacher: %w", err)
	}

	query := `
        INSERT INTO batch (name, teacher_id, is_active)
        VALUES (?, ?, TRUE)
    `
	result, err := Con.Exec(query, name, teacherID)
	if err != nil {
		return 0, fmt.Errorf("error creating batch: %w", err)
	}

	batchID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("error getting new batch ID: %w", err)
	}

	return batchID, nil
}

// GetBatch fetches a single batch by ID
func GetBatch(batchID int64) (*BatchData, error) {
	query := `
		SELECT id, name, teacher_id, created_at, is_active
		FROM batch
		WHERE id = ?
	`

	var batch BatchData
	err := Con.QueryRow(query, batchID).Scan(
		&batch.ID,
		&batch.Name,
		&batch.TeacherID,
		&batch.CreatedAt,
		&batch.IsActive,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("batch not found")
		}
		return nil, fmt.Errorf("error fetching batch: %w", err)
	}

	return &batch, nil
}

func GetBatchesByTeacher(userID int64) ([]*BatchData, error) {
	// First, get the teacher ID from the user ID
	var teacherID int64
	err := Con.QueryRow("SELECT id FROM teacher WHERE user_id = ?", userID).Scan(&teacherID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("teacher not found for this user")
		}
		return nil, fmt.Errorf("error finding teacher: %w", err)
	}

	query := `
        SELECT id, name, teacher_id, created_at, is_active
        FROM batch
        WHERE teacher_id = ?
        ORDER BY created_at DESC
    `

	rows, err := Con.Query(query, teacherID)
	if err != nil {
		return nil, fmt.Errorf("error querying batches: %w", err)
	}
	defer rows.Close()

	var batches []*BatchData
	for rows.Next() {
		var batch BatchData
		if err := rows.Scan(
			&batch.ID,
			&batch.Name,
			&batch.TeacherID,
			&batch.CreatedAt,
			&batch.IsActive,
		); err != nil {
			return nil, fmt.Errorf("error scanning batch row: %w", err)
		}

		batch.CreatedAt = batch.CreatedAt.In(ist)
		log.Println(batch.CreatedAt)
		batches = append(batches, &batch)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rows: %w", err)
	}

	return batches, nil
}
func AddStudentToBatch(batchID, studentID int64) error {
	var batchExists, studentExists bool

	err := Con.QueryRow("SELECT EXISTS(SELECT 1 FROM batch WHERE id = ?)", batchID).Scan(&batchExists)
	if err != nil || !batchExists {
		return errors.New("batch not found")
	}

	err = Con.QueryRow("SELECT EXISTS(SELECT 1 FROM student WHERE id = ?)", studentID).Scan(&studentExists)
	if err != nil || !studentExists {
		return errors.New("student not found")
	}

	query := `
		INSERT INTO batch_student (batch_id, student_id)
		VALUES (?, ?)
	`

	_, err = Con.Exec(query, batchID, studentID)
	if err != nil {
		return fmt.Errorf("error adding student to batch: %w", err)
	}

	return nil
}

func GetStudentsInBatch(batchID int64) ([]*UserData, error) {
	query := `
		SELECT u.id, u.username, u.email, u.role, s.student_id
		FROM user u
		JOIN student s ON u.id = s.user_id
		JOIN batch_student bs ON s.id = bs.student_id
		WHERE bs.batch_id = ?
	`

	rows, err := Con.Query(query, batchID)
	if err != nil {
		return nil, fmt.Errorf("error querying students in batch: %w", err)
	}
	defer rows.Close()

	var students []*UserData
	for rows.Next() {
		var student UserData
		err := rows.Scan(
			&student.ID,
			&student.Username,
			&student.Email,
			&student.Role,
			&student.RoleID,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning student row: %w", err)
		}
		students = append(students, &student)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rows: %w", err)
	}

	return students, nil
}

func DeleteBatch(batchID int64, userID int64) error {
	// Get the teacher ID directly and check if user is a teacher in one query
	var teacherID int64
	err := Con.QueryRow("SELECT id FROM teacher WHERE user_id = ?", userID).Scan(&teacherID)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("only teachers can delete batches")
		}
		return fmt.Errorf("error checking teacher status: %w", err)
	}

	// Check if the batch exists and belongs to this teacher
	var exists bool
	err = Con.QueryRow("SELECT EXISTS(SELECT 1 FROM batch WHERE id = ? AND teacher_id = ?)", batchID, teacherID).Scan(&exists)
	if err != nil {
		return fmt.Errorf("error checking batch ownership: %w", err)
	}
	if !exists {
		return errors.New("batch not found or you don't have permission to delete it")
	}

	// Proceed with deletion
	query := "DELETE FROM batch WHERE id = ?"
	_, err = Con.Exec(query, batchID)
	if err != nil {
		return fmt.Errorf("error deleting batch: %w", err)
	}

	return nil
}

func RemoveStudentFromBatch(batchID, studentID int64) error {
	query := `
		DELETE FROM batch_student 
		WHERE batch_id = ? AND student_id = ?
	`

	result, err := Con.Exec(query, batchID, studentID)
	if err != nil {
		return fmt.Errorf("error removing student from batch: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("student not found in batch")
	}

	return nil
}

func UpdateBatchStatus(batchID int64, isActive bool) error {
	query := "UPDATE batch SET is_active = ? WHERE id = ?"

	result, err := Con.Exec(query, isActive, batchID)
	if err != nil {
		return fmt.Errorf("error updating batch status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return errors.New("batch not found")
	}

	return nil
}
