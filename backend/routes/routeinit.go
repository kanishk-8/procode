package routes

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {
	app.Post("/signup", SignUpHandler)
	app.Post("/login", LoginHandler)
}
