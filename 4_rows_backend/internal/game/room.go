package game

import (
	"math/rand"
	"sync"
	"time"
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
	mu              sync.Mutex
}

type PlayerSlot struct {
	ID        string
	Connected bool
}

type RoomManager struct {
	rooms map[string]*Room
	mu    sync.RWMutex
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
