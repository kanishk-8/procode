package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

var Con *sql.DB

func InitConnection() error {

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment")
	}
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true&loc=Local",
		user, pass, host, port, name,
	)

	var err error
	Con, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("unable to open DB: %v", err)
	}

	if err := Con.Ping(); err != nil {
		return fmt.Errorf("database connection failed: %v", err)
	}
	fmt.Println("Connected to MySQL successfully!")

	if err := createTablesIfNotExist(); err != nil {
		return fmt.Errorf("error creating tables: %v", err)
	}

	return nil
}

func createTablesIfNotExist() error {
	userTable := `
	CREATE TABLE IF NOT EXISTS user (
		id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(100) NOT NULL UNIQUE,
		email VARCHAR(100),
		userpassword VARCHAR(100),
		role ENUM('student', 'teacher'),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	studentTable := `
	CREATE TABLE IF NOT EXISTS student (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id INT,
		student_id VARCHAR(100) NOT NULL,
		FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
	);`

	teacherTable := `
	CREATE TABLE IF NOT EXISTS teacher (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id INT,
		teacher_id VARCHAR(100) NOT NULL,
		FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
	);`

	batchTable := `
	CREATE TABLE IF NOT EXISTS batch (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		teacher_id INT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		is_active BOOLEAN DEFAULT TRUE,
		FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE
	);`

	batchStudentTable := `
	CREATE TABLE IF NOT EXISTS batch_student (
		id INT AUTO_INCREMENT PRIMARY KEY,
		batch_id INT NOT NULL,
		student_id INT NOT NULL,
		joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (batch_id) REFERENCES batch(id) ON DELETE CASCADE,
		FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
		UNIQUE KEY (batch_id, student_id)
	);`

	noteTable := `
	CREATE TABLE IF NOT EXISTS note (
		id INT AUTO_INCREMENT PRIMARY KEY,
		batch_id INT NOT NULL,
		title VARCHAR(255) NOT NULL,
		content TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		FOREIGN KEY (batch_id) REFERENCES batch(id) ON DELETE CASCADE
	);`

	// ✅ Updated: removed input_test_cases and expected_output from question table
	// Updated: removed updated_at timestamp, added start_time and end_time
	questionTable := `
	CREATE TABLE IF NOT EXISTS question (
		id INT AUTO_INCREMENT PRIMARY KEY,
		teacher_id INT NOT NULL,
		batch_id INT NOT NULL,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		time_limit INT DEFAULT 30, 
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		start_time DATETIME,
		end_time DATETIME,
		FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE,
		FOREIGN KEY (batch_id) REFERENCES batch(id) ON DELETE CASCADE
	);`

	// ✅ NEW TABLE: test_case
	testCaseTable := `
	CREATE TABLE IF NOT EXISTS test_case (
		id INT AUTO_INCREMENT PRIMARY KEY,
		question_id INT NOT NULL,
		input_text TEXT NOT NULL,
		expected_output TEXT NOT NULL,
		is_hidden BOOLEAN DEFAULT FALSE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
	);`

	attemptTable := `
	CREATE TABLE IF NOT EXISTS attempt (
		id INT AUTO_INCREMENT PRIMARY KEY,
		student_id INT NOT NULL,
		question_id INT NOT NULL,
		submitted_code TEXT,
		status ENUM('correct', 'incorrect', 'partially_correct') NOT NULL,
		submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
		FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
	);`

	// Added testCaseTable in the list ✅
	tables := []string{
		userTable, studentTable, teacherTable, batchTable,
		batchStudentTable, noteTable, questionTable, testCaseTable, attemptTable,
	}

	for _, table := range tables {
		_, err := Con.Exec(table)
		if err != nil {
			return err
		}
	}
	fmt.Println("Tables verified/created.")
	return nil
}
