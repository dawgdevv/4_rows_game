package game

type GameResult struct {
	RoomCode string
	Winner   int
	Draw     bool
}

func FinishGame(room *Room) GameResult {
	return GameResult{
		RoomCode: room.Code,
		Winner:   room.Winner,
		Draw:     room.GameOver && room.Winner == 0,
	}
}
