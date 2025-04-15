package routes

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

func LogoutHandler(c *fiber.Ctx) error {
    // Set cookie with same options as login but expired
    c.Cookie(&fiber.Cookie{
        Name:     "jwt",
        Value:    "",
        Expires:  time.Now().Add(-1 * time.Hour),
        HTTPOnly: true,
        SameSite: "Lax",
        Path:     "/",
        Secure:   false,
        Domain:   "",
    })
    return c.JSON(fiber.Map{"message": "Logged out successfully"})
}
