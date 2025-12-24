package bot

import (
	"math/rand"
	"time"

	"4_rows_backend/internal/game"
)

const (
	// Bot is always player 2
	BotPlayerNumber = 2
)

type Bot struct {
	playerNumber int
}

// NewBot creates a new bot instance
func NewBot() *Bot {
	rand.Seed(time.Now().UnixNano())
	return &Bot{
		playerNumber: BotPlayerNumber,
	}
}

// GetBestMove returns the best column to play in
// Uses a simple heuristic: 1) Win, 2) Block, 3) Center preference
func (b *Bot) GetBestMove(board *game.Board, humanPlayer int) int {
	cpuPlayer := b.playerNumber
	validMoves := b.getValidMoves(board)

	if len(validMoves) == 0 {
		return -1
	}

	// Priority 1: Check for winning move
	for _, col := range validMoves {
		if b.wouldWin(board, col, cpuPlayer) {
			return col
		}
	}

	// Priority 2: Block opponent's winning move
	for _, col := range validMoves {
		if b.wouldWin(board, col, humanPlayer) {
			return col
		}
	}

	// Priority 3: Center preference (columns ranked by strategic value)
	preference := []int{3, 2, 4, 1, 5, 0, 6}
	for _, col := range preference {
		if b.isValidMove(validMoves, col) {
			return col
		}
	}

	// Fallback: random valid move
	return validMoves[rand.Intn(len(validMoves))]
}

// getValidMoves returns all columns that are not full
func (b *Bot) getValidMoves(board *game.Board) []int {
	var validMoves []int
	for col := 0; col < game.Cols; col++ {
		if board.Grid[0][col] == 0 {
			validMoves = append(validMoves, col)
		}
	}
	return validMoves
}

// isValidMove checks if a column is in the valid moves list
func (b *Bot) isValidMove(validMoves []int, col int) bool {
	for _, v := range validMoves {
		if v == col {
			return true
		}
	}
	return false
}

// wouldWin simulates a move and checks if it would result in a win
func (b *Bot) wouldWin(board *game.Board, col int, player int) bool {
	// Find the row where the disc would land
	row := -1
	for r := game.Rows - 1; r >= 0; r-- {
		if board.Grid[r][col] == 0 {
			row = r
			break
		}
	}

	if row < 0 {
		return false
	}

	// Simulate the move on a copy of the board
	tempBoard := b.copyBoard(board)
	tempBoard.Grid[row][col] = player

	// Check if this results in a win
	won, _ := tempBoard.CheckWin(row, col, player)
	return won
}

// copyBoard creates a deep copy of the board
func (b *Bot) copyBoard(board *game.Board) *game.Board {
	newBoard := &game.Board{}
	for r := 0; r < game.Rows; r++ {
		for c := 0; c < game.Cols; c++ {
			newBoard.Grid[r][c] = board.Grid[r][c]
		}
	}
	return newBoard
}
