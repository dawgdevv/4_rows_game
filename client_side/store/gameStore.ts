import { create } from "zustand";
import {
  GameState,
  AppScreen,
  GameMode,
  BoardState,
  ROWS,
  COLS,
  EMPTY_BOARD,
} from "../types";
import { checkWin, checkDraw } from "../utils/winCheck";

// Lightweight, fetch-free audio helpers using Web Audio API to avoid 403s from remote assets
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
};

const playTone = (
  freq: number,
  duration = 0.18,
  type: OscillatorType = "sine"
) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
};

export const useGameStore = create<GameState>((set, get) => ({
  board: JSON.parse(JSON.stringify(EMPTY_BOARD)),
  currentPlayer: 1,
  gameStatus: "playing",
  winner: null,
  winningCells: [],
  activeDrop: null,
  hoverColumn: null,

  // App State
  appScreen: "start",
  gameMode: "pvp",
  isSoundEnabled: true,

  setAppScreen: (screen: AppScreen) => set({ appScreen: screen }),
  setGameMode: (mode: GameMode) => set({ gameMode: mode }),

  toggleSound: () => {
    const newMuteState = !get().isSoundEnabled;
    set({ isSoundEnabled: newMuteState });
    const ctx = audioCtx;
    if (!ctx) return;
    if (newMuteState) {
      ctx.resume();
    } else {
      ctx.suspend();
    }
  },

  setHoverColumn: (colIndex) => set({ hoverColumn: colIndex }),

  startDrop: (colIndex: number) => {
    const { board, currentPlayer, gameStatus, activeDrop } = get();

    if (gameStatus !== "playing" || activeDrop) return;

    // Find the lowest empty row
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][colIndex] === null) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) return;

    if (get().isSoundEnabled) {
      playTone(720, 0.12, "triangle");
    }

    set({
      activeDrop: {
        col: colIndex,
        row: targetRow,
        player: currentPlayer,
      },
      hoverColumn: null,
    });
  },

  completeDrop: () => {
    const { board, activeDrop, currentPlayer } = get();

    if (!activeDrop) return;

    if (get().isSoundEnabled) {
      playTone(320, 0.16, "sine");
    }

    // Update board
    const newBoard = board.map((row) => [...row]);
    newBoard[activeDrop.row][activeDrop.col] = activeDrop.player;

    // Check results
    const winResult = checkWin(newBoard, activeDrop.player);

    if (winResult) {
      if (get().isSoundEnabled) {
        setTimeout(() => {
          playTone(880, 0.16, "square");
          setTimeout(() => playTone(1040, 0.18, "sawtooth"), 120);
        }, 120);
      }
      set({
        board: newBoard,
        gameStatus: "won",
        winner: activeDrop.player,
        winningCells: winResult.winningCells,
        activeDrop: null,
      });
    } else if (checkDraw(newBoard)) {
      set({
        board: newBoard,
        gameStatus: "draw",
        activeDrop: null,
      });
    } else {
      set({
        board: newBoard,
        currentPlayer: currentPlayer === 1 ? 2 : 1,
        activeDrop: null,
      });
    }
  },

  resetGame: () => {
    set({
      board: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
      currentPlayer: 1,
      gameStatus: "playing",
      winner: null,
      winningCells: [],
      activeDrop: null,
    });
  },

  quitGame: () => {
    set({
      appScreen: "start",
      board: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
      currentPlayer: 1,
      gameStatus: "playing",
      winner: null,
      winningCells: [],
      activeDrop: null,
    });
  },
}));
