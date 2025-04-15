package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/middleware"
)

func RegisterRoutes(app *fiber.App) {
	app.Post("/signup", SignUpHandler)
	app.Post("/login", LoginHandler)
	app.Get("/refresh", RefreshHandler)
	app.Post("/run", middleware.RequireAuth, RunCodeHandler)
	app.Get("/logout", middleware.RequireAuth, LogoutHandler)
	app.Get("/currentUser", middleware.RequireAuth, CurrentUserHandler)
}
