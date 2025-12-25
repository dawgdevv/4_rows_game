package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"4_rows_backend/internal/events"
	"4_rows_backend/internal/game"
	"4_rows_backend/internal/storage"
	ws "4_rows_backend/internal/transport/websocket"
)

func main() {
	// Initialize SQLite storage
	store, err := storage.NewSQLiteStorage("game.db")
	if err != nil {
		log.Printf("Warning: Could not initialize SQLite storage: %v", err)
		log.Println("Running with in-memory storage only")
	} else {
		log.Println("SQLite storage initialized (game.db)")

		// Set storage on RoomManager
		game.GetRoomManager().SetStorage(store)

		// Start cleanup routine: every 5 minutes, delete games inactive for 2 hours
		store.StartCleanupRoutine(5*time.Minute, 2*time.Hour)
		log.Println("Cleanup routine started (checking every 5 minutes, removing games inactive for 2 hours)")
	}

	// Initialize Kafka producer (optional - falls back gracefully if Kafka not available)
	kafkaBrokers := getEnv("KAFKA_BROKERS", "127.0.0.1:9094")
	kafkaTopic := getEnv("KAFKA_TOPIC", "game-events")

	producer := events.NewKafkaProducer([]string{kafkaBrokers}, kafkaTopic)
	defer producer.Close()

	http.HandleFunc("/ws", ws.HandleWS)

	port := ":8080"
	log.Printf("server running on %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
