package db

import (
	"database/sql"
	"errors"
	"fmt"
	"time"
)

type BatchData struct {
	ID        int64
	Name      string
	TeacherID int64
	CreatedAt time.Time
	IsActive  bool
}

func CreateBatch(name string, teacherID int64) (int64, error) {
	var exists bool
	err := Con.QueryRow("SELECT EXISTS(SELECT 1 FROM teacher WHERE id = ?)", teacherID).Scan(&exists)
	if err != nil {
		return 0, fmt.Errorf("error checking teacher: %w", err)
	}
	if !exists {
		return 0, errors.New("teacher not found")
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

func GetBatchesByTeacher(teacherID int64) ([]*BatchData, error) {
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
		err := rows.Scan(
			&batch.ID,
			&batch.Name,
			&batch.TeacherID,
			&batch.CreatedAt,
			&batch.IsActive,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning batch row: %w", err)
		}
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

func DeleteBatch(batchID int64) error {
	var exists bool
	err := Con.QueryRow("SELECT EXISTS(SELECT 1 FROM batch WHERE id = ?)", batchID).Scan(&exists)
	if err != nil {
		return fmt.Errorf("error checking batch: %w", err)
	}
	if !exists {
		return errors.New("batch not found")
	}

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
