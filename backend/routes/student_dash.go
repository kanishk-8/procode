package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

// GetStudentDashboardStatsHandler handles requests for student dashboard statistics
func GetStudentDashboardStatsHandler(c *fiber.Ctx) error {
	// Extract user ID from context
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user ID",
		})
	}
	userID := int64(userIDFloat)

	// Get student dashboard stats
	stats, err := db.GetStudentDashboardStats(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to fetch dashboard statistics: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"stats": stats,
	})
}
