package middleware

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func RequireTeacherAuth(c *fiber.Ctx) error {
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

	claims := token.Claims.(jwt.MapClaims)
	role := claims["role"]

	if role != "teacher" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "Access denied - teacher role required",
		})
	}

	return c.Next()
}
