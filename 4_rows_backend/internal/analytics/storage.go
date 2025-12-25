package analytics

import (
	"database/sql"
	"encoding/json"
	"log"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// GameEvent represents a stored game event
type GameEvent struct {
	ID              int64
	RoomCode        string
	Player1Name     string
	Player2Name     string
	Winner          int
	IsBotGame       bool
	DurationSeconds int64
	CreatedAt       time.Time
}

// DailyStats represents aggregated daily statistics
type DailyStats struct {
	Date               string
	TotalGames         int
	BotGames           int
	PvPGames           int
	Player1Wins        int
	Player2Wins        int
	Draws              int
	AvgDurationSeconds float64
}

// AnalyticsStorage handles analytics database operations
type AnalyticsStorage struct {
	db *sql.DB
}

// NewAnalyticsStorage creates a new analytics storage
func NewAnalyticsStorage(dbPath string) (*AnalyticsStorage, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	if err := createAnalyticsTables(db); err != nil {
		db.Close()
		return nil, err
	}

	return &AnalyticsStorage{db: db}, nil
}

func createAnalyticsTables(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS game_events (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		room_code TEXT NOT NULL,
		player1_name TEXT,
		player2_name TEXT,
		winner INTEGER,
		is_bot_game INTEGER,
		duration_seconds INTEGER,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_game_events_created ON game_events(created_at);

	CREATE TABLE IF NOT EXISTS daily_stats (
		date TEXT PRIMARY KEY,
		total_games INTEGER DEFAULT 0,
		bot_games INTEGER DEFAULT 0,
		pvp_games INTEGER DEFAULT 0,
		player1_wins INTEGER DEFAULT 0,
		player2_wins INTEGER DEFAULT 0,
		draws INTEGER DEFAULT 0,
		avg_duration_seconds REAL DEFAULT 0
	);
	`
	_, err := db.Exec(query)
	return err
}

// SaveGameEvent stores a game event
func (s *AnalyticsStorage) SaveGameEvent(event *GameEvent) error {
	query := `
	INSERT INTO game_events (room_code, player1_name, player2_name, winner, is_bot_game, duration_seconds)
	VALUES (?, ?, ?, ?, ?, ?)
	`

	result, err := s.db.Exec(query,
		event.RoomCode,
		event.Player1Name,
		event.Player2Name,
		event.Winner,
		boolToInt(event.IsBotGame),
		event.DurationSeconds,
	)
	if err != nil {
		return err
	}

	event.ID, _ = result.LastInsertId()

	// Update daily stats
	return s.updateDailyStats(event)
}

func (s *AnalyticsStorage) updateDailyStats(event *GameEvent) error {
	today := time.Now().Format("2006-01-02")

	// Upsert daily stats
	query := `
	INSERT INTO daily_stats (date, total_games, bot_games, pvp_games, player1_wins, player2_wins, draws, avg_duration_seconds)
	VALUES (?, 1, ?, ?, ?, ?, ?, ?)
	ON CONFLICT(date) DO UPDATE SET
		total_games = total_games + 1,
		bot_games = bot_games + ?,
		pvp_games = pvp_games + ?,
		player1_wins = player1_wins + ?,
		player2_wins = player2_wins + ?,
		draws = draws + ?,
		avg_duration_seconds = (avg_duration_seconds * (total_games - 1) + ?) / total_games
	`

	botGame := boolToInt(event.IsBotGame)
	pvpGame := boolToInt(!event.IsBotGame)
	p1Win := boolToInt(event.Winner == 1)
	p2Win := boolToInt(event.Winner == 2)
	draw := boolToInt(event.Winner == 0)

	_, err := s.db.Exec(query,
		today, botGame, pvpGame, p1Win, p2Win, draw, float64(event.DurationSeconds),
		botGame, pvpGame, p1Win, p2Win, draw, float64(event.DurationSeconds),
	)
	return err
}

// GetDailyStats retrieves stats for a specific date
func (s *AnalyticsStorage) GetDailyStats(date string) (*DailyStats, error) {
	query := `SELECT * FROM daily_stats WHERE date = ?`
	row := s.db.QueryRow(query, date)

	var stats DailyStats
	err := row.Scan(
		&stats.Date,
		&stats.TotalGames,
		&stats.BotGames,
		&stats.PvPGames,
		&stats.Player1Wins,
		&stats.Player2Wins,
		&stats.Draws,
		&stats.AvgDurationSeconds,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &stats, err
}

// GetRecentGames retrieves the most recent games
func (s *AnalyticsStorage) GetRecentGames(limit int) ([]GameEvent, error) {
	query := `SELECT id, room_code, player1_name, player2_name, winner, is_bot_game, duration_seconds, created_at 
	          FROM game_events ORDER BY created_at DESC LIMIT ?`

	rows, err := s.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var games []GameEvent
	for rows.Next() {
		var g GameEvent
		var isBotGame int
		if err := rows.Scan(&g.ID, &g.RoomCode, &g.Player1Name, &g.Player2Name, &g.Winner, &isBotGame, &g.DurationSeconds, &g.CreatedAt); err != nil {
			return nil, err
		}
		g.IsBotGame = isBotGame == 1
		games = append(games, g)
	}
	return games, nil
}

// ProcessKafkaMessage processes a raw Kafka message
func (s *AnalyticsStorage) ProcessKafkaMessage(data []byte) error {
	var msg struct {
		Type            string `json:"type"`
		RoomCode        string `json:"room_code"`
		Player1Name     string `json:"player1_name"`
		Player2Name     string `json:"player2_name"`
		Winner          int    `json:"winner"`
		IsBotGame       bool   `json:"is_bot_game"`
		DurationSeconds int64  `json:"duration_seconds"`
	}

	if err := json.Unmarshal(data, &msg); err != nil {
		return err
	}

	if msg.Type != "game_completed" {
		log.Printf("Ignoring message of type: %s", msg.Type)
		return nil
	}

	event := &GameEvent{
		RoomCode:        msg.RoomCode,
		Player1Name:     msg.Player1Name,
		Player2Name:     msg.Player2Name,
		Winner:          msg.Winner,
		IsBotGame:       msg.IsBotGame,
		DurationSeconds: msg.DurationSeconds,
	}

	return s.SaveGameEvent(event)
}

// LeaderboardEntry represents a player's ranking
type LeaderboardEntry struct {
	Name    string  `json:"name"`
	Wins    int     `json:"wins"`
	Games   int     `json:"games"`
	WinRate float64 `json:"win_rate"`
}

// GetLeaderboard returns top players ranked by wins
func (s *AnalyticsStorage) GetLeaderboard(limit int) ([]LeaderboardEntry, error) {
	// Aggregate wins from player perspective (player can be player1 or player2)
	query := `
	SELECT name, SUM(wins) as total_wins, SUM(games) as total_games
	FROM (
		-- Games where player was player1
		SELECT 
			player1_name as name,
			CASE WHEN winner = 1 THEN 1 ELSE 0 END as wins,
			1 as games
		FROM game_events 
		WHERE player1_name != '' AND player1_name != 'bot'
		
		UNION ALL
		
		-- Games where player was player2 (only non-bot games)
		SELECT 
			player2_name as name,
			CASE WHEN winner = 2 THEN 1 ELSE 0 END as wins,
			1 as games
		FROM game_events 
		WHERE player2_name != '' AND player2_name != 'bot' AND is_bot_game = 0
	)
	GROUP BY name
	ORDER BY total_wins DESC, total_games DESC
	LIMIT ?
	`

	rows, err := s.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaderboard []LeaderboardEntry
	for rows.Next() {
		var entry LeaderboardEntry
		if err := rows.Scan(&entry.Name, &entry.Wins, &entry.Games); err != nil {
			return nil, err
		}
		if entry.Games > 0 {
			entry.WinRate = float64(entry.Wins) / float64(entry.Games)
		}
		leaderboard = append(leaderboard, entry)
	}

	return leaderboard, rows.Err()
}

// Close closes the database connection
func (s *AnalyticsStorage) Close() error {
	return s.db.Close()
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
