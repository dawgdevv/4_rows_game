package websocket

import "sync"

type Hub struct {
	clients map[*Client]bool
	rooms   map[string]map[*Client]bool
	mu      sync.RWMutex
}

var globalHub *Hub

func NewHub() *Hub {
	return &Hub{
		clients: make(map[*Client]bool),
		rooms:   make(map[string]map[*Client]bool),
	}
}

func GetHub() *Hub {
	if globalHub == nil {
		globalHub = NewHub()
	}
	return globalHub
}

func (h *Hub) Register(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[client] = true
}

func (h *Hub) Unregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.clients[client]; exists {
		delete(h.clients, client)

		if client.RoomCode != "" {
			if room, ok := h.rooms[client.RoomCode]; ok {
				delete(room, client)
				if len(room) == 0 {
					delete(h.rooms, client.RoomCode)
				}
			}
		}

		close(client.Send)
	}
}

func (h *Hub) JoinRoom(roomCode string, client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.rooms[roomCode] == nil {
		h.rooms[roomCode] = make(map[*Client]bool)
	}
	h.rooms[roomCode][client] = true
}

func (h *Hub) LeaveRoom(roomCode string, client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if room, ok := h.rooms[roomCode]; ok {
		delete(room, client)
		if len(room) == 0 {
			delete(h.rooms, roomCode)
		}
	}
}

func (h *Hub) BroadcastToRoom(roomCode string, msgFunc func(*Client) OutgoingMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	room, ok := h.rooms[roomCode]
	if !ok {
		return
	}

	for client := range room {
		msg := msgFunc(client)
		if msg.Type != "" {
			client.SendJSON(msg)
		}
	}
}

func (h *Hub) GetRoomClients(roomCode string) []*Client {
	h.mu.RLock()
	defer h.mu.RUnlock()

	var clients []*Client
	if room, ok := h.rooms[roomCode]; ok {
		for client := range room {
			clients = append(clients, client)
		}
	}
	return clients
}

func (h *Hub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
