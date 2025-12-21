package game

import (
	"math/rand"
	"sync"
	"time"
)

const (
	Rows = 6
	Cols = 7
)

type Room struct {
	Code        string
	Players     [2]PlayerSlot
	Board       [Rows][Cols]int
	CurrentTurn int
	GameStarted bool
	GameOver    bool
	Winner      int
	mu          sync.Mutex
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

func (r *Room) DropPiece(column int, playerNum int) (row int, valid bool) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.GameOver {
		return -1, false
	}

	if r.CurrentTurn != playerNum {
		return -1, false
	}

	if column < 0 || column >= Cols {
		return -1, false
	}

	for row = Rows - 1; row >= 0; row-- {
		if r.Board[row][column] == 0 {
			r.Board[row][column] = playerNum
			r.CurrentTurn = 3 - playerNum
			return row, true
		}
	}

	return -1, false
}

func (r *Room) CheckWin(row, col, player int) (bool, []CellPos) {
	directions := [][2]int{{0, 1}, {1, 0}, {1, 1}, {1, -1}}

	for _, dir := range directions {
		cells := []CellPos{{Row: row, Col: col}}

		for i := 1; i < 4; i++ {
			nr, nc := row+dir[0]*i, col+dir[1]*i
			if nr >= 0 && nr < Rows && nc >= 0 && nc < Cols && r.Board[nr][nc] == player {
				cells = append(cells, CellPos{Row: nr, Col: nc})
			} else {
				break
			}
		}

		for i := 1; i < 4; i++ {
			nr, nc := row-dir[0]*i, col-dir[1]*i
			if nr >= 0 && nr < Rows && nc >= 0 && nc < Cols && r.Board[nr][nc] == player {
				cells = append(cells, CellPos{Row: nr, Col: nc})
			} else {
				break
			}
		}

		if len(cells) >= 4 {
			r.GameOver = true
			r.Winner = player
			return true, cells
		}
	}

	return false, nil
}

func (r *Room) CheckDraw() bool {
	for col := 0; col < Cols; col++ {
		if r.Board[0][col] == 0 {
			return false
		}
	}
	r.GameOver = true
	return true
}

type CellPos struct {
	Row int
	Col int
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
