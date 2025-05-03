package routes

import (
	"time"

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
	TimeLimit   int        `json:"time_limit"` // Time limit in minutes
	StartTime   string     `json:"start_time"` // Add start_time field
	EndTime     string     `json:"end_time"`   // Add end_time field
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

	// Parse start and end times if provided
	var startTime, endTime *time.Time

	// Handle datetime-local format (YYYY-MM-DDTHH:MM) from frontend
	if req.StartTime != "" && req.StartTime != "null" {
		// First try RFC3339 format
		parsedStart, err := time.Parse(time.RFC3339, req.StartTime)
		if err != nil {
			// If RFC3339 fails, try the format from datetime-local input
			parsedStart, err = time.Parse("2006-01-02T15:04", req.StartTime)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"message": "Invalid start time format: " + err.Error(),
				})
			}
		}
		startTime = &parsedStart
	}

	if req.EndTime != "" && req.EndTime != "null" {
		// First try RFC3339 format
		parsedEnd, err := time.Parse(time.RFC3339, req.EndTime)
		if err != nil {
			// If RFC3339 fails, try the format from datetime-local input
			parsedEnd, err = time.Parse("2006-01-02T15:04", req.EndTime)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"message": "Invalid end time format: " + err.Error(),
				})
			}
		}
		endTime = &parsedEnd
	}

	// Validate that end time is after start time if both are provided
	if startTime != nil && endTime != nil && !endTime.After(*startTime) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "End time must be after start time",
		})
	}

	questionID, err := db.CreateQuestion(
		userID,
		req.BatchID,
		req.Title,
		req.Description,
		dbTestCases,
		req.TimeLimit,
		startTime,
		endTime,
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
