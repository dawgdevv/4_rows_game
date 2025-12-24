package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"4_rows_backend/internal/analytics"

	"github.com/segmentio/kafka-go"
)

func main() {
	// Configuration
	kafkaBrokers := getEnv("KAFKA_BROKERS", "localhost:9092")
	kafkaTopic := getEnv("KAFKA_TOPIC", "game-events")
	dbPath := getEnv("ANALYTICS_DB", "analytics.db")

	log.Printf("Starting analytics consumer...")
	log.Printf("Kafka brokers: %s", kafkaBrokers)
	log.Printf("Kafka topic: %s", kafkaTopic)
	log.Printf("Database: %s", dbPath)

	// Initialize analytics storage
	storage, err := analytics.NewAnalyticsStorage(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize analytics storage: %v", err)
	}
	defer storage.Close()
	log.Println("Analytics storage initialized")

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
		log.Println("Shutting down consumer...")
		cancel()
	}()

	log.Println("Consumer started, waiting for messages...")

	// Consume messages
	for {
		select {
		case <-ctx.Done():
			log.Println("Consumer stopped")
			return
		default:
			msg, err := reader.ReadMessage(ctx)
			if err != nil {
				if ctx.Err() != nil {
					return // Context cancelled, exit gracefully
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

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
