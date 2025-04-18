package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

type AddBatchRequest struct {
	Name      string `json:"name"`
	TeacherID int64  `json:"teacher_id"`
}

type AddBatchResponse struct {
	BatchID int64  `json:"batch_id"`
	Message string `json:"message"`
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

	if req.TeacherID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Valid teacher ID is required",
		})
	}

	batchID, err := db.CreateBatch(req.Name, req.TeacherID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create batch: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Batch created successfully",
		"batch": AddBatchResponse{
			BatchID: batchID,
			Message: "Batch created successfully",
		},
	})
}
