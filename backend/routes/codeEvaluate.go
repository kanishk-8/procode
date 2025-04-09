package routes

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)


type Judge0Submission struct {
    SourceCode string `json:"source_code"`
    LanguageID int    `json:"language_id"`
}

// RunCodeHandler 
func RunCodeHandler(c *fiber.Ctx) error {
    
    type RequestPayload struct {
        Code     string `json:"code"`
        Language string `json:"language"`
    }

    var reqPayload RequestPayload
    if err := c.BodyParser(&reqPayload); err != nil {
        return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request payload"})
    }

    langID, err := strconv.Atoi(reqPayload.Language)
    if err != nil {
        return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid language id"})
    }

    submission := Judge0Submission{
        SourceCode: reqPayload.Code,
        LanguageID: langID,
    }

    jsonData, err := json.Marshal(submission)
    if err != nil {
        return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to marshal submission"})
    }

    judge0URL := "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment")
	}

	Judge_API := os.Getenv("JUDGE0_API")
	log.Print("Judge API Key: ", Judge_API)
    req, err := http.NewRequest("POST", judge0URL, bytes.NewBuffer(jsonData))
    if err != nil {
        return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create request"})
    }
    req.Header.Add("Content-Type", "application/json")
 
    req.Header.Add("x-rapidapi-host", "judge0-ce.p.rapidapi.com")
    req.Header.Add("x-rapidapi-key", Judge_API)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to send request to Judge0"})
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to read response from Judge0"})
    }

    c.Set("Content-Type", "application/json")
    return c.Send(body)
}


