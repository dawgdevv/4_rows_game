package websocket

import (
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn *websocket.Conn
	Send chan []byte
}

func NewClient(conn *websocket.Conn) *Client {
	return &Client{
		Conn: conn,
		Send: make(chan []byte, 256),
	}
}

func (c *Client) ReadLoop() {
	defer c.Conn.Close()

	for {

		_, msg, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			return
		}
		log.Println("Recieved:", string(msg))

		c.Send <- msg

	}

}

func (c *Client) WriteLoop() {
	defer c.Conn.Close()

	for msg := range c.Send {
		err := c.Conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Println("Write error:", err)
			return
		}
	}
}
