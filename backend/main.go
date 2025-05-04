package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"github.com/kanishk-8/procode/db"
	"github.com/kanishk-8/procode/routes"
)

func main() {
	if err := db.InitConnection(); err != nil {
		log.Fatal("Error connecting to DB:", err)
	}
	defer db.Con.Close()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173, http://127.0.0.1:5173,https://procode-2xh5.onrender.com,https://procode-alpha.vercel.app",
		AllowMethods:     "GET,POST,PUT,DELETE",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "API is running"})
	})

	routes.RegisterRoutes(app)

	log.Println("Server running on http://localhost:8080")
	log.Fatal(app.Listen(":8080"))
}
