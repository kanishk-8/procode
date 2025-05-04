package db

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
)

type UserData struct {
	ID       int64
	Username string
	Email    string
	Role     string
	RoleID   string
}

// UsernameExists checks if a username already exists in the database
func UsernameExists(username string) (bool, error) {
	var count int
	query := "SELECT COUNT(*) FROM user WHERE username = ?"
	err := Con.QueryRow(query, username).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("error checking username existence: %w", err)
	}
	return count > 0, nil
}

// EmailExists checks if an email already exists in the database
func EmailExists(email string) (bool, error) {
	var count int
	query := "SELECT COUNT(*) FROM user WHERE email = ?"
	err := Con.QueryRow(query, email).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("error checking email existence: %w", err)
	}
	return count > 0, nil
}

// Generate SHA-256 hash
func generateSHA256Hash(data string) string {
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

// Verify the password with nonce against stored hash
func verifyPasswordWithNonce(storedHash, providedHash, nonce string) bool {
	// Combine the stored hash with nonce
	combinedHash := storedHash + nonce

	// Hash again
	finalHash := generateSHA256Hash(combinedHash)

	// Compare with the hash provided by client
	return finalHash == providedHash
}

func CreateUserWithRole(username, email, password, role, userRoleId string) (userID int64, err error) {
	if role != "student" && role != "teacher" {
		return 0, errors.New("invalid role: must be 'student' or 'teacher'")
	}

	// Check if username already exists
	exists, err := UsernameExists(username)
	if err != nil {
		return 0, err
	}
	if exists {
		return 0, errors.New("username already exists")
	}

	// Check if email already exists
	exists, err = EmailExists(email)
	if err != nil {
		return 0, err
	}
	if exists {
		return 0, errors.New("email already exists")
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

func GetUserByCredentials(username, providedHash string, nonce string) (*UserData, error) {
	query := `
		SELECT u.id, u.username, u.email, u.userpassword, u.role
		FROM user u
		WHERE u.username = ?
	`

	var user UserData
	var storedHash string

	err := Con.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&storedHash,
		&user.Role,
	)

	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	// Verify the password using the nonce
	if !verifyPasswordWithNonce(storedHash, providedHash, nonce) {
		return nil, errors.New("invalid password")
	}

	if user.Role == "student" {
		query = "SELECT student_id FROM student WHERE user_id = ?"
		err = Con.QueryRow(query, user.ID).Scan(&user.RoleID)
		if err != nil {
			return nil, fmt.Errorf("error retrieving user role ID: %w", err)
		}
	} else if user.Role == "teacher" {
		// For teachers, check if their status is approved
		query = "SELECT teacher_id, status FROM teacher WHERE user_id = ?"
		var status string
		err = Con.QueryRow(query, user.ID).Scan(&user.RoleID, &status)
		if err != nil {
			return nil, fmt.Errorf("error retrieving teacher data: %w", err)
		}

		// If teacher's status is not approved, don't allow login
		if status != "approved" {
			return nil, errors.New("teacher account not yet approved")
		}
	} else {
		// Handle other roles (like admin) with a default roleID
		user.RoleID = "1"
	}

	return &user, nil
}
