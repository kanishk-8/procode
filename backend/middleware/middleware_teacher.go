package middleware

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

func RequireTeacherAuth(c *fiber.Ctx) error {
	if err := RequireAuth(c); err != nil {
		return err
	}
	
	role := c.Locals("role")
	log.Println("Role:", role)
	if role != "teacher" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "Access denied - teacher role required",
		})
	}
	
	return c.Next()
}
