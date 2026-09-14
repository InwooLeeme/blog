type Rect = { left: number; top: number; width: number; height: number };

export function cellFromPoint(x: number, y: number, rect: Rect, cols: number, rows: number): number | null {
  if (rect.width <= 0 || rect.height <= 0 || !Number.isFinite(x) || !Number.isFinite(y)) return null;
  const col = Math.floor((x - rect.left) / rect.width * cols);
  const row = Math.floor((y - rect.top) / rect.height * rows);
  return col >= 0 && col < cols && row >= 0 && row < rows ? row * cols + col : null;
}

export function cellsOnLine(from: number, to: number, cols: number): number[] {
  let x = from % cols, y = Math.floor(from / cols);
  const endX = to % cols, endY = Math.floor(to / cols);
  const dx = Math.abs(endX - x), dy = -Math.abs(endY - y);
  const sx = x < endX ? 1 : -1, sy = y < endY ? 1 : -1;
  let error = dx + dy;
  const cells: number[] = [];
  while (true) {
    cells.push(y * cols + x);
    if (x === endX && y === endY) return cells;
    const twice = 2 * error;
    if (twice >= dy) { error += dy; x += sx; }
    if (twice <= dx) { error += dx; y += sy; }
  }
}

export function moveCell(cell: number, key: string, cols: number, rows: number): number {
  const col = cell % cols, row = Math.floor(cell / cols);
  if (key === "ArrowLeft" && col > 0) return cell - 1;
  if (key === "ArrowRight" && col < cols - 1) return cell + 1;
  if (key === "ArrowUp" && row > 0) return cell - cols;
  if (key === "ArrowDown" && row < rows - 1) return cell + cols;
  return cell;
}
