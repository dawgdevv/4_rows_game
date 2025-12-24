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
    | "rematch_request"
    | "rematch_waiting"
    | "rematch_accepted"
    | "opponent_left"
    | "error"
    | "ping"
    | "pong"
    | "create_bot_game";


interface SocketStore {
    socket: WebSocket | null;
    isConnected: boolean;
    roomCode: string | null;
    playerNumber: number | null;
    error: string | null;
    isBotGame: boolean;

    connect: () => void;
    createRoom: () => void;
    createBotGame: () => void;
    joinRoom: (roomCode: string) => void;
    sendMove: (moveData: any) => void;
    requestRematch: () => void;
    disconnect: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
    socket: null,
    isConnected: false,
    roomCode: null,
    playerNumber: null,
    error: null,
    isBotGame: false,

    connect: () => {
        const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            set({ isConnected: true, socket, error: null });
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const gameStore = useGameStore.getState();
                const payload = data.payload;

                console.log("WebSocket message:", data.type, payload);

                switch (data.type) {
                    case "room_created":
                        console.log("Room created! Payload:", payload);
                        console.log("Room code:", payload?.room_code);
                        set({ roomCode: payload?.room_code, playerNumber: 1 });
                        break;
                    case "room_joined":
                        set({ roomCode: payload.room_code, playerNumber: 2 });
                        gameStore.setAppScreen('game'); // Ensure we switch to game view
                        // If room was already waiting, we might need to wait for game_start
                        break;
                    case "game_start":
                        gameStore.setAppScreen('game');
                        gameStore.resetGame();
                        set({ playerNumber: payload.player_number });
                        console.log("Game started! You are player:", payload.player_number);
                        break;
                    case "move_result":
                        // The server confirms the move was valid and gives us the row/col
                        // payload: { column, row, player_number, next_player, valid }
                        // We need to update the board if it wasn't our local move (or even if it was, to be safe)

                        // NOTE: For local moves, we might have already updated vaguely, 
                        // but `triggerRemoteMove` can be used to ensure specific animations happen
                        // if we want to rely purely on server state.

                        // Ideally, we check if it's OUR move or THEIR move.
                        const myPlayerNum = get().playerNumber;
                        if (payload.player_number !== myPlayerNum) {
                            gameStore.triggerRemoteMove(payload.column, payload.row, payload.player_number as 1 | 2);
                        } else {
                            // It was our move. The store might have already optimistically updated? 
                            // Or rather, we should call completeDrop from here if we want to be authority-based.
                            // Currently `completeDrop` does logic + checkWin. 
                            // Since server checks win, we just need to place the piece.
                            // But `triggerRemoteMove` does logic again?
                            // Let's rely on `triggerRemoteMove` for consistency for now, 
                            // even for self if we removed optimistic updates.
                            gameStore.triggerRemoteMove(payload.column, payload.row, payload.player_number as 1 | 2);
                        }
                        break;
                    case "game_over":
                        // payload: { winner, winning_cells, is_draw }
                        gameStore.setGameOver(
                            payload.winner as 1 | 2 | 0,
                            payload.winning_cells || [],
                            payload.is_draw
                        );
                        break;
                    case "error":
                        set({ error: payload.message });
                        console.error("Server error:", payload.message);
                        break;
                    case "rematch_waiting":
                        // payload: { message: string, is_initiator: boolean }
                        if (payload.is_initiator) {
                            gameStore.setRematchStatus("waiting_for_opponent");
                        } else {
                            gameStore.setRematchStatus("opponent_requested");
                        }
                        break;
                    case "rematch_accepted":
                        // Both players agreed, reset the game
                        gameStore.resetGame();
                        gameStore.setRematchStatus(null);
                        break;
                    case "opponent_left":
                        set({ error: "Opponent left the game." });
                        gameStore.setAppScreen('start'); // Or show some modal
                        break;
                    case "ping":
                        socket.send(JSON.stringify({ type: "pong" }));
                        break;
                }
            } catch (e) {
                console.error("Failed to parse websocket message", e);
            }
        };

        socket.onclose = () => {
            set({ isConnected: false, socket: null, roomCode: null, playerNumber: null });
        };
    },

    createRoom: () => {
        const { socket } = get();
        if (socket && socket.readyState === WebSocket.OPEN) {
            set({ isBotGame: false });
            socket.send(JSON.stringify({ type: "create_room" }));
        }
    },

    createBotGame: () => {
        const { socket } = get();
        if (socket && socket.readyState === WebSocket.OPEN) {
            set({ isBotGame: true });
            socket.send(JSON.stringify({ type: "create_bot_game" }));
        }
    },

    joinRoom: (roomCode: string) => {
        const { socket } = get();
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "join_room", room_code: roomCode }));
        }
    },

    sendMove: (column: number) => {
        const { socket } = get();
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "move", column: column }));
        }
    },

    requestRematch: () => {
        const { socket } = get();
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "rematch_request" }));
        }
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.close();
            set({ socket: null, isConnected: false, roomCode: null, playerNumber: null, isBotGame: false });
        }
    },
}));