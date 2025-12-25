package events

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

// GameCompletedEvent represents a finished game
type GameCompletedEvent struct {
	Type            string    `json:"type"`
	RoomCode        string    `json:"room_code"`
	Player1Name     string    `json:"player1_name"`
	Player2Name     string    `json:"player2_name"`
	Winner          int       `json:"winner"` // 1, 2, or 0 (draw)
	IsBotGame       bool      `json:"is_bot_game"`
	DurationSeconds int64     `json:"duration_seconds"`
	Timestamp       time.Time `json:"timestamp"`
}

// KafkaProducer handles publishing events to Kafka
type KafkaProducer struct {
	writer  *kafka.Writer
	enabled bool
}

var producer *KafkaProducer

// NewKafkaProducer creates a new Kafka producer
func NewKafkaProducer(brokers []string, topic string) *KafkaProducer {
	writer := &kafka.Writer{
		Addr:         kafka.TCP(brokers...),
		Topic:        topic,
		Balancer:     &kafka.LeastBytes{},
		BatchTimeout: 10 * time.Millisecond,
		Async:        false, // Sync writes for better error visibility
	}

	producer = &KafkaProducer{
		writer:  writer,
		enabled: true,
	}

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	testMsg := kafka.Message{
		Key:   []byte("test"),
		Value: []byte(`{"type":"connection_test"}`),
	}

	if err := writer.WriteMessages(ctx, testMsg); err != nil {
		log.Printf("Warning: Kafka connection failed: %v", err)
		log.Println("Game events will not be published to Kafka")
		producer.enabled = false
	} else {
		log.Printf("Kafka producer initialized and connected to topic: %s", topic)
	}

	return producer
}

// GetProducer returns the global producer instance
func GetProducer() *KafkaProducer {
	return producer
}

// PublishGameCompleted publishes a game completed event
func (p *KafkaProducer) PublishGameCompleted(event GameCompletedEvent) {
	if p == nil || !p.enabled {
		return
	}

	event.Type = "game_completed"
	event.Timestamp = time.Now()

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Error marshaling game event: %v", err)
		return
	}

	err = p.writer.WriteMessages(context.Background(),
		kafka.Message{
			Key:   []byte(event.RoomCode),
			Value: data,
		},
	)

	if err != nil {
		log.Printf("Error publishing to Kafka: %v", err)
	} else {
		log.Printf("Published game_completed event for room %s", event.RoomCode)
	}
}

// Close closes the Kafka writer
func (p *KafkaProducer) Close() error {
	if p != nil && p.writer != nil {
		return p.writer.Close()
	}
	return nil
}
