package events

import (
	"crypto/tls"

	"github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl/plain"
)

// GetKafkaDialer creates a Kafka dialer with optional SASL authentication
func GetKafkaDialer(username, password string) *kafka.Dialer {
	if username == "" || password == "" {
		return nil // Use default dialer for local development
	}

	mechanism := plain.Mechanism{
		Username: username,
		Password: password,
	}

	return &kafka.Dialer{
		TLS:           &tls.Config{},
		SASLMechanism: mechanism,
	}
}
