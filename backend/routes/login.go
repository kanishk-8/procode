package routes

import (
	"log"
	"strings"
	"time"

	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/kanishk-8/procode/db"
)

var jwtSecret = os.Getenv("jwt_secret_key")

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
    log.Println(user.Role)
	// JWT generation and persistent cookie
	claims := jwt.MapClaims{
		"userId":   user.ID,
		"username": user.Username,
		"email":    user.Email,  // Add email to claims
		"role":     user.Role,   // Add role to claims
		"roleId":   user.RoleID, // Add roleId to claims
		"exp":      time.Now().Add(15 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Could not generate token",
		})
	}
	refreshClaims := jwt.MapClaims{
		"userId":   user.ID,
		"username": user.Username,
		"email":    user.Email, // Add email to claims
		"role":     user.Role,  // Add role to claims
		"roleId":   user.RoleID,
		"exp":      time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString([]byte(jwtSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Could not generate refresh token",
		})
	}

	// Set cookie with improved settings
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    signedToken,
		Expires:  time.Now().Add(15 * time.Minute),
		HTTPOnly: true,
		SameSite: "None", // Use Lax for most cases, "None" for cross-origin with Secure:true
		Path:     "/",    // Make cookie available on all paths
		Secure:   false,  // Set to true in production with HTTPS
		Domain:   "",     // Using default domain
	})
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    signedRefreshToken,
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		HTTPOnly: true,
		SameSite: "None",
		Path:     "/refresh",
		Secure:   false,
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
		},
	})
}
