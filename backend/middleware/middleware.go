package middleware

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

var jwtSecret = os.Getenv("jwt_secret_key") // Keep in env in production

func RequireAuth(c *fiber.Ctx) error {
	// Read JWT cookie
	tokenStr := c.Cookies("jwt")
	if tokenStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized - missing token",
		})
	}

	// Parse & verify token
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized - invalid token",
		})
	}

	// Set user info in locals (optional)
	claims := token.Claims.(jwt.MapClaims)
	c.Locals("userId", claims["userId"])
	c.Locals("username", claims["username"])

	return c.Next()
}
