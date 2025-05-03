package routes

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

// GetQuestionStatusHandler returns the attempt status of all students for a question in a batch
func GetQuestionStatusHandler(c *fiber.Ctx) error {
	// Get batch ID and question ID from params
	batchIDStr := c.Params("batchID")
	questionIDStr := c.Params("questionID")

	// Convert batch ID to int64
	batchID, err := strconv.ParseInt(batchIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid batch ID format",
		})
	}

	// Convert question ID to int64
	questionID, err := strconv.ParseInt(questionIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid question ID format",
		})
	}

	// Get user ID from context (set by auth middleware)
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user ID",
		})
	}
	userID := int64(userIDFloat)

	// Call the DB function to get question status
	status, err := db.GetQuestionStatus(userID, batchID, questionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get question status: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(status)
}
