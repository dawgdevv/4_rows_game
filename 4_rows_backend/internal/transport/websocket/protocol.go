package websocket

type Message struct {
	Type   string `json:"type"`
	Column int    `json:"coloumn"`
}
