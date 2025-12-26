#!/bin/bash

# 1. Start Kafka in the background
echo "Starting Kafka..."
docker compose -f docker-compose.kafka.yml up -d

# 2. Wait for a moment to ensure Kafka is ready (simple sleep, or we could loop check)
echo "Waiting for Kafka to be ready..."
sleep 5

# 3. Create the 'game-events' topic
# We use || true so the script doesn't fail if the topic already exists
echo "Creating 'game-events' topic..."
docker exec 4_rows_game-kafka-1 /opt/kafka/bin/kafka-topics.sh \
  --create \
  --topic game-events \
  --bootstrap-server localhost:9094 \
  --partitions 1 \
  --replication-factor 1 || true

echo "Kafka is ready and topic 'game-events' exists!"
