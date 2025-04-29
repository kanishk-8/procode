package routes

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

func GetQuestionDetailsByIDHandler(c *fiber.Ctx) error {
	// Extract batchID from URL parameters
	batchIDStr := c.Params("batchID")
	if batchIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Batch ID is required",
		})
	}

	// Extract questionID from URL parameters
	questionIDStr := c.Params("questionID")
	if questionIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Question ID is required",
		})
	}

	// Parse batchID to int64
	batchID, err := strconv.ParseInt(batchIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid batch ID format",
		})
	}

	// Parse questionID to int64
	questionID, err := strconv.ParseInt(questionIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid question ID format",
		})
	}

	// Get userID from context
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user ID",
		})
	}
	userID := int64(userIDFloat)

	// Call the DB function
	questionWithTestCases, err := db.GetQuestionByID(userID, batchID, questionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get question details: " + err.Error(),
		})
	}

	// Return results
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Question details retrieved successfully",
		"data":    questionWithTestCases,
	})
}
