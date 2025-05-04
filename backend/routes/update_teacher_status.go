package routes

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
)

// GetTeachersListHandler returns a list of all teachers with their status
func GetTeachersListHandler(c *fiber.Ctx) error {
	teachers, err := db.GetTeachersList()
	if err != nil {
		// Log the error for debugging
		fmt.Printf("Error fetching teachers list: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch teachers list",
			"error":   err.Error(),
		})
	}

	// Ensure we always return an array, even if empty
	if teachers == nil {
		teachers = []db.Teacher{}
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"teachers": teachers,
	})
}

// ApproveTeacherHandler approves a teacher by ID
func ApproveTeacherHandler(c *fiber.Ctx) error {
	teacherID := c.Params("teacherID")
	if teacherID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Teacher ID is required",
		})
	}

	err := db.ApproveTeacher(teacherID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to approve teacher",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Teacher approved successfully",
	})
}

// RevokeTeacherHandler revokes a teacher by ID
func RevokeTeacherHandler(c *fiber.Ctx) error {
	teacherID := c.Params("teacherID")
	if teacherID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Teacher ID is required",
		})
	}

	err := db.RevokeTeacher(teacherID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to revoke teacher",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Teacher status revoked successfully",
	})
}
