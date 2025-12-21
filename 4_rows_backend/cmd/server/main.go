package main

import (
	"log"
	"net/http"

	ws "4_rows_backend/internal/transport/websocket"
)

func main() {
	http.HandleFunc("/ws", ws.HandleWS)
	log.Println("server is running on 8000")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
