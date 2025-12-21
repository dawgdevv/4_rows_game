package game

import "errors"

var (
	ErrRoomNotFound = errors.New("room not found")
	ErrRoomFull     = errors.New("room is full")
	ErrNotYourTurn  = errors.New("not your turn")
	ErrInvalidMove  = errors.New("invalid move")
)
