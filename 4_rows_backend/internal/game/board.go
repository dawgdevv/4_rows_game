package game

const (
	Rows = 6
	Cols = 7
)

type Board struct {
	Grid [Rows][Cols]int
}

type CellPos struct {
	Row int
	Col int
}

func (b *Board) Drop(column int, player int) (int, bool) {
	if column < 0 || column >= Cols {
		return -1, false
	}

	for r := Rows - 1; r >= 0; r-- {
		if b.Grid[r][column] == 0 {
			b.Grid[r][column] = player
			return r, true
		}
	}
	return -1, false
}

func (b *Board) CheckWin(row, col, player int) (bool, []CellPos) {
	dirs := [][2]int{{0, 1}, {1, 0}, {1, 1}, {1, -1}}

	for _, d := range dirs {
		cells := []CellPos{{row, col}}

		for i := 1; i < 4; i++ {
			r, c := row+d[0]*i, col+d[1]*i
			if r < 0 || r >= Rows || c < 0 || c >= Cols || b.Grid[r][c] != player {
				break
			}
			cells = append(cells, CellPos{r, c})
		}

		for i := 1; i < 4; i++ {
			r, c := row-d[0]*i, col-d[1]*i
			if r < 0 || r >= Rows || c < 0 || c >= Cols || b.Grid[r][c] != player {
				break
			}
			cells = append(cells, CellPos{r, c})
		}

		if len(cells) >= 4 {
			return true, cells
		}
	}
	return false, nil
}

func (b *Board) IsDraw() bool {
	for c := 0; c < Cols; c++ {
		if b.Grid[0][c] == 0 {
			return false
		}
	}
	return true
}
