package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

func GetStudentBatchesHandler(c *fiber.Ctx) error {
	// Get the user ID from the context (set by authentication middleware)
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user ID",
		})
	}

	userID := int64(userIDFloat)

	// Fetch batches using the DB function
	batches, err := db.GetBatchesByStudent(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to retrieve batches: " + err.Error(),
		})
	}

	// Return the batches
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Batches retrieved successfully",
		"batches": batches,
	})
}
