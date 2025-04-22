package routes

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

func JoinBatchByParamHandler(c *fiber.Ctx) error {
	// Extract batch ID from URL parameter
	batchIdStr := c.Params("batchId")
	batchId, err := strconv.ParseInt(batchIdStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid batch ID format",
		})
	}

	if batchId <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Valid batch ID is required",
		})
	}

	// Extract user ID from context
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user ID",
		})
	}
	userID := int64(userIDFloat)

	// Call the JoinBatch function from db package
	err = db.JoinBatch(batchId, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to join batch: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully joined batch",
	})
}
