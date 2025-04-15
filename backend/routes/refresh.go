package routes

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func RefreshHandler(c *fiber.Ctx) error {
	// Read refresh token cookie
	refreshTokenStr := c.Cookies("refresh_token")
	if refreshTokenStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Unauthorized"})
	}

	// Parse and verify the refresh token
	refreshToken, err := jwt.Parse(refreshTokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(jwtSecret), nil
	})
	if err != nil || !refreshToken.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Invalid or expired refresh token"})
	}

	// Extract claims from refresh token
	claims, ok := refreshToken.Claims.(jwt.MapClaims)
	if !ok || !refreshToken.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Invalid token claims"})
	}

	// Build new access token (15 min expiry)
	newAccessClaims := jwt.MapClaims{
		"userId":   claims["userId"],
		"username": claims["username"],
		"email":    claims["email"],
		"role":     claims["role"],
		"roleId":   claims["roleId"],
		"exp":      time.Now().Add(15 * time.Minute).Unix(),
	}
	newAccessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, newAccessClaims)
	signedAccessToken, err := newAccessToken.SignedString([]byte(jwtSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Could not generate new access token"})
	}

	// Set new access token as cookie
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    signedAccessToken,
		Expires:  time.Now().Add(15 * time.Minute),
		HTTPOnly: true,
		SameSite: "None",
		Secure:   false,
		Path:     "/",
	})

	return c.JSON(fiber.Map{"message": "Access token refreshed"})
}
