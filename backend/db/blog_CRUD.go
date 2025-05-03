package db

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"
)

type BlogData struct {
	ID                  int64     `json:"id"`
	UserID              int64     `json:"userId"`
	Author              string    `json:"author"`
	AuthorRole          string    `json:"authorRole"`
	Title               string    `json:"title"`
	Content             string    `json:"content"`
	Excerpt             string    `json:"excerpt"`
	ImageURL            string    `json:"imageUrl"`
	Status              string    `json:"status"`
	VerifiedBy          *string   `json:"verifiedBy"`
	DeletionRequestedBy *string   `json:"deletionRequestedBy"`
	DeletionMessage     *string   `json:"deletionMessage"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
	Tags                []string  `json:"tags"`
	ReadTime            string    `json:"readTime"`
}

// CreateBlog creates a new blog post
func CreateBlog(userID int64, title, content, excerpt, imageURL string, tags []string) (int64, error) {
	// Check if user exists
	var exists bool
	err := Con.QueryRow("SELECT EXISTS(SELECT 1 FROM user WHERE id = ?)", userID).Scan(&exists)
	if err != nil {
		return 0, fmt.Errorf("error checking user: %w", err)
	}
	if !exists {
		return 0, errors.New("user not found")
	}

	// Check if the user is a teacher
	var isTeacher bool
	err = Con.QueryRow("SELECT EXISTS(SELECT 1 FROM teacher WHERE user_id = ?)", userID).Scan(&isTeacher)
	if err != nil {
		return 0, fmt.Errorf("error checking if user is teacher: %w", err)
	}

	tx, err := Con.Begin()
	if err != nil {
		return 0, fmt.Errorf("error starting transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	var result sql.Result

	// Create the blog entry - auto-verify if created by a teacher
	if isTeacher {
		// For teachers: set status to verified and verified_by to their own userID
		result, err = tx.Exec(
			"INSERT INTO blog (user_id, title, content, excerpt, image_url, status, verified_by) VALUES (?, ?, ?, ?, ?, 'verified', ?)",
			userID, title, content, excerpt, imageURL, userID,
		)
	} else {
		// For students: status remains 'pending' by default
		result, err = tx.Exec(
			"INSERT INTO blog (user_id, title, content, excerpt, image_url) VALUES (?, ?, ?, ?, ?)",
			userID, title, content, excerpt, imageURL,
		)
	}

	if err != nil {
		return 0, fmt.Errorf("error creating blog: %w", err)
	}

	blogID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("error getting blog ID: %w", err)
	}

	// Add tags if provided
	if len(tags) > 0 {
		for _, tag := range tags {
			_, err = tx.Exec(
				"INSERT INTO blog_tag (blog_id, tag_name) VALUES (?, ?)",
				blogID, tag,
			)
			if err != nil {
				return 0, fmt.Errorf("error adding tag '%s': %w", tag, err)
			}
		}
	}

	if err = tx.Commit(); err != nil {
		return 0, fmt.Errorf("error committing transaction: %w", err)
	}

	return blogID, nil
}

// GetBlogByID retrieves a specific blog by ID
func GetBlogByID(blogID int64) (*BlogData, error) {
	blog := &BlogData{}
	
	// Fetch the blog details
	var verifiedByID sql.NullInt64
	var deletionRequestedByID sql.NullInt64
	var deletionMessage sql.NullString
	
	err := Con.QueryRow(`
		SELECT b.id, b.user_id, u.username, u.role, b.title, b.content, 
		b.excerpt, b.image_url, b.status, b.verified_by, b.deletion_requested_by,
		b.deletion_message, b.created_at, b.updated_at
		FROM blog b
		JOIN user u ON b.user_id = u.id
		WHERE b.id = ?
	`, blogID).Scan(
		&blog.ID, &blog.UserID, &blog.Author, &blog.AuthorRole,
		&blog.Title, &blog.Content, &blog.Excerpt, &blog.ImageURL,
		&blog.Status, &verifiedByID, &deletionRequestedByID, &deletionMessage, 
		&blog.CreatedAt, &blog.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("blog not found")
		}
		return nil, fmt.Errorf("error fetching blog: %w", err)
	}

	// Get verifier name if verified
	if verifiedByID.Valid {
		var verifierName string
		err = Con.QueryRow("SELECT username FROM user WHERE id = ?", verifiedByID).Scan(&verifierName)
		if err == nil {
			blog.VerifiedBy = &verifierName
		}
	}
	
	// Get deletion requester name if deletion requested
	if deletionRequestedByID.Valid {
		var requesterName string
		err = Con.QueryRow("SELECT username FROM user WHERE id = ?", deletionRequestedByID).Scan(&requesterName)
		if err == nil {
			blog.DeletionRequestedBy = &requesterName
		}
	}
	
	// Set deletion message if exists
	if deletionMessage.Valid && deletionMessage.String != "" {
		blog.DeletionMessage = &deletionMessage.String
	}

	// Get tags for the blog
	rows, err := Con.Query("SELECT tag_name FROM blog_tag WHERE blog_id = ?", blogID)
	if err != nil {
		return nil, fmt.Errorf("error fetching blog tags: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var tag string
		if err := rows.Scan(&tag); err != nil {
			return nil, fmt.Errorf("error scanning tag: %w", err)
		}
		blog.Tags = append(blog.Tags, tag)
	}

	// Calculate read time (approx. 200 words per minute)
	wordCount := len(blog.Content) / 5 // Fix: use blog.Content instead of content
	readTimeMinutes := wordCount / 200
	if readTimeMinutes < 1 {
		readTimeMinutes = 1
	}
	blog.ReadTime = fmt.Sprintf("%d min read", readTimeMinutes)

	return blog, nil
}

// ListBlogs retrieves a list of blogs with optional filtering by status and creator
func ListBlogs(status string, creatorID int64, limit, offset int) ([]BlogData, error) {
	var blogs []BlogData
	var rows *sql.Rows
	var err error

	// Build query with placeholders
	query := `
		SELECT b.id, b.user_id, u.username, u.role, b.title, b.content,
		b.excerpt, b.image_url, b.status, b.verified_by, b.deletion_requested_by,
		b.deletion_message, b.created_at, b.updated_at
		FROM blog b
		JOIN user u ON b.user_id = u.id
	`
	
	// Build WHERE clause
	var conditions []string
	var args []interface{}
	
	if status != "" {
		conditions = append(conditions, "b.status = ?")
		args = append(args, status)
	}
	
	if creatorID > 0 {
		conditions = append(conditions, "b.user_id = ?")
		args = append(args, creatorID)
	}
	
	// Add conditions to query if any
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	
	// Add ordering and limits
	query += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)
	
	// Execute the query
	rows, err = Con.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying blogs: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var blog BlogData
		var verifiedByID sql.NullInt64
		var deletionRequestedByID sql.NullInt64
		var deletionMessage sql.NullString
		
		err := rows.Scan(
			&blog.ID, &blog.UserID, &blog.Author, &blog.AuthorRole,
			&blog.Title, &blog.Content, &blog.Excerpt, &blog.ImageURL,
			&blog.Status, &verifiedByID, &deletionRequestedByID, &deletionMessage,
			&blog.CreatedAt, &blog.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning blog row: %w", err)
		}

		 // Debug logging for UserID
        log.Printf("Blog %d has UserID: %d", blog.ID, blog.UserID)

		// Get verifier name if verified
		if verifiedByID.Valid {
			var verifierName string
			err = Con.QueryRow("SELECT username FROM user WHERE id = ?", verifiedByID).Scan(&verifierName)
			if err == nil {
				blog.VerifiedBy = &verifierName
			}
		}
		
		// Get deletion requester name if deletion requested
		if deletionRequestedByID.Valid {
			var requesterName string
			err = Con.QueryRow("SELECT username FROM user WHERE id = ?", deletionRequestedByID).Scan(&requesterName)
			if err == nil {
				blog.DeletionRequestedBy = &requesterName
			}
		}
		
		// Set deletion message if exists
		if deletionMessage.Valid && deletionMessage.String != "" {
			blog.DeletionMessage = &deletionMessage.String
		}

		// Get tags for the blog
		tagRows, err := Con.Query("SELECT tag_name FROM blog_tag WHERE blog_id = ?", blog.ID)
		if err != nil {
			return nil, fmt.Errorf("error fetching blog tags: %w", err)
		}

		for tagRows.Next() {
			var tag string
			if err := tagRows.Scan(&tag); err != nil {
				tagRows.Close()
				return nil, fmt.Errorf("error scanning tag: %w", err)
			}
			blog.Tags = append(blog.Tags, tag)
		}
		tagRows.Close()

		// Calculate read time based on content length
		wordCount := len(blog.Content) / 5 // rough estimate
		readTimeMinutes := wordCount / 200
		if readTimeMinutes < 1 {
			readTimeMinutes = 1
		}
		blog.ReadTime = fmt.Sprintf("%d min read", readTimeMinutes)
		
		blogs = append(blogs, blog)
	}

	return blogs, nil
}

// UpdateBlogStatus updates the status of a blog (for verification)
func UpdateBlogStatus(blogID, verifierID int64, status string) error {
    // Only allow verification state changes
    if status != "verified" && status != "rejected" {
        return errors.New("invalid status: must be 'verified' or 'rejected'")
    }

    // Check if the verifier is a teacher
    var isTeacher bool
    err := Con.QueryRow("SELECT EXISTS(SELECT 1 FROM teacher WHERE user_id = ?)", verifierID).Scan(&isTeacher)
    if err != nil {
        return fmt.Errorf("error checking teacher status: %w", err)
    }
    if !isTeacher {
        return errors.New("only teachers can verify blogs")
    }

    // Get the current status
    var currentStatus string
    err = Con.QueryRow("SELECT status FROM blog WHERE id = ?", blogID).Scan(&currentStatus)
    if err != nil {
        if err == sql.ErrNoRows {
            return errors.New("blog not found")
        }
        return fmt.Errorf("error checking blog status: %w", err)
    }

    // Update the blog status if it's not already verified or rejected
    // This ensures verification is a one-time operation
    if currentStatus != "verified" && currentStatus != "rejected" {
        var result sql.Result
        if status == "verified" {
            result, err = Con.Exec(
                "UPDATE blog SET status = ?, verified_by = ? WHERE id = ?",
                status, verifierID, blogID)
        } else {
            result, err = Con.Exec(
                "UPDATE blog SET status = ? WHERE id = ?",
                status, blogID)
        }

        if err != nil {
            return fmt.Errorf("error updating blog status: %w", err)
        }

        rowsAffected, err := result.RowsAffected()
        if err != nil {
            return fmt.Errorf("error getting rows affected: %w", err)
        }
        if rowsAffected == 0 {
            return errors.New("blog not found")
        }
    } else {
        // Blog is already in a final state, can't change
        return errors.New("blog has already been verified or rejected")
    }

    return nil
}

// DeleteBlog allows users to delete only their own blogs
func DeleteBlog(userID, blogID int64) error {
	tx, err := Con.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Check if the blog exists
	var ownerID int64
	err = tx.QueryRow("SELECT user_id FROM blog WHERE id = ?", blogID).Scan(&ownerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("blog not found")
		}
		return fmt.Errorf("error checking blog: %w", err)
	}

	// Check if the user is the owner of the blog
	if ownerID != userID {
		return errors.New("you can only delete your own blogs")
	}

	// Perform the deletion
	_, err = tx.Exec("DELETE FROM blog_tag WHERE blog_id = ?", blogID)
	if err != nil {
		return fmt.Errorf("error deleting blog tags: %w", err)
	}

	_, err = tx.Exec("DELETE FROM blog WHERE id = ?", blogID)
	if err != nil {
		return fmt.Errorf("error deleting blog: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}

// RequestBlogDeletion allows teachers to request deletion of any blog
func RequestBlogDeletion(teacherID, blogID int64, message string) error {
	// Check if the user is a teacher
	var isTeacher bool
	err := Con.QueryRow("SELECT EXISTS(SELECT 1 FROM teacher WHERE user_id = ?)", teacherID).Scan(&isTeacher)
	if err != nil {
		return fmt.Errorf("error checking teacher status: %w", err)
	}
	if !isTeacher {
		return errors.New("only teachers can request blog deletion")
	}

	// Check if the blog exists
	var exists bool
	var ownerID int64
	err = Con.QueryRow("SELECT EXISTS(SELECT 1 FROM blog WHERE id = ?), user_id FROM blog WHERE id = ?", 
					   blogID, blogID).Scan(&exists, &ownerID)
	if err != nil {
		return fmt.Errorf("error checking blog: %w", err)
	}
	if !exists {
		return errors.New("blog not found")
	}

	// Check if the teacher is trying to request deletion of their own blog
	if ownerID == teacherID {
		return errors.New("you can directly delete your own blog without requesting deletion")
	}

	// Update the blog status to delete_requested
	_, err = Con.Exec(
		"UPDATE blog SET status = 'delete_requested', deletion_requested_by = ?, deletion_message = ? WHERE id = ?",
		teacherID, message, blogID,
	)
	if err != nil {
		return fmt.Errorf("error requesting blog deletion: %w", err)
	}

	return nil
}
