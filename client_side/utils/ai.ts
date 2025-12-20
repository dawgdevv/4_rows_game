import { BoardState, ROWS, COLS, Player } from '../types';
import { checkWin } from './winCheck';

// Simple heuristic AI
export const getBestMove = (board: BoardState, cpuPlayer: Player): number => {
  const humanPlayer = cpuPlayer === 1 ? 2 : 1;
  const validMoves: number[] = [];

  // 1. Identify valid moves (columns that aren't full)
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === null) {
      validMoves.push(c);
    }
  }

  if (validMoves.length === 0) return -1;

  // Helper to simulate a move
  const simulateMove = (board: BoardState, col: number, player: Player): boolean => {
    // Find row
    let r = ROWS - 1;
    while (r >= 0 && board[r][col] !== null) {
      r--;
    }
    if (r < 0) return false;
    
    // Copy board and place disc
    const newBoard = board.map(row => [...row]);
    newBoard[r][col] = player;
    
    // Check win
    const result = checkWin(newBoard, player);
    return !!result;
  };

  // 2. Check for Winning Move (Priority 1)
  for (const col of validMoves) {
    if (simulateMove(board, col, cpuPlayer)) {
      return col;
    }
  }

  // 3. Check for Blocking Move (Priority 2)
  for (const col of validMoves) {
    if (simulateMove(board, col, humanPlayer)) {
      return col;
    }
  }

  // 4. Center Preference (Priority 3)
  // Columns ranked by strategic value: 3 (center), then 2/4, then 1/5, then 0/6
  const preference = [3, 2, 4, 1, 5, 0, 6];
  for (const col of preference) {
    if (validMoves.includes(col)) {
      return col;
    }
  }

  // Fallback
  return validMoves[Math.floor(Math.random() * validMoves.length)];
};
