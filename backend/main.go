package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"github.com/kanishk-8/procode/db"
	"github.com/kanishk-8/procode/routes"
)

func main() {
	// Initialize database connection (DSN built internally)
	if err := db.InitConnection(); err != nil {
		log.Fatal("Error connecting to DB:", err)
	}
	defer db.Con.Close()

	// Start Fiber app
	app := fiber.New()
	app.Use(cors.New())

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "API is running"})
	})

	routes.RegisterRoutes(app)

	log.Println("Server running on http://localhost:8080")
	log.Fatal(app.Listen(":8080"))
}
