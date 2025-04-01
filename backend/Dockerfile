# Build stage
FROM golang:1.18-alpine AS builder
WORKDIR /app

# Install git if needed for fetching dependencies
RUN apk update && apk add --no-cache git

# Copy go.mod and go.sum, then download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code (including views)
COPY . .

# Build the Go application (producing a binary named "main")
RUN go build -o main .

# Final stage
FROM alpine:latest
WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Copy the views folder from the builder stage to ensure templates are available
COPY --from=builder /app/views ./views

# Expose the port on which your Fiber app listens (assuming it's 3000)
EXPOSE 3000

# Run the binary
CMD ["./main"]

