package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

//expected payload
// {
// 	"batch_id": 1,
// 	"title": "Two Sum Problem",
// 	"description": "Given an array of integers and a target value, find the two numbers that add up to the target. Return their indices in the array. You may assume each input has exactly one solution.",
// 	"test_cases": [
// 	  {
// 		"input_text": "[2, 7, 11, 15]\n9",
// 		"expected_output": "[0, 1]",
// 		"is_hidden": false
// 	  },
// 	  {
// 		"input_text": "[3, 2, 4]\n6",
// 		"expected_output": "[1, 2]",
// 		"is_hidden": false
// 	  },
// 	  {
// 		"input_text": "[1, 5, 8, 3]\n11",
// 		"expected_output": "[0, 3]",
// 		"is_hidden": true
// 	  }
// 	]
//   }

type TestCase struct {
	InputText      string `json:"input_text"`
	ExpectedOutput string `json:"expected_output"`
	IsHidden       bool   `json:"is_hidden"`
}

type AddQuestionRequest struct {
	BatchID     int64      `json:"batch_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	TestCases   []TestCase `json:"test_cases"`
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

	// Convert the TestCase slice to db.TestCase slice
	dbTestCases := make([]db.TestCase, len(req.TestCases))
	for i, tc := range req.TestCases {
		dbTestCases[i] = db.TestCase{
			InputText:      tc.InputText,
			ExpectedOutput: tc.ExpectedOutput,
			IsHidden:       tc.IsHidden,
		}
	}

	questionID, err := db.CreateQuestion(
		userID,
		req.BatchID,
		req.Title,
		req.Description,
		dbTestCases,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create question: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":     "Question created successfully",
		"question_id": questionID,
	})
}
