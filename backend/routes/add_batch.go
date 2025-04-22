package routes

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

type AddBatchRequest struct {
	Name string `json:"name"` // Changed from TeacherID to UserID
}

func AddBatchHandler(c *fiber.Ctx) error {
	var req AddBatchRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Batch name is required",
		})
	}

	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user ID",
		})
	}
	userID := int64(userIDFloat)
	log.Println(userID)
	batchID, err := db.CreateBatch(req.Name, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create batch: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Batch created successfully",
		"batchid": batchID,
	})
}
