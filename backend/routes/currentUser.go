package routes

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// CurrentUserHandler verifies the JWT cookie and returns the current user info.
func CurrentUserHandler(c *fiber.Ctx) error {
	// Read JWT cookie
	tokenStr := c.Cookies("jwt")
	if tokenStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized"})
	}

	// Parse & verify token
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if t.Method != jwt.SigningMethodHS256 {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized"})
	}

	// Build user data from JWT claims
	userData := fiber.Map{
		"userId":   claims["userId"],
		"username": claims["username"],
		"email":    claims["email"],  // Extract email from claims
		"role":     claims["role"],   // Extract role from claims
		"roleId":   claims["roleId"], // Extract roleId from claims// Add additional fields as needed
	}

	return c.JSON(fiber.Map{"user": userData})
}
