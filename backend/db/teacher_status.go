package db

import (
	"database/sql"
	"errors"
)

// Teacher represents a teacher's data with status information
type Teacher struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Status   string `json:"status"`
}

// GetTeachersList returns all teachers with their status, ordering pending first
func GetTeachersList() ([]Teacher, error) {
	query := `
		SELECT teacher_id, username, email, status 
		FROM teacher 
		ORDER BY 
			CASE 
				WHEN status = 'pending' THEN 1 
				WHEN status = 'approved' THEN 2 
				WHEN status = 'revoked' THEN 3 
				ELSE 4 
			END, 
			username
	`

	rows, err := Con.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var teachers []Teacher
	for rows.Next() {
		var t Teacher
		if err := rows.Scan(&t.ID, &t.Username, &t.Email, &t.Status); err != nil {
			return nil, err
		}
		teachers = append(teachers, t)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return teachers, nil
}

// ApproveTeacher changes a teacher's status to 'approved'
func ApproveTeacher(teacherID string) error {
	return updateTeacherStatus(teacherID, "approved")
}

// RevokeTeacher changes a teacher's status to 'revoked'
func RevokeTeacher(teacherID string) error {
	return updateTeacherStatus(teacherID, "revoked")
}

// SetTeacherPending sets a teacher's status back to 'pending'
func SetTeacherPending(teacherID string) error {
	return updateTeacherStatus(teacherID, "pending")
}

// updateTeacherStatus is a helper function to update the teacher's status
func updateTeacherStatus(teacherID string, status string) error {
	query := "UPDATE teacher SET status = ? WHERE teacher_id = ?"
	result, err := Con.Exec(query, status, teacherID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("no teacher found with the given ID")
	}

	return nil
}

// GetTeacherStatus retrieves the current status of a teacher
func GetTeacherStatus(teacherID string) (string, error) {
	query := "SELECT status FROM teacher WHERE teacher_id = ?"
	var status string
	err := Con.QueryRow(query, teacherID).Scan(&status)

	if err != nil {
		if err == sql.ErrNoRows {
			return "", errors.New("teacher not found")
		}
		return "", err
	}

	return status, nil
}
