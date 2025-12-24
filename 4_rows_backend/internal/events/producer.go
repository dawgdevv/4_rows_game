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
		Async:        true, // Non-blocking writes
	}

	producer = &KafkaProducer{
		writer:  writer,
		enabled: true,
	}

	log.Printf("Kafka producer initialized for topic: %s", topic)
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
