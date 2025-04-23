package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

type AddQuestionRequest struct {
	BatchID        int64  `json:"batch_id"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	InputTestCases string `json:"input_test_cases"`
	ExpectedOutput string `json:"expected_output"`
}

func AddQuestionHandler(c *fiber.Ctx) error {
	var req AddQuestionRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// Validate required fields
	if req.Title == "" || req.Description == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Title and description are required",
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

	questionID, err := db.CreateQuestion(
		userID,
		req.BatchID,
		req.Title,
		req.Description,
		req.InputTestCases,
		req.ExpectedOutput,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create question: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Question created successfully",
		"question_id": questionID,
	})
}


