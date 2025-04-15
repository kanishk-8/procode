package routes

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/kanishk-8/procode/db"
)

const jwtSecret = "your_secret_key"

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	UserID   int64  `json:"userId"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	RoleID   string `json:"roleId"`
	Token    string `json:"token"`
}

func LoginHandler(c *fiber.Ctx) error {
	var body LoginRequest

	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// Trim input
	body.Username = strings.TrimSpace(body.Username)
	body.Password = strings.TrimSpace(body.Password)

	// Validate input
	if body.Username == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Username is required"})
	}
	if body.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Password is required"})
	}

	// Check credentials
	user, err := db.GetUserByCredentials(body.Username, body.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid credentials",
		})
	}

	// JWT generation and persistent cookie
	claims := jwt.MapClaims{
		"userId":   user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(72 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Could not generate token",
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    signedToken,
		Expires:  time.Now().Add(72 * time.Hour),
		HTTPOnly: true,
	})

	// Return successful login with user data and token
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login successful",
		"user": LoginResponse{
			UserID:   user.ID,
			Username: user.Username,
			Email:    user.Email,
			Role:     user.Role,
			RoleID:   user.RoleID,
			Token:    signedToken,
		},
	})
}
