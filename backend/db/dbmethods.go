package db

import (
	"errors"
	"fmt"
)

// UserData contains user information retrieved from the database
type UserData struct {
	ID       int64
	Username string
	Email    string
	Role     string
	RoleID   string
}

func CreateUserWithRole(username, email, password, role, userRoleId string) (userID int64, err error) {
	if role != "student" && role != "teacher" {
		return 0, errors.New("invalid role: must be 'student' or 'teacher'")
	}

	insertUserQuery := `
		INSERT INTO user(username, email, userpassword, role)
		VALUES (?, ?, ?, ?)
	`
	result, err := Con.Exec(insertUserQuery, username, email, password, role)
	if err != nil {
		return 0, fmt.Errorf("error inserting user: %w", err)
	}

	userID, err = result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("error getting inserted user ID: %w", err)
	}

	var insertRoleQuery string
	if role == "student" {
		insertRoleQuery = `
			INSERT INTO student(user_id, student_id)
			VALUES (?, ?)
		`
	} else {
		insertRoleQuery = `
			INSERT INTO teacher(user_id, teacher_id)
			VALUES (?, ?)
		`
	}

	_, err = Con.Exec(insertRoleQuery, userID, userRoleId)
	if err != nil {
		return 0, fmt.Errorf("error inserting into %s table: %w", role, err)
	}

	fmt.Printf("Created user with ID %d and role %s\n", userID, role)
	return userID, nil
}

// GetUserByCredentials validates credentials and returns user information
func GetUserByCredentials(username, password string) (*UserData, error) {
	query := `
		SELECT u.id, u.username, u.email, u.userpassword, u.role
		FROM user u
		WHERE u.username = ?
	`

	var user UserData
	var storedPassword string

	err := Con.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&storedPassword,
		&user.Role,
	)

	if err != nil {
		return nil, fmt.Errorf("user not found or database error: %w", err)
	}

	// Verify password (in a real app, you'd use bcrypt or similar)
	if storedPassword != password {
		return nil, errors.New("invalid password")
	}

	// Get role-specific ID (student_id or teacher_id)
	if user.Role == "student" {
		query = "SELECT student_id FROM student WHERE user_id = ?"
	} else {
		query = "SELECT teacher_id FROM teacher WHERE user_id = ?"
	}

	err = Con.QueryRow(query, user.ID).Scan(&user.RoleID)
	if err != nil {
		return nil, fmt.Errorf("error retrieving user role ID: %w", err)
	}

	return &user, nil
}
