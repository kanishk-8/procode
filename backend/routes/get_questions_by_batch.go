package routes

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

func GetQuestionsByBatchHandler(c *fiber.Ctx) error {
	batchIDStr := c.Params("batchID")

	if batchIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Batch ID is required",
		})
	}

	batchID, err := strconv.ParseInt(batchIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid batch ID format",
		})
	}

	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user ID",
		})
	}
	userID := int64(userIDFloat)

	batchWithQuestions, err := db.GetQuestionsByBatch(userID, batchID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get questions: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":   "Questions retrieved successfully",
		"batchName": batchWithQuestions.BatchName,
		"questions": batchWithQuestions.Questions,
	})
}
