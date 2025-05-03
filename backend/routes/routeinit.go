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
	app.Get("/getquestiondetailsbyid/:batchID/:questionID", middleware.RequireStudentAuth, GetQuestionDetailsByIDHandler)
	app.Post("/evalques", middleware.RequireStudentAuth, CodeEvaluateHandler)

	// Blog routes
	app.Post("/blog", middleware.RequireAuth, CreateBlogHandler)
	app.Get("/blog/:blogID", GetBlogByIDHandler)
	app.Get("/blogs", ListBlogsHandler)
	app.Put("/blog/verify", middleware.RequireTeacherAuth, VerifyBlogHandler)
	app.Delete("/blog", middleware.RequireAuth, DeleteBlogHandler)
	app.Post("/blog/request-deletion", middleware.RequireTeacherAuth, RequestBlogDeletionHandler)
}
