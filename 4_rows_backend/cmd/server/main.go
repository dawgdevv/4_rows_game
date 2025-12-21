package main

import (
	"log"
	"net/http"

	ws "4_rows_backend/internal/transport/websocket"
)

func main() {
	http.HandleFunc("/ws", ws.HandleWS)

	port := ":8080"
	log.Printf("server running on %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
