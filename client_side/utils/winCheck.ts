import { BoardState, Player, WinResult, ROWS, COLS } from '../types';

export const checkWin = (board: BoardState, player: Player): WinResult | null => {
  // Directions: Horizontal, Vertical, Diagonal /, Diagonal \
  const directions = [
    { r: 0, c: 1 },  // Horizontal
    { r: 1, c: 0 },  // Vertical
    { r: 1, c: 1 },  // Diagonal /
    { r: 1, c: -1 }  // Diagonal \
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;

      for (const { r: dr, c: dc } of directions) {
        const cells = [{ row: r, col: c }];
        let match = true;

        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;

          if (
            nr < 0 || nr >= ROWS ||
            nc < 0 || nc >= COLS ||
            board[nr][nc] !== player
          ) {
            match = false;
            break;
          }
          cells.push({ row: nr, col: nc });
        }

        if (match) {
          return { winner: player, winningCells: cells };
        }
      }
    }
  }

  return null;
};

export const checkDraw = (board: BoardState): boolean => {
  return board[0].every(cell => cell !== null);
};
