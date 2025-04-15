package routes

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

func LogoutHandler(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		HTTPOnly: true,
	})
	return c.JSON(fiber.Map{"message": "Logged out successfully"})
}
