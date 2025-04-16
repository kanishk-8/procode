package routes

import (
	"github.com/gofiber/fiber/v2"
)

// CurrentUserHandler returns the current user info using data from middleware.
func CurrentUserHandler(c *fiber.Ctx) error {
	// The middleware has already verified the token and extracted claims
	userId := c.Locals("userId")
	username := c.Locals("username")
	email := c.Locals("email")
	role := c.Locals("role")
	roleId := c.Locals("roleId")

	// Get additional claims if needed
	// Consider adding these to the middleware if they're commonly used
	// Build user data from JWT claims
	userData := fiber.Map{
		"userId":   userId,
		"username": username,
		"email":    email,
		"role":     role,
		"roleId":   roleId,
		// Add additional user data as needed - you may need to add these
		// to your middleware if you want to access them here
	}

	return c.JSON(fiber.Map{"user": userData})
}
