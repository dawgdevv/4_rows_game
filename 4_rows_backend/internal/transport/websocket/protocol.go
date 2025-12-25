package websocket

type MessageType string

const (
	TypeCreateRoom      MessageType = "create_room"
	TypeRoomCreated     MessageType = "room_created"
	TypeJoinRoom        MessageType = "join_room"
	TypeRoomJoined      MessageType = "room_joined"
	TypeGameStart       MessageType = "game_start"
	TypeMove            MessageType = "move"
	TypeMoveResult      MessageType = "move_result"
	TypeGameOver        MessageType = "game_over"
	TypeRematchRequest  MessageType = "rematch_request"
	TypeRematchWaiting  MessageType = "rematch_waiting"
	TypeRematchAccepted MessageType = "rematch_accepted"
	TypeOpponentLeft    MessageType = "opponent_left"
	TypeError           MessageType = "error"
	TypePing            MessageType = "ping"
	TypePong            MessageType = "pong"
	TypeCreateBotGame   MessageType = "create_bot_game"
	TypeBotMove         MessageType = "bot_move"
)

type IncomingMessage struct {
	Type       MessageType `json:"type"`
	RoomCode   string      `json:"room_code,omitempty"`
	Column     int         `json:"column,omitempty"`
	PlayerName string      `json:"player_name,omitempty"`
}

type OutgoingMessage struct {
	Type    MessageType `json:"type"`
	Payload interface{} `json:"payload,omitempty"`
}

type RoomCreatedPayload struct {
	RoomCode string `json:"room_code"`
}

type RoomJoinedPayload struct {
	RoomCode string `json:"room_code"`
	Message  string `json:"message"`
}

type GameStartPayload struct {
	RoomCode     string `json:"room_code"`
	PlayerNumber int    `json:"player_number"`
	Player1Name  string `json:"player1_name"`
	Player2Name  string `json:"player2_name"`
}

type MoveResultPayload struct {
	Column       int  `json:"column"`
	Row          int  `json:"row"`
	PlayerNumber int  `json:"player_number"`
	NextPlayer   int  `json:"next_player"`
	Valid        bool `json:"valid"`
}

type GameOverPayload struct {
	Winner       int            `json:"winner"`
	WinningCells []CellPosition `json:"winning_cells,omitempty"`
	IsDraw       bool           `json:"is_draw"`
}

type CellPosition struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

type RematchWaitingPayload struct {
	Message     string `json:"message"`
	IsInitiator bool   `json:"is_initiator"`
}

type RematchAcceptedPayload struct {
	Message string `json:"message"`
}

type ErrorPayload struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func NewMessage(msgType MessageType, payload interface{}) OutgoingMessage {
	return OutgoingMessage{
		Type:    msgType,
		Payload: payload,
	}
}

func NewError(code string, message string) OutgoingMessage {
	return OutgoingMessage{
		Type: TypeError,
		Payload: ErrorPayload{
			Code:    code,
			Message: message,
		},
	}
}
