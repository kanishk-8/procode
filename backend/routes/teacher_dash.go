package routes

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

// GetTeacherDashboardStatsHandler handles requests for teacher dashboard statistics
func GetTeacherDashboardStatsHandler(c *fiber.Ctx) error {
	userID, ok := c.Locals("userId").(float64)
	if !ok {
		fmt.Printf("Invalid user ID type: %T\n", c.Locals("userId"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid user ID",
		})
	}

	fmt.Printf("Fetching stats for user ID: %.0f\n", userID)
	stats, err := db.GetTeacherDashboardStats(int64(userID))
	if err != nil {
		fmt.Printf("Error fetching stats: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch dashboard statistics",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"stats":   stats,
	})
}
