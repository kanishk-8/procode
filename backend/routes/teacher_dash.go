package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

// GetTeacherDashboardStatsHandler handles requests for teacher dashboard statistics
func GetTeacherDashboardStatsHandler(c *fiber.Ctx) error {
	// Extract user ID from context
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user ID",
			"error":   "User ID missing or invalid",
		})
	}
	userID := int64(userIDFloat)

	// Get teacher dashboard stats
	stats, err := db.GetTeacherDashboardStats(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to fetch dashboard statistics",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"stats":   stats,
		"success": true,
	})
}
