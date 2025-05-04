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
		role ENUM('student', 'teacher', 'admin'),
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
		status ENUM('pending', 'approved','revoked') DEFAULT 'pending',
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
		score INT DEFAULT 0,
		status ENUM('correct', 'incorrect', 'partially_correct', 'in_progress', 'timed_out') NOT NULL,
		start_time TIMESTAMP,
		end_time TIMESTAMP,
		time_taken_seconds INT,
		attempted BOOLEAN DEFAULT FALSE,
		submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
		FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
	);`

	blogTable := `
	CREATE TABLE IF NOT EXISTS blog (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id INT NOT NULL,
		title VARCHAR(255) NOT NULL,
		content TEXT NOT NULL,
		excerpt VARCHAR(255),
		image_url VARCHAR(2048),
		status ENUM('pending', 'verified', 'rejected', 'delete_requested') DEFAULT 'pending',
		verified_by INT,
		deletion_requested_by INT,
		deletion_message TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
		FOREIGN KEY (verified_by) REFERENCES user(id) ON DELETE SET NULL,
		FOREIGN KEY (deletion_requested_by) REFERENCES user(id) ON DELETE SET NULL
	);`

	blogTagTable := `
	CREATE TABLE IF NOT EXISTS blog_tag (
		id INT AUTO_INCREMENT PRIMARY KEY,
		blog_id INT NOT NULL,
		tag_name VARCHAR(50) NOT NULL,
		FOREIGN KEY (blog_id) REFERENCES blog(id) ON DELETE CASCADE,
		UNIQUE KEY (blog_id, tag_name)
	);`

	tables := []string{
		userTable, studentTable, teacherTable, batchTable,
		batchStudentTable, noteTable, questionTable, testCaseTable, attemptTable,
		blogTable, blogTagTable,
	}

	for _, table := range tables {
		_, err := Con.Exec(table)
		if err != nil {
			return err
		}
	}
	fmt.Println("Tables verified/created.")

	// After tables are created, create admin user if not exists
	if err := createAdminIfNotExists(); err != nil {
		return fmt.Errorf("error creating admin user: %v", err)
	}

	return nil
}

func createAdminIfNotExists() error {
	var count int
	if err := Con.QueryRow("SELECT COUNT(*) FROM user WHERE role = 'admin'").Scan(&count); err != nil {
		return err
	}

	if count == 0 {
		// Create admin user
		hashedPassword := generateSHA256Hash("admin123")
		_, err := Con.Exec(
			"INSERT INTO user (username, email, userpassword, role) VALUES (?, ?, ?, ?)",
			"admin", "admin@procode.in", hashedPassword, "admin",
		)
		if err != nil {
			return err
		}
		fmt.Println("Admin user created successfully")
	}

	return nil
}
