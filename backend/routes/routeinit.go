package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kanishk-8/procode/middleware"
)

func RegisterRoutes(app *fiber.App) {
	app.Post("/signup", SignUpHandler)
	app.Post("/login", LoginHandler)
	app.Get("/refresh", RefreshHandler)
	app.Get("/logout", middleware.RequireAuth, LogoutHandler)
	app.Get("/currentUser", middleware.RequireAuth, CurrentUserHandler)
	app.Post("/addBatch", middleware.RequireTeacherAuth, AddBatchHandler)
	app.Get("/getbatchesbyteacher", middleware.RequireTeacherAuth, GetBatchesByTeacherHandler)
	app.Post("/deletebatch", middleware.RequireTeacherAuth, DeleteBatchHandler)
	app.Get("/joinbatch/:batchId", middleware.RequireStudentAuth, JoinBatchByParamHandler)
	app.Get("/getstudentsinbatch/:batchID", middleware.RequireTeacherAuth, GetStudentsInBatchHandler)
	app.Get("/getstudentbatches", middleware.RequireStudentAuth, GetStudentBatchesHandler)
	app.Post("/addquestion", middleware.RequireTeacherAuth, AddQuestionHandler)
	app.Get("/getquestionsbybatch/:batchID", middleware.RequireAuth, GetQuestionsByBatchHandler)
	app.Get("/getquestiondetailsbyid/:batchID/:questionID", middleware.RequireAuth, GetQuestionDetailsByIDHandler)
}
