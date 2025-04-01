package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
)

// Judge0Request represents the request sent to Judge0.
type Judge0Request struct {
	SourceCode string `json:"source_code"`
	LanguageID int    `json:"language_id"`
	Stdin      string `json:"stdin"`
}

// Judge0Response represents the response from Judge0.
type Judge0Response struct {
	Status struct {
		Description string `json:"description"`
	} `json:"status"`
	Stdout        string `json:"stdout"`
	CompileOutput string `json:"compile_output"`
	Stderr        string `json:"stderr"`
}

// TestCase represents a single test case.
type TestCase struct {
	Input  string
	Output string
}

// Sample test cases (for a problem like sum of two numbers)
var testCases = []TestCase{
	{"3 5\n", "8\n"},
	{"10 20\n", "30\n"},
	{"-4 6\n", "2\n"},
}

// runCode submits the code to Judge0 with input and verifies output.
func runCode(code string, languageID int, testCases []TestCase) (string, error) {
	// Judge0 API endpoint
	url := "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true"

	passedTests := 0

	for _, testCase := range testCases {
		reqBody := Judge0Request{
			SourceCode: code,
			LanguageID: languageID,
			Stdin:      testCase.Input,
		}

		jsonData, err := json.Marshal(reqBody)
		if err != nil {
			return "", fmt.Errorf("error marshalling request: %v", err)
		}

		req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
		if err != nil {
			return "", fmt.Errorf("error creating request: %v", err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("x-rapidapi-key", "YOUR_RAPIDAPI_KEY")
		req.Header.Set("x-rapidapi-host", "judge0-ce.p.rapidapi.com")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return "", fmt.Errorf("error sending request: %v", err)
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return "", fmt.Errorf("error reading response: %v", err)
		}

		var judgeResp Judge0Response
		err = json.Unmarshal(body, &judgeResp)
		if err != nil {
			return "", fmt.Errorf("error unmarshalling response: %v", err)
		}

		// Compare actual output with expected output
		if judgeResp.Stdout == testCase.Output {
			passedTests++
		}
	}

	// Generate result summary
	result := fmt.Sprintf("Passed %d/%d test cases.", passedTests, len(testCases))
	if passedTests == len(testCases) {
		result += " ✅ All tests passed!"
	} else {
		result += " ❌ Some tests failed."
	}

	return result, nil
}

func main() {
	// Initialize the template engine
	engine := html.New("./views", ".html")
	app := fiber.New(fiber.Config{
		Views: engine,
	})

	// GET "/" renders the form page
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{})
	})

	// POST "/run" handles code submission
	app.Post("/run", func(c *fiber.Ctx) error {
		code := c.FormValue("code")
		langStr := c.FormValue("language")
		languageID, err := strconv.Atoi(langStr)
		if err != nil {
			return c.Status(http.StatusBadRequest).SendString("Invalid language selection")
		}

		result, err := runCode(code, languageID, testCases)
		if err != nil {
			log.Println("Error calling Judge0:", err)
			return c.Status(http.StatusInternalServerError).SendString("Error running code: " + err.Error())
		}

		return c.SendString(fmt.Sprintf("<h3>Result:</h3><p>%s</p>", result))
	})

	log.Fatal(app.Listen(":3000"))
}
