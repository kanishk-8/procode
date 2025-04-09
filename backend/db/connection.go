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

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", user, pass, host, port, name)

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
		FOREIGN KEY (user_id) REFERENCES user(id)
	);`

	teacherTable := `
	CREATE TABLE IF NOT EXISTS teacher (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id INT,
		teacher_id VARCHAR(100) NOT NULL,
		FOREIGN KEY (user_id) REFERENCES user(id)
	);`

	tables := []string{userTable, studentTable, teacherTable}
	for _, table := range tables {
		_, err := Con.Exec(table)
		if err != nil {
			return err
		}
	}
	fmt.Println("Tables verified/created.")
	return nil
}
