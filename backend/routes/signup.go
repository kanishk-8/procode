package routes

import (
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/db"
	"golang.org/x/crypto/bcrypt"
)

type SignUpRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
	UserId   string `json:"userId"`
}

// func RegisterRoutes(app *fiber.App) {
// 	app.Post("/signup", SignUpHandler)
// }

func HashPassword(password string) (string, error) {
bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14) // cost 14 for better security
return string(bytes), err
}
func SignUpHandler(c *fiber.Ctx) error {
	var body SignUpRequest

	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// Backend validation
	body.Username = strings.TrimSpace(body.Username)
	body.Email = strings.TrimSpace(body.Email)
	body.Password = strings.TrimSpace(body.Password)
	body.UserId = strings.TrimSpace(body.UserId)
	body.Role = strings.TrimSpace(body.Role)

	if body.Username == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Username is required"})
	}
	if body.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Email is required"})
	}
	if !isValidEmail(body.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid email format"})
	}
	if len(body.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Password must be at least 6 characters"})
	}
	if body.UserId == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "User ID is required"})
	}
	if body.Role != "student" && body.Role != "teacher" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Role must be 'student' or 'teacher'"})
	}
	hashedPassword, _ := HashPassword(body.Password)
	
	// Create user and role
	_, err := db.CreateUserWithRole(body.Username, body.Email, hashedPassword, body.Role, body.UserId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error creating user: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "User created successfully",
	})
}

func isValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}
