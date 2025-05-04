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
	fmt.Printf("Fetching dashboard stats for userID: %d\n", userID)

	var teacherID int64
	err := Con.QueryRow("SELECT id FROM teacher WHERE user_id = ?", userID).Scan(&teacherID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("teacher not found for this user")
		}
		return nil, fmt.Errorf("error finding teacher: %w", err)
	}

	fmt.Printf("Found teacherID: %d\n", teacherID)
	stats := &TeacherStats{}

	// Fix AVG calculation for scores
	err = Con.QueryRow(`
		SELECT 
			COALESCE(COUNT(*), 0) as total_batches,
			COALESCE(SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END), 0) as active_batches
		FROM batch
		WHERE teacher_id = ?
	`, teacherID).Scan(&stats.TotalBatches, &stats.ActiveBatches)
	if err != nil {
		return nil, fmt.Errorf("error getting batch counts: %w", err)
	}

	// Fix total students count query
	err = Con.QueryRow(`
		SELECT COUNT(DISTINCT s.id)
		FROM student s
		JOIN batch_student bs ON s.id = bs.student_id
		JOIN batch b ON bs.batch_id = b.id
		WHERE b.teacher_id = ? AND b.is_active = TRUE
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

	// Fix average score calculation
	err = Con.QueryRow(`
		SELECT COALESCE(
			(SELECT AVG(score)
			FROM attempt a
			JOIN question q ON a.question_id = q.id
			WHERE q.teacher_id = ? AND a.attempted = TRUE AND a.score > 0), 
			0
		)
	`, teacherID).Scan(&stats.AverageBatchScore)
	if err != nil {
		return nil, fmt.Errorf("error getting average score: %w", err)
	}

	// Fix blog statistics query
	err = Con.QueryRow(`
		SELECT 
			COUNT(DISTINCT CASE WHEN b.user_id = u.id THEN b.id END),
			COUNT(DISTINCT CASE WHEN b.verified_by = ? THEN b.id END),
			COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END)
		FROM blog b
		JOIN user u ON b.user_id = u.id
		JOIN teacher t ON u.id = t.user_id
		WHERE t.id = ?
	`, userID, teacherID).Scan(&stats.TotalBlogs, &stats.VerifiedBlogs, &stats.PendingBlogs)
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

	stats.RecentBatches = make([]RecentBatchInfo, 0)
	for rows.Next() {
		var batch RecentBatchInfo
		if err := rows.Scan(&batch.ID, &batch.Name, &batch.CreatedAt, &batch.IsActive, &batch.StudentCount); err != nil {
			return nil, fmt.Errorf("error scanning batch info: %w", err)
		}
		stats.RecentBatches = append(stats.RecentBatches, batch)
	}

	// Fix question attempt statistics query
	rows, err = Con.Query(`
		SELECT 
			q.id, q.title, b.name,
			COUNT(DISTINCT a.id) as attempt_count,
			COALESCE(AVG(NULLIF(a.score, 0)), 0) as avg_score,
			COUNT(DISTINCT CASE WHEN a.status = 'correct' THEN a.id END) as correct_count
		FROM question q
		JOIN batch b ON q.batch_id = b.id
		LEFT JOIN attempt a ON q.id = a.question_id AND a.attempted = TRUE
		WHERE q.teacher_id = ?
		GROUP BY q.id, q.title, b.name
		ORDER BY attempt_count DESC, q.created_at DESC
		LIMIT 5
	`, teacherID)
	if err != nil {
		return nil, fmt.Errorf("error getting question stats: %w", err)
	}
	defer rows.Close()

	stats.QuestionAttemptStats = make([]QuestionAttemptStat, 0)
	for rows.Next() {
		var stat QuestionAttemptStat
		if err := rows.Scan(&stat.QuestionID, &stat.QuestionTitle, &stat.BatchName,
			&stat.AttemptCount, &stat.AvgScore, &stat.CorrectCount); err != nil {
			return nil, fmt.Errorf("error scanning question stats: %w", err)
		}
		stats.QuestionAttemptStats = append(stats.QuestionAttemptStats, stat)
	}

	// Fix top students query
	rows, err = Con.Query(`
		SELECT 
			s.id,
			u.username,
			COUNT(DISTINCT bs.batch_id) as batch_count,
			COALESCE(AVG(NULLIF(a.score, 0)), 0) as avg_score,
			COUNT(DISTINCT CASE WHEN a.status IN ('correct', 'partially_correct') THEN a.question_id END) as completed
		FROM student s
		JOIN user u ON s.user_id = u.id
		JOIN batch_student bs ON s.id = bs.student_id
		JOIN batch b ON bs.batch_id = b.id
		LEFT JOIN attempt a ON s.id = a.student_id
		WHERE b.teacher_id = ? AND b.is_active = TRUE
		GROUP BY s.id, u.username
		HAVING COUNT(DISTINCT a.id) > 0
		ORDER BY avg_score DESC, completed DESC
		LIMIT 5
	`, teacherID)
	if err != nil {
		return nil, fmt.Errorf("error getting top students: %w", err)
	}
	defer rows.Close()

	stats.TopStudents = make([]TopStudentInfo, 0)
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
