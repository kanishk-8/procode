package db

import (
	"database/sql"
	"fmt"
	"time"
)

// StudentStats contains all dashboard statistics for a student
type StudentStats struct {
	TotalAttempted     int                 `json:"totalAttempted"`
	CompletedQuestions int                 `json:"completedQuestions"`
	AverageScore       float64             `json:"averageScore"`
	CorrectAnswers     int                 `json:"correctAnswers"`
	IncorrectAnswers   int                 `json:"incorrectAnswers"`
	PartialAnswers     int                 `json:"partialAnswers"`
	HighestScore       int                 `json:"highestScore"`
	TotalBatches       int                 `json:"totalBatches"`
	RecentActivity     []RecentAttemptInfo `json:"recentActivity"`
}

// RecentAttemptInfo contains detailed information about a recent attempt
type RecentAttemptInfo struct {
	ID            int64     `json:"id"`
	StartTime     time.Time `json:"startTime"`
	TimeTakenSecs int       `json:"timeTakenSecs"`
	Status        string    `json:"status"`
	Score         int       `json:"score"`
	QuestionTitle string    `json:"questionTitle"`
	BatchName     string    `json:"batchName"`
}

// GetStudentDashboardStats fetches all dashboard statistics for a student
func GetStudentDashboardStats(userID int64) (*StudentStats, error) {
	var studentID int64
	err := Con.QueryRow("SELECT id FROM student WHERE user_id = ?", userID).Scan(&studentID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("student not found for this user")
		}
		return nil, fmt.Errorf("error finding student: %w", err)
	}

	stats := &StudentStats{}

	// Get total attempted and completed questions
	err = Con.QueryRow(`
		SELECT 
			COUNT(DISTINCT question_id) as total_attempted,
			COUNT(DISTINCT CASE WHEN attempted = TRUE THEN question_id ELSE NULL END) as completed
		FROM attempt
		WHERE student_id = ?
	`, studentID).Scan(&stats.TotalAttempted, &stats.CompletedQuestions)
	if err != nil {
		return nil, fmt.Errorf("error getting attempt counts: %w", err)
	}

	// Get average score, only counting completed attempts
	err = Con.QueryRow(`
		SELECT IFNULL(AVG(score), 0) 
		FROM attempt 
		WHERE student_id = ? AND attempted = TRUE
	`, studentID).Scan(&stats.AverageScore)
	if err != nil {
		return nil, fmt.Errorf("error getting average score: %w", err)
	}

	// Get counts by status
	err = Con.QueryRow(`
		SELECT 
			COUNT(CASE WHEN status = 'correct' THEN 1 ELSE NULL END) as correct,
			COUNT(CASE WHEN status = 'incorrect' THEN 1 ELSE NULL END) as incorrect,
			COUNT(CASE WHEN status = 'partially_correct' THEN 1 ELSE NULL END) as partial
		FROM attempt
		WHERE student_id = ? AND attempted = TRUE
	`, studentID).Scan(&stats.CorrectAnswers, &stats.IncorrectAnswers, &stats.PartialAnswers)
	if err != nil {
		return nil, fmt.Errorf("error getting status counts: %w", err)
	}

	// Get highest score
	err = Con.QueryRow(`
		SELECT IFNULL(MAX(score), 0)
		FROM attempt
		WHERE student_id = ? AND attempted = TRUE
	`, studentID).Scan(&stats.HighestScore)
	if err != nil {
		return nil, fmt.Errorf("error getting highest score: %w", err)
	}

	// Get total batches joined
	err = Con.QueryRow(`
		SELECT COUNT(*)
		FROM batch_student
		WHERE student_id = ?
	`, studentID).Scan(&stats.TotalBatches)
	if err != nil {
		return nil, fmt.Errorf("error getting batch count: %w", err)
	}

	// Get recent activity (last 5 attempts)
	rows, err := Con.Query(`
		SELECT a.id, a.start_time, IFNULL(a.time_taken_seconds, 0), a.status, a.score, q.title, b.name
		FROM attempt a
		JOIN question q ON a.question_id = q.id
		JOIN batch b ON q.batch_id = b.id
		WHERE a.student_id = ? AND a.attempted = TRUE
		ORDER BY a.submission_time DESC
		LIMIT 5
	`, studentID)
	if err != nil {
		return nil, fmt.Errorf("error getting recent activity: %w", err)
	}
	defer rows.Close()

	stats.RecentActivity = []RecentAttemptInfo{}
	for rows.Next() {
		var activity RecentAttemptInfo
		if err := rows.Scan(&activity.ID, &activity.StartTime, &activity.TimeTakenSecs,
			&activity.Status, &activity.Score, &activity.QuestionTitle, &activity.BatchName); err != nil {
			return nil, fmt.Errorf("error scanning recent activity: %w", err)
		}
		stats.RecentActivity = append(stats.RecentActivity, activity)
	}

	return stats, nil
}
