package game

type Move struct {
	Column    int
	PlayerNum int
}

func ApplyMove(room *Room, move Move) (int, error) {
	if room == nil {
		return -1, ErrRoomNotFound
	}
	return room.MakeMove(move.Column, move.PlayerNum)
}
