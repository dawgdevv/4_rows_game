package game

import (
	"log"
	"math/rand"
	"sync"
	"time"

	"4_rows_backend/internal/storage"
)

type GameState struct {
	Board       [Rows][Cols]int
	CurrentTurn int
	GameOver    bool
	Winner      int
}

type Room struct {
	Code            string
	Players         [2]PlayerSlot
	Board           Board
	CurrentTurn     int
	GameStarted     bool
	GameOver        bool
	Winner          int
	RematchRequests [2]bool
	IsBotGame       bool
	mu              sync.Mutex
}

type PlayerSlot struct {
	ID        string
	Connected bool
}

type RoomManager struct {
	rooms   map[string]*Room
	mu      sync.RWMutex
	storage *storage.SQLiteStorage
}

var manager *RoomManager

func (r *Room) State() GameState {
	r.mu.Lock()
	defer r.mu.Unlock()

	return GameState{
		Board:       r.Board.Grid,
		CurrentTurn: r.CurrentTurn,
		GameOver:    r.GameOver,
		Winner:      r.Winner,
	}
}

func GetRoomManager() *RoomManager {
	if manager == nil {
		manager = &RoomManager{
			rooms: make(map[string]*Room),
		}
	}
	return manager
}

// SetStorage sets the SQLite storage for persistence
func (rm *RoomManager) SetStorage(s *storage.SQLiteStorage) {
	rm.storage = s
}

// saveRoom persists a room to SQLite if storage is configured
func (rm *RoomManager) saveRoom(room *Room) {
	if rm.storage == nil {
		return
	}

	data := &storage.RoomData{
		Code:        room.Code,
		Player1ID:   room.Players[0].ID,
		Player2ID:   room.Players[1].ID,
		Board:       room.Board.Grid,
		CurrentTurn: room.CurrentTurn,
		GameStarted: room.GameStarted,
		GameOver:    room.GameOver,
		Winner:      room.Winner,
		IsBotGame:   room.IsBotGame,
	}

	if err := rm.storage.SaveRoom(data); err != nil {
		log.Printf("Error saving room %s to SQLite: %v", room.Code, err)
	} else {
		log.Printf("Room %s saved to SQLite", room.Code)
	}
}

// updateActivity updates the last activity timestamp in SQLite
func (rm *RoomManager) updateActivity(code string) {
	if rm.storage != nil {
		rm.storage.UpdateLastActivity(code)
	}
}

// SaveRoomState saves the current state of a room to SQLite (call after MakeMove)
func (rm *RoomManager) SaveRoomState(room *Room) {
	rm.saveRoom(room)
	rm.updateActivity(room.Code)
}

func (rm *RoomManager) CreateRoom(playerID string) *Room {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	code := generateCode()

	for rm.rooms[code] != nil {
		code = generateCode()
	}

	room := &Room{
		Code:        code,
		CurrentTurn: 1,
	}
	room.Players[0] = PlayerSlot{ID: playerID, Connected: true}

	rm.rooms[code] = room
	rm.saveRoom(room)
	return room
}

func (rm *RoomManager) CreateBotRoom(playerID string) *Room {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	code := generateCode()

	for rm.rooms[code] != nil {
		code = generateCode()
	}

	room := &Room{
		Code:        code,
		CurrentTurn: 1,
		IsBotGame:   true,
		GameStarted: true, // Bot game starts immediately
	}
	room.Players[0] = PlayerSlot{ID: playerID, Connected: true}
	room.Players[1] = PlayerSlot{ID: "bot", Connected: true}

	rm.rooms[code] = room
	rm.saveRoom(room)
	return room
}

func (rm *RoomManager) JoinRoom(code string, playerID string) (*Room, error) {
	rm.mu.Lock()
	defer rm.mu.Unlock()

	room := rm.rooms[code]
	if room == nil {
		return nil, ErrRoomNotFound
	}

	if room.Players[1].Connected {
		return nil, ErrRoomFull
	}

	room.Players[1] = PlayerSlot{ID: playerID, Connected: true}
	room.GameStarted = true

	rm.saveRoom(room)
	return room, nil
}

func (rm *RoomManager) GetRoom(code string) *Room {
	rm.mu.RLock()
	defer rm.mu.RUnlock()
	return rm.rooms[code]
}

func (rm *RoomManager) RemoveRoom(code string) {
	rm.mu.Lock()
	defer rm.mu.Unlock()
	delete(rm.rooms, code)
	if rm.storage != nil {
		rm.storage.DeleteRoom(code)
	}
}

func (rm *RoomManager) GetPlayerNumber(room *Room, playerID string) int {
	if room.Players[0].ID == playerID {
		return 1
	}
	if room.Players[1].ID == playerID {
		return 2
	}
	return 0
}
func (r *Room) MakeMove(column int, playerNum int) (int, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.GameOver {
		return -1, ErrInvalidMove
	}

	if r.CurrentTurn != playerNum {
		return -1, ErrNotYourTurn
	}

	row, ok := r.Board.Drop(column, playerNum)
	if !ok {
		return -1, ErrInvalidMove
	}

	if won, _ := r.Board.CheckWin(row, column, playerNum); won {
		r.GameOver = true
		r.Winner = playerNum
	} else if r.Board.IsDraw() {
		r.GameOver = true
	}

	r.CurrentTurn = 3 - playerNum
	return row, nil
}

func (r *Room) ResetGame() {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Reset the board
	r.Board = Board{}

	// Reset game state
	r.CurrentTurn = 1
	r.GameOver = false
	r.Winner = 0
	r.RematchRequests = [2]bool{false, false}
}

func (r *Room) RequestRematch(playerNum int) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	if playerNum < 1 || playerNum > 2 {
		return false
	}

	r.RematchRequests[playerNum-1] = true
	return r.RematchRequests[0] && r.RematchRequests[1]
}

func generateCode() string {
	rand.Seed(time.Now().UnixNano())
	chars := "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	code := make([]byte, 6)
	for i := range code {
		code[i] = chars[rand.Intn(len(chars))]
	}
	return string(code)
}
