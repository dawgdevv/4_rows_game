package storage

import (
	"database/sql"
	"encoding/json"
	"log"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// RoomData represents a row in the rooms table
type RoomData struct {
	Code         string
	Player1ID    string
	Player2ID    string
	Board        [6][7]int
	CurrentTurn  int
	GameStarted  bool
	GameOver     bool
	Winner       int
	IsBotGame    bool
	CreatedAt    time.Time
	LastActivity time.Time
}

// SQLiteStorage implements game state persistence
type SQLiteStorage struct {
	db *sql.DB
}

// NewSQLiteStorage creates a new SQLiteStorage instance
func NewSQLiteStorage(dbPath string) (*SQLiteStorage, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	// Create tables if they don't exist
	if err := createTables(db); err != nil {
		db.Close()
		return nil, err
	}

	return &SQLiteStorage{db: db}, nil
}

func createTables(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS rooms (
		code TEXT PRIMARY KEY,
		player1_id TEXT NOT NULL,
		player2_id TEXT DEFAULT '',
		board TEXT NOT NULL,
		current_turn INTEGER DEFAULT 1,
		game_started INTEGER DEFAULT 0,
		game_over INTEGER DEFAULT 0,
		winner INTEGER DEFAULT 0,
		is_bot_game INTEGER DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_rooms_last_activity ON rooms(last_activity);
	`
	_, err := db.Exec(query)
	return err
}

// SaveRoom saves or updates a room in the database
func (s *SQLiteStorage) SaveRoom(room *RoomData) error {
	boardJSON, err := json.Marshal(room.Board)
	if err != nil {
		return err
	}

	query := `
	INSERT OR REPLACE INTO rooms 
		(code, player1_id, player2_id, board, current_turn, game_started, game_over, winner, is_bot_game, last_activity)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	`

	_, err = s.db.Exec(query,
		room.Code,
		room.Player1ID,
		room.Player2ID,
		string(boardJSON),
		room.CurrentTurn,
		boolToInt(room.GameStarted),
		boolToInt(room.GameOver),
		room.Winner,
		boolToInt(room.IsBotGame),
	)

	return err
}

// GetRoom retrieves a room from the database
func (s *SQLiteStorage) GetRoom(code string) (*RoomData, error) {
	query := `
	SELECT code, player1_id, player2_id, board, current_turn, game_started, game_over, winner, is_bot_game, created_at, last_activity
	FROM rooms WHERE code = ?
	`

	row := s.db.QueryRow(query, code)

	var room RoomData
	var boardJSON string
	var gameStarted, gameOver, isBotGame int

	err := row.Scan(
		&room.Code,
		&room.Player1ID,
		&room.Player2ID,
		&boardJSON,
		&room.CurrentTurn,
		&gameStarted,
		&gameOver,
		&room.Winner,
		&isBotGame,
		&room.CreatedAt,
		&room.LastActivity,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Parse board JSON
	if err := json.Unmarshal([]byte(boardJSON), &room.Board); err != nil {
		return nil, err
	}

	room.GameStarted = gameStarted == 1
	room.GameOver = gameOver == 1
	room.IsBotGame = isBotGame == 1

	return &room, nil
}

// DeleteRoom removes a room from the database
func (s *SQLiteStorage) DeleteRoom(code string) error {
	_, err := s.db.Exec("DELETE FROM rooms WHERE code = ?", code)
	return err
}

// DeleteInactiveRooms removes rooms that haven't been active for the specified duration
func (s *SQLiteStorage) DeleteInactiveRooms(maxAge time.Duration) (int64, error) {
	cutoff := time.Now().Add(-maxAge)

	result, err := s.db.Exec(
		"DELETE FROM rooms WHERE last_activity < ?",
		cutoff.Format("2006-01-02 15:04:05"),
	)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected()
}

// UpdateLastActivity updates the last_activity timestamp for a room
func (s *SQLiteStorage) UpdateLastActivity(code string) error {
	_, err := s.db.Exec(
		"UPDATE rooms SET last_activity = CURRENT_TIMESTAMP WHERE code = ?",
		code,
	)
	return err
}

// GetAllRoomCodes returns all room codes (for cache warming on startup)
func (s *SQLiteStorage) GetAllRoomCodes() ([]string, error) {
	rows, err := s.db.Query("SELECT code FROM rooms WHERE game_over = 0")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var codes []string
	for rows.Next() {
		var code string
		if err := rows.Scan(&code); err != nil {
			return nil, err
		}
		codes = append(codes, code)
	}

	return codes, rows.Err()
}

// Close closes the database connection
func (s *SQLiteStorage) Close() error {
	return s.db.Close()
}

// StartCleanupRoutine starts a goroutine that periodically cleans up inactive rooms
func (s *SQLiteStorage) StartCleanupRoutine(interval, maxAge time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			deleted, err := s.DeleteInactiveRooms(maxAge)
			if err != nil {
				log.Printf("Error during room cleanup: %v", err)
			} else if deleted > 0 {
				log.Printf("Cleaned up %d inactive rooms", deleted)
			}
		}
	}()
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
