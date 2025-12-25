FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the server binary
RUN CGO_ENABLED=1 GOOS=linux go build -o server ./cmd/server

# Production image
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies for SQLite
RUN apk add --no-cache libc6-compat

# Copy binary from builder
COPY --from=builder /app/server .

# Expose port
EXPOSE 8080

# Run server
CMD ["./server"]
