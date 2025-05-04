package db

import (
	"database/sql"
	"fmt"
	"time"
)

// TeacherStats contains all dashboard statistics for a teacher
type TeacherStats struct {
	TotalBatches         int                   `json:"totalBatches"`
	ActiveBatches        int                   `json:"activeBatches"`
	TotalStudents        int                   `json:"totalStudents"`
	TotalQuestions       int                   `json:"totalQuestions"`
	AverageBatchScore    float64               `json:"averageBatchScore"`
	TotalBlogs           int                   `json:"totalBlogs"`
	VerifiedBlogs        int                   `json:"verifiedBlogs"`
	PendingBlogs         int                   `json:"pendingBlogs"`
	RecentBatches        []RecentBatchInfo     `json:"recentBatches"`
	QuestionAttemptStats []QuestionAttemptStat `json:"questionAttemptStats"`
	TopStudents          []TopStudentInfo      `json:"topStudents"`
}

// RecentBatchInfo contains information about a teacher's recent batch
type RecentBatchInfo struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	CreatedAt    time.Time `json:"createdAt"`
	IsActive     bool      `json:"isActive"`
	StudentCount int       `json:"studentCount"`
}

// QuestionAttemptStat contains statistics about question attempts
type QuestionAttemptStat struct {
	QuestionID    int64   `json:"questionId"`
	QuestionTitle string  `json:"questionTitle"`
	BatchName     string  `json:"batchName"`
	AttemptCount  int     `json:"attemptCount"`
	AvgScore      float64 `json:"avgScore"`
	CorrectCount  int     `json:"correctCount"`
}

// TopStudentInfo contains information about top-performing students
type TopStudentInfo struct {
	StudentID          int64   `json:"studentId"`
	Username           string  `json:"username"`
	BatchCount         int     `json:"batchCount"`
	AvgScore           float64 `json:"avgScore"`
	CompletedQuestions int     `json:"completedQuestions"`
}

// GetTeacherDashboardStats fetches all dashboard statistics for a teacher
func GetTeacherDashboardStats(userID int64) (*TeacherStats, error) {
	var teacherID int64
	err := Con.QueryRow("SELECT id FROM teacher WHERE user_id = ?", userID).Scan(&teacherID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("teacher not found for this user")
		}
		return nil, fmt.Errorf("error finding teacher: %w", err)
	}

	stats := &TeacherStats{}

	// Get total, active batches
	err = Con.QueryRow(`
		SELECT 
			COUNT(*) as total_batches,
			SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_batches
		FROM batch
		WHERE teacher_id = ?
	`, teacherID).Scan(&stats.TotalBatches, &stats.ActiveBatches)
	if err != nil {
		return nil, fmt.Errorf("error getting batch counts: %w", err)
	}

	// Get total students across all batches
	err = Con.QueryRow(`
		SELECT COUNT(DISTINCT bs.student_id)
		FROM batch_student bs
		JOIN batch b ON bs.batch_id = b.id
		WHERE b.teacher_id = ?
	`, teacherID).Scan(&stats.TotalStudents)
	if err != nil {
		return nil, fmt.Errorf("error getting student count: %w", err)
	}

	// Get total questions created
	err = Con.QueryRow(`
		SELECT COUNT(*)
		FROM question
		WHERE teacher_id = ?
	`, teacherID).Scan(&stats.TotalQuestions)
	if err != nil {
		return nil, fmt.Errorf("error getting question count: %w", err)
	}

	// Get average score across all batches
	err = Con.QueryRow(`
		SELECT IFNULL(AVG(a.score), 0)
		FROM attempt a
		JOIN question q ON a.question_id = q.id
		WHERE q.teacher_id = ? AND a.attempted = TRUE
	`, teacherID).Scan(&stats.AverageBatchScore)
	if err != nil {
		return nil, fmt.Errorf("error getting average score: %w", err)
	}

	// Get blog statistics
	err = Con.QueryRow(`
		SELECT
			(SELECT COUNT(*) FROM blog b JOIN user u ON b.user_id = u.id JOIN teacher t ON u.id = t.user_id WHERE t.id = ?) as total_blogs,
			(SELECT COUNT(*) FROM blog WHERE verified_by = ?) as verified_blogs,
			(SELECT COUNT(*) FROM blog WHERE status = 'pending') as pending_blogs
	`, teacherID, userID).Scan(&stats.TotalBlogs, &stats.VerifiedBlogs, &stats.PendingBlogs)
	if err != nil {
		return nil, fmt.Errorf("error getting blog stats: %w", err)
	}

	// Get recent batches (last 5)
	rows, err := Con.Query(`
		SELECT b.id, b.name, b.created_at, b.is_active, 
			(SELECT COUNT(*) FROM batch_student bs WHERE bs.batch_id = b.id) as student_count
		FROM batch b
		WHERE b.teacher_id = ?
		ORDER BY b.created_at DESC
		LIMIT 5
	`, teacherID)
	if err != nil {
		return nil, fmt.Errorf("error getting recent batches: %w", err)
	}
	defer rows.Close()

	stats.RecentBatches = []RecentBatchInfo{}
	for rows.Next() {
		var batch RecentBatchInfo
		if err := rows.Scan(&batch.ID, &batch.Name, &batch.CreatedAt, &batch.IsActive, &batch.StudentCount); err != nil {
			return nil, fmt.Errorf("error scanning batch info: %w", err)
		}
		stats.RecentBatches = append(stats.RecentBatches, batch)
	}

	// Get question attempt statistics
	rows, err = Con.Query(`
		SELECT 
			q.id, q.title, b.name,
			COUNT(a.id) as attempt_count,
			IFNULL(AVG(a.score), 0) as avg_score,
			SUM(CASE WHEN a.status = 'correct' THEN 1 ELSE 0 END) as correct_count
		FROM question q
		JOIN batch b ON q.batch_id = b.id
		LEFT JOIN attempt a ON q.id = a.question_id AND a.attempted = TRUE
		WHERE q.teacher_id = ?
		GROUP BY q.id
		ORDER BY attempt_count DESC
		LIMIT 5
	`, teacherID)
	if err != nil {
		return nil, fmt.Errorf("error getting question stats: %w", err)
	}
	defer rows.Close()

	stats.QuestionAttemptStats = []QuestionAttemptStat{}
	for rows.Next() {
		var stat QuestionAttemptStat
		if err := rows.Scan(&stat.QuestionID, &stat.QuestionTitle, &stat.BatchName,
			&stat.AttemptCount, &stat.AvgScore, &stat.CorrectCount); err != nil {
			return nil, fmt.Errorf("error scanning question stats: %w", err)
		}
		stats.QuestionAttemptStats = append(stats.QuestionAttemptStats, stat)
	}

	// Get top performing students
	rows, err = Con.Query(`
		SELECT 
			s.id, u.username,
			COUNT(DISTINCT bs.batch_id) as batch_count,
			IFNULL(AVG(a.score), 0) as avg_score,
			COUNT(DISTINCT CASE WHEN a.attempted = TRUE THEN a.question_id END) as completed_questions
		FROM student s
		JOIN user u ON s.user_id = u.id
		JOIN batch_student bs ON s.id = bs.student_id
		JOIN batch b ON bs.batch_id = b.id
		LEFT JOIN attempt a ON s.id = a.student_id
		WHERE b.teacher_id = ?
		GROUP BY s.id
		ORDER BY avg_score DESC
		LIMIT 5
	`, teacherID)
	if err != nil {
		return nil, fmt.Errorf("error getting top students: %w", err)
	}
	defer rows.Close()

	stats.TopStudents = []TopStudentInfo{}
	for rows.Next() {
		var student TopStudentInfo
		if err := rows.Scan(&student.StudentID, &student.Username, &student.BatchCount,
			&student.AvgScore, &student.CompletedQuestions); err != nil {
			return nil, fmt.Errorf("error scanning student info: %w", err)
		}
		stats.TopStudents = append(stats.TopStudents, student)
	}

	return stats, nil
}
