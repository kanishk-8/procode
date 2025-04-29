package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

// CodeSubmission represents the structure of a code submission request
type CodeSubmission struct {
	QuestionID int64  `json:"question_id"`
	Code       string `json:"code"`
	LanguageID int    `json:"language_id"`
}

// CodeEvaluateHandler handles the API endpoint for evaluating code submissions
func CodeEvaluateHandler(c *fiber.Ctx) error {
	// Get userID from context (session) - same approach as in get_question_details_by_id.go
	userIDFloat, ok := c.Locals("userId").(float64)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user ID",
		})
	}
	userID := int64(userIDFloat)

	// Parse request body to get submission details
	var submission CodeSubmission
	if err := c.BodyParser(&submission); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body: " + err.Error(),
		})
	}

	// Validate required fields
	if submission.QuestionID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Question ID is required",
		})
	}

	if submission.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Code submission is required",
		})
	}

	// Call the db function to evaluate the code
	result, err := db.EvaluateCode(userID, submission.QuestionID, submission.Code, submission.LanguageID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to evaluate code: " + err.Error(),
		})
	}

	// Return the evaluation results
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Code evaluation completed",
		"data":    result,
	})
}
