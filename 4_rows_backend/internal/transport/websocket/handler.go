package websocket

import (
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("upgrade error: %v", err)
		return
	}

	clientID := uuid.New().String()
	hub := GetHub()
	client := NewClient(clientID, conn, hub)

	hub.Register(client)

	log.Printf("new client connected: %s (total: %d)", clientID, hub.ClientCount())

	go client.ReadLoop()
	go client.WriteLoop()
}
