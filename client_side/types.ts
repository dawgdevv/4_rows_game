export type Player = 1 | 2;

export type CellState = Player | null;

export type BoardState = CellState[][];

export interface WinResult {
  winner: Player;
  winningCells: { row: number; col: number }[];
}

export type GameStatus = 'playing' | 'won' | 'draw';
export type AppScreen = 'start' | 'mode_selection' | 'room_selection' | 'game';
export type GameMode = 'pvp' | 'cpu';

export interface ActiveDrop {
  col: number;
  row: number;
  player: Player;
}

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  gameStatus: GameStatus;
  winner: Player | null;
  winningCells: { row: number; col: number }[];
  activeDrop: ActiveDrop | null;
  
  // App Flow State
  appScreen: AppScreen;
  gameMode: GameMode;
  isSoundEnabled: boolean;
  rematchStatus: "requested" | "waiting" | null;

  // Actions
  startDrop: (colIndex: number) => void;
  completeDrop: () => void;
  resetGame: () => void;
  setAppScreen: (screen: AppScreen) => void;
  setGameMode: (mode: GameMode) => void;
  setRematchStatus: (status: "requested" | "waiting" | null) => void;
  toggleSound: () => void;
  quitGame: () => void;
  
  hoverColumn: number | null;
  setHoverColumn: (colIndex: number | null) => void;

  // Remote Actions
  triggerRemoteMove: (colIndex: number, row: number, player: Player) => void;
  completeRemoteDrop: () => void;
  setGameOver: (winner: Player | 0, winningCells?: { row: number; col: number }[], isDraw?: boolean) => void;
}

export const ROWS = 6;
export const COLS = 7;
export const EMPTY_BOARD: BoardState = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
