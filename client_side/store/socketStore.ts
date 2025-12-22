import { create } from "zustand";
import { useGameStore } from "./gameStore";

type Message =
  | "create_room"
  | "room_created"
  | "join_room"
  | "room_joined"
  | "game_start"
  | "move"
  | "move_result"
  | "game_over"
  | "opponent_left"
  | "error"
  | "ping"
  | "pong";


interface SocketStore {
    socket: WebSocket | null;
    isConnected: boolean;
    roomCode: string | null;
    playerNumber: number | null;
    error:string | null;

    connect:()=>void;
    createRoom:()=>void;
    joinRoom:(roomCode:string)=>void;
    sendMove:(moveData:any)=>void;
    disconnect:()=>void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
    socket: null,
    isConnected: false,
    roomCode: null,
    playerNumber: null,
    error:null,

    connect: () => {
        const socket = new WebSocket("wss://yourserver.com/socket");

        socket.onopen = () => {
            set({ isConnected: true, socket, error:null });
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const gameStore = useGameStore.getState();
            
            switch (data.message) {
                case "room_created":
                    set({ roomCode: data.roomCode, playerNumber: 1 });
                    break;
                case "room_joined":
                    set({ roomCode: data.roomCode, playerNumber: 2 });
                    break;
                case "move_result":
                    gameStore.updateGameState(data.gameState);
                    break;
                case "game_over":
                    gameStore.setGameOver(data.winner);
                    break;
                case "error":
                    set({error: data.error});
                    break;
            }};

            set({ socket });

        }

        createRoom: () => {
            const { socket } = get();
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ message: "create_room" }));
            }
        },
        
        joinRoom: (roomCode: string) => {  
            const { socket } = get();
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ message: "join_room", roomCode }));
            }
        },
        
        sendMove: (moveData: any) => {
            const { socket } = get();
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ message: "move", moveData }));
            }
        },

        disconnect: () => {
            const { socket } = get();
            if (socket) {
                socket.close();
                set({ socket: null, isConnected: false, roomCode: null, playerNumber: null });
            }
        },
}));