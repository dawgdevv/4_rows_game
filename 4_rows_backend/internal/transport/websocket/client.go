package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"4_rows_backend/internal/game"

	"github.com/gorilla/websocket"
)

const (
	WriteTimeout = 10 * time.Second
	ReadTimeout  = 60 * time.Second
	PingInterval = 30 * time.Second
)

type Client struct {
	ID       string
	Conn     *websocket.Conn
	Send     chan []byte
	Hub      *Hub
	RoomCode string
	mu       sync.Mutex
}

func NewClient(id string, conn *websocket.Conn, hub *Hub) *Client {
	return &Client{
		ID:   id,
		Conn: conn,
		Send: make(chan []byte, 256),
		Hub:  hub,
	}
}

func (c *Client) ReadLoop() {
	defer func() {
		c.handleDisconnect()
		c.Hub.Unregister(c)
		c.Conn.Close()
	}()

	c.Conn.SetReadDeadline(time.Now().Add(ReadTimeout))

	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(ReadTimeout))
		return nil
	})

	for {
		_, rawMessage, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("client %s disconnected unexpectedly: %v", c.ID, err)
			}
			return
		}

		c.handleMessage(rawMessage)
	}
}

func (c *Client) WriteLoop() {
	ticker := time.NewTicker(PingInterval)

	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(WriteTimeout))

			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			err := c.Conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Printf("client %s write error: %v", c.ID, err)
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(WriteTimeout))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) handleMessage(rawMessage []byte) {
	var msg IncomingMessage
	if err := json.Unmarshal(rawMessage, &msg); err != nil {
		c.SendJSON(NewError("invalid_json", "could not parse message"))
		return
	}

	switch msg.Type {
	case TypePing:
		c.SendJSON(NewMessage(TypePong, nil))

	case TypeCreateRoom:
		c.handleCreateRoom()

	case TypeJoinRoom:
		c.handleJoinRoom(msg.RoomCode)

	case TypeMove:
		c.handleMove(msg.Column)

	case TypeRematchRequest:
		c.handleRematch()

	default:
		c.SendJSON(NewError("unknown_type", "message type not recognized"))
	}
}

func (c *Client) handleCreateRoom() {
	rm := game.GetRoomManager()
	room := rm.CreateRoom(c.ID)

	c.SetRoomCode(room.Code)
	c.Hub.JoinRoom(room.Code, c)

	log.Printf("client %s created room %s", c.ID, room.Code)

	c.SendJSON(NewMessage(TypeRoomCreated, RoomCreatedPayload{
		RoomCode: room.Code,
	}))
}

func (c *Client) handleJoinRoom(code string) {
	if code == "" {
		c.SendJSON(NewError("missing_code", "room code is required"))
		return
	}

	rm := game.GetRoomManager()
	room, err := rm.JoinRoom(code, c.ID)

	if err != nil {
		c.SendJSON(NewError("join_failed", err.Error()))
		return
	}

	c.SetRoomCode(code)
	c.Hub.JoinRoom(code, c)

	log.Printf("client %s joined room %s", c.ID, code)

	c.SendJSON(NewMessage(TypeRoomJoined, RoomJoinedPayload{
		RoomCode: code,
		Message:  "waiting for game to start",
	}))

	if room.GameStarted {
		c.Hub.BroadcastToRoom(code, func(client *Client) OutgoingMessage {
			playerNum := rm.GetPlayerNumber(room, client.ID)
			return NewMessage(TypeGameStart, GameStartPayload{
				RoomCode:     code,
				PlayerNumber: playerNum,
			})
		})
	}
}

func (c *Client) handleMove(column int) {
	roomCode := c.GetRoomCode()
	if roomCode == "" {
		c.SendJSON(NewError("not_in_room", "you are not in a room"))
		return
	}

	rm := game.GetRoomManager()
	room := rm.GetRoom(roomCode)
	if room == nil {
		c.SendJSON(NewError("room_gone", "room no longer exists"))
		return
	}

	playerNum := rm.GetPlayerNumber(room, c.ID)
	row, err := room.MakeMove(column, playerNum)

	if err != nil {
		c.SendJSON(NewError("invalid_move", "move not allowed"))
		return
	}

	moveResult := MoveResultPayload{
		Column:       column,
		Row:          row,
		PlayerNumber: playerNum,
		NextPlayer:   room.CurrentTurn,
		Valid:        true,
	}

	c.Hub.BroadcastToRoom(roomCode, func(client *Client) OutgoingMessage {
		return NewMessage(TypeMoveResult, moveResult)
	})

	won, cells := room.Board.CheckWin(row, column, playerNum)
	if won {
		winCells := make([]CellPosition, len(cells))
		for i, cell := range cells {
			winCells[i] = CellPosition{Row: cell.Row, Col: cell.Col}
		}

		c.Hub.BroadcastToRoom(roomCode, func(client *Client) OutgoingMessage {
			return NewMessage(TypeGameOver, GameOverPayload{
				Winner:       playerNum,
				WinningCells: winCells,
				IsDraw:       false,
			})
		})
		return
	}

	if room.Board.IsDraw() {
		c.Hub.BroadcastToRoom(roomCode, func(client *Client) OutgoingMessage {
			return NewMessage(TypeGameOver, GameOverPayload{
				Winner: 0,
				IsDraw: true,
			})
		})
	}
}

func (c *Client) handleRematch() {
	roomCode := c.GetRoomCode()
	if roomCode == "" {
		c.SendJSON(NewError("not_in_room", "you are not in a room"))
		return
	}

	rm := game.GetRoomManager()
	room := rm.GetRoom(roomCode)
	if room == nil {
		c.SendJSON(NewError("room_gone", "room no longer exists"))
		return
	}

	if !room.GameOver {
		c.SendJSON(NewError("game_not_over", "game is still in progress"))
		return
	}

	playerNum := rm.GetPlayerNumber(room, c.ID)
	if playerNum == 0 {
		c.SendJSON(NewError("not_player", "you are not a player in this room"))
		return
	}

	// Mark this player's rematch request and check if both are ready
	bothReady := room.RequestRematch(playerNum)

	if bothReady {
		// Both players want a rematch, reset the game
		room.ResetGame()

		log.Printf("room %s: both players agreed to rematch, resetting game", roomCode)

		// Notify both players that the game is resetting
		c.Hub.BroadcastToRoom(roomCode, func(client *Client) OutgoingMessage {
			return NewMessage(TypeRematchAccepted, RematchAcceptedPayload{
				Message: "Both players agreed! Starting new game...",
			})
		})
	} else {
		// Only one player requested rematch, notify the other
		log.Printf("room %s: player %d requested rematch, waiting for opponent", roomCode, playerNum)

		c.Hub.BroadcastToRoom(roomCode, func(client *Client) OutgoingMessage {
			clientPlayerNum := rm.GetPlayerNumber(room, client.ID)
			if clientPlayerNum == playerNum {
				// The player who just requested
				return NewMessage(TypeRematchWaiting, RematchWaitingPayload{
					Message:     "Waiting for opponent to accept rematch...",
					IsInitiator: true,
				})
			} else {
				// The other player
				return NewMessage(TypeRematchWaiting, RematchWaitingPayload{
					Message:     "Opponent requested a rematch!",
					IsInitiator: false,
				})
			}
		})
	}
}

func (c *Client) handleDisconnect() {
	roomCode := c.GetRoomCode()
	if roomCode == "" {
		return
	}

	c.Hub.BroadcastToRoom(roomCode, func(client *Client) OutgoingMessage {
		if client.ID != c.ID {
			return NewMessage(TypeOpponentLeft, nil)
		}
		return OutgoingMessage{}
	})

	rm := game.GetRoomManager()
	rm.RemoveRoom(roomCode)
}

func (c *Client) SendJSON(msg OutgoingMessage) {
	if msg.Type == "" {
		return
	}

	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("failed to marshal message: %v", err)
		return
	}

	select {
	case c.Send <- data:
	default:
		log.Printf("client %s send buffer full, dropping message", c.ID)
	}
}

func (c *Client) SetRoomCode(code string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.RoomCode = code
}

func (c *Client) GetRoomCode() string {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.RoomCode
}
