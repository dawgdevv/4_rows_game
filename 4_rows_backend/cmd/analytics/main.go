package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"4_rows_backend/internal/analytics"

	"github.com/segmentio/kafka-go"
)

var storage *analytics.AnalyticsStorage

func main() {
	// Configuration
	kafkaBrokers := getEnv("KAFKA_BROKERS", "127.0.0.1:9094")
	kafkaTopic := getEnv("KAFKA_TOPIC", "game-events")
	dbPath := getEnv("ANALYTICS_DB", "analytics.db")
	apiPort := getEnv("API_PORT", ":8081")

	log.Printf("Starting analytics service...")
	log.Printf("Kafka brokers: %s", kafkaBrokers)
	log.Printf("Kafka topic: %s", kafkaTopic)
	log.Printf("Database: %s", dbPath)

	// Initialize analytics storage
	var err error
	storage, err = analytics.NewAnalyticsStorage(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize analytics storage: %v", err)
	}
	defer storage.Close()
	log.Println("Analytics storage initialized")

	// Start HTTP API server
	go startAPIServer(apiPort)

	// Create Kafka reader
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{kafkaBrokers},
		Topic:    kafkaTopic,
		GroupID:  "analytics-consumer",
		MinBytes: 10e3, // 10KB
		MaxBytes: 10e6, // 10MB
	})
	defer reader.Close()

	// Handle graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigChan
		log.Println("Shutting down...")
		cancel()
	}()

	log.Println("Consumer started, waiting for messages...")

	// Consume messages
	for {
		select {
		case <-ctx.Done():
			log.Println("Service stopped")
			return
		default:
			msg, err := reader.ReadMessage(ctx)
			if err != nil {
				if ctx.Err() != nil {
					return
				}
				log.Printf("Error reading message: %v", err)
				continue
			}

			log.Printf("Received message: key=%s", string(msg.Key))

			if err := storage.ProcessKafkaMessage(msg.Value); err != nil {
				log.Printf("Error processing message: %v", err)
			} else {
				log.Printf("Successfully processed event for room %s", string(msg.Key))
			}
		}
	}
}

func startAPIServer(port string) {
	http.HandleFunc("/api/leaderboard", handleLeaderboard)
	http.HandleFunc("/api/stats", handleStats)
	http.HandleFunc("/api/health", handleHealth)

	log.Printf("API server running on %s", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Printf("API server error: %v", err)
	}
}

func handleLeaderboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method == "OPTIONS" {
		return
	}

	leaderboard, err := storage.GetLeaderboard(10)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"leaderboard": leaderboard,
	})
}

func handleStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	today := time.Now().Format("2006-01-02")
	stats, err := storage.GetDailyStats(today)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"stats": stats,
	})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
