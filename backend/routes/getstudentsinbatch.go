package routes

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

func GetStudentsInBatchHandler(c *fiber.Ctx) error {
	// Get batchID from path parameter instead of query parameter
	batchIDStr := c.Params("batchID")

	if batchIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Batch ID is required",
		})
	}

	// Convert batchID from string to int64
	batchID, err := strconv.ParseInt(batchIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid batch ID format",
		})
	}

	// Get userID from JWT token
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user ID",
		})
	}
	userID := int64(userIDFloat)

	// Get students in the batch using the db function
	students, err := db.GetStudentsInBatch(batchID, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get students: " + err.Error(),
		})
	}

	// Return the students list
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":  "Students retrieved successfully",
		"students": students,
	})
}
