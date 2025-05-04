package routes

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

// CreateBlogHandler handles the creation of new blogs
func CreateBlogHandler(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized",
		})
	}
	userID := int64(userIDFloat)

	// Get user role
	userRole, ok := c.Locals("role").(string)
	if !ok {
		userRole = "student" // Default to student if not found
	}

	// Parse request body
	type CreateBlogRequest struct {
		Title    string   `json:"title"`
		Content  string   `json:"content"`
		Excerpt  string   `json:"excerpt"`
		ImageURL string   `json:"imageUrl"`
		Tags     []string `json:"tags"`
	}

	var req CreateBlogRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// Validate request
	if req.Title == "" || req.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Title and content are required",
		})
	}

	// Add validation for tags
	if len(req.Tags) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "At least one tag is required",
		})
	}

	// Validate that tags are not empty strings
	for _, tag := range req.Tags {
		if strings.TrimSpace(tag) == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Empty tags are not allowed",
			})
		}
	}

	// Create excerpt if not provided
	if req.Excerpt == "" {
		if len(req.Content) > 150 {
			req.Excerpt = req.Content[:150] + "..."
		} else {
			req.Excerpt = req.Content
		}
	}

	// Create the blog
	blogID, err := db.CreateBlog(userID, req.Title, req.Content, req.Excerpt, req.ImageURL, req.Tags)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create blog: " + err.Error(),
		})
	}

	// Return different messages based on role
	if userRole == "teacher" {
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message": "Blog created and automatically verified",
			"blogId":  blogID,
			"status":  "verified",
		})
	} else {
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message": "Blog created and waiting for verification",
			"blogId":  blogID,
			"status":  "pending",
		})
	}
}

// GetBlogByIDHandler retrieves a specific blog by ID
func GetBlogByIDHandler(c *fiber.Ctx) error {
	blogIDStr := c.Params("blogID")
	blogID, err := strconv.ParseInt(blogIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid blog ID",
		})
	}

	blog, err := db.GetBlogByID(blogID)
	if err != nil {
		if err.Error() == "blog not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"message": "Blog not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get blog: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Blog retrieved successfully",
		"blog":    blog,
	})
}

// ListBlogsHandler retrieves a list of blogs
func ListBlogsHandler(c *fiber.Ctx) error {
	// Parse query parameters
	status := c.Query("status", "")           // Optional status filter
	creatorIdStr := c.Query("creatorId", "0") // Default to 0 (no filter)
	limitStr := c.Query("limit", "10")
	offsetStr := c.Query("offset", "0")

	// Parse limit and offset
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}
	
	// Parse creatorId with proper error handling
	var creatorID int64
	if creatorIdStr != "0" && creatorIdStr != "" {
		creatorID, err = strconv.ParseInt(creatorIdStr, 10, 64)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid creator ID format",
			})
		}
	}

	blogs, err := db.ListBlogs(status, creatorID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get blogs: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Blogs retrieved successfully",
		"blogs":   blogs,
	})
}

// VerifyBlogHandler handles blog verification by teachers
func VerifyBlogHandler(c *fiber.Ctx) error {
	var req struct {
		BlogID int64  `json:"blogId"`
		Status string `json:"status"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	if req.BlogID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid blog ID",
		})
	}

	if req.Status != "verified" && req.Status != "rejected" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Status must be 'verified' or 'rejected'",
		})
	}

	userID, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "User not authenticated",
		})
	}

	// Verify blog (this is a one-time operation)
	err := db.UpdateBlogStatus(req.BlogID, int64(userID), req.Status)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to verify blog: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Blog status updated successfully",
	})
}

// DeleteBlogHandler handles the deletion of blogs by their creators
func DeleteBlogHandler(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized",
		})
	}
	userID := int64(userIDFloat)

	// Parse request body
	type DeleteBlogRequest struct {
		BlogID int64 `json:"blogId"`
	}

	var req DeleteBlogRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// Validate request
	if req.BlogID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Valid blog ID is required",
		})
	}

	// Delete the blog
	err := db.DeleteBlog(userID, req.BlogID)
	if err != nil {
		if err.Error() == "blog not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"message": err.Error(),
			})
		} else if err.Error() == "you can only delete your own blogs" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"message": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to delete blog: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Blog deleted successfully",
	})
}

// RequestBlogDeletionHandler handles deletion requests by teachers
func RequestBlogDeletionHandler(c *fiber.Ctx) error {
	// Get user ID from context (set by auth middleware)
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized",
		})
	}
	userID := int64(userIDFloat)

	// Parse request body
	type RequestDeletionRequest struct {
		BlogID  int64  `json:"blogId"`
		Message string `json:"message"`
	}

	var req RequestDeletionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// Validate request
	if req.BlogID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Valid blog ID is required",
		})
	}

	if req.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Deletion reason message is required",
		})
	}

	// Request the blog deletion
	err := db.RequestBlogDeletion(userID, req.BlogID, req.Message)
	if err != nil {
		if err.Error() == "blog not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"message": err.Error(),
			})
		} else if err.Error() == "only teachers can request blog deletion" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"message": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to request blog deletion: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Deletion requested successfully",
	})
}
