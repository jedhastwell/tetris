import { ShapeId, Point } from '../types'
import { Matrix } from './matrix'
import Tetromino from './tetromino'

interface PlayfieldConfig {
  cols: number
  rows: number
  firstVisibleRow: number
  dropFrequency?: number
}

const Defaults = {
  DROP_FREQUENCY: 800,
}

class Playfield {
  readonly cols: number
  readonly rows: number
  readonly firstVisibleRow: number

  public tetromino: Tetromino
  public dropFrequency: number
  public toppedOut: boolean

  private matrix: Matrix
  private nextStep: number

  constructor({
    cols,
    rows,
    firstVisibleRow,
    dropFrequency = Defaults.DROP_FREQUENCY,
  }: PlayfieldConfig) {
    this.cols = cols
    this.rows = rows
    this.firstVisibleRow = firstVisibleRow
    this.matrix = Matrix.create(cols, rows)

    this.toppedOut = false
    this.nextStep = this.dropFrequency = dropFrequency
    this.spawn()
  }

  spawn(shapeId?: ShapeId): void {
    this.tetromino = new Tetromino(shapeId || Tetromino.randomShapeId())
    this.tetromino.moveToSpawnPostion(Math.floor(this.cols / 2), this.firstVisibleRow - 1)

    // Game over occurs if the new tetromino is obstructed when spawned
    if (this.obstructed(this.tetromino.getPositions())) {
      this.topOut()
    } else {
      // New tetrominoes spawn above the play field then immediately drop below if possible
      this.spawnDrop()
      this.resetNextStep()
    }
  }

  spawnDrop(): void {
    let points = this.tetromino.getPositions()
    while (points.some((p) => p.y < this.firstVisibleRow) && this.tryMove(Tetromino.Moves.DOWN)) {
      points = this.tetromino.getPositions()
    }
  }

  lock(): void {
    const points = this.tetromino.getPositions()
    // Game over occurs if the tetromino locks above the spawn line.
    if (points.every((p) => p.y < this.firstVisibleRow)) {
      this.topOut()
    } else {
      Matrix.setValues(this.matrix, points, this.tetromino.shapeId)
      this.clearLines()
      this.spawn()
    }
  }

  clearLines(): void {
    const clearedLines: number[] = []
    // Collect the indices of full rows.
    this.matrix.forEach((row, r) => {
      if (row.every((value) => value !== 0)) {
        clearedLines.push(r)
      }
    })

    // Clear the full rows.
    if (clearedLines.length) {
      clearedLines.forEach((r) => {
        this.matrix.splice(r, 1)
        this.matrix.unshift(Array(this.cols).fill(0))
      })
    }
  }

  obstructed(points: Point[]): boolean {
    return points.some(
      (point) =>
        point.x < 0 ||
        point.x >= this.cols ||
        point.y < 0 ||
        point.y >= this.rows ||
        this.matrix[point.y][point.x] !== 0,
    )
  }

  getMatrix(includeTetromino?: boolean): Matrix {
    const matrix = Matrix.clone(this.matrix)
    if (includeTetromino) {
      Matrix.setValues(matrix, this.tetromino.getPositions(), this.tetromino.shapeId)
    }
    return matrix
  }

  tryRotate(rotation: number): boolean {
    const obstructed = this.obstructed(this.tetromino.peekPositions(rotation))
    if (!obstructed) {
      this.tetromino.rotate(rotation)
    }
    return obstructed
  }

  rotateLeft(): boolean {
    return this.tryRotate(Tetromino.Rotations.LEFT)
  }

  rotateRight(): boolean {
    return this.tryRotate(Tetromino.Rotations.RIGHT)
  }

  canMove(movement: Point): boolean {
    const points = this.tetromino.peekPositions(0, movement.x, movement.y)
    return !this.obstructed(points)
  }

  tryMove(movement: Point): boolean {
    const canMove = this.canMove(movement)
    if (canMove) {
      this.tetromino.move(movement)
    }
    return canMove
  }

  softDrop(): void {
    this.tryMove(Tetromino.Moves.DOWN)
  }

  hardDrop(): void {
    while (this.tryMove(Tetromino.Moves.DOWN)) {}
    this.lock()
  }

  topOut(): void {
    this.toppedOut = true
  }

  resetNextStep(): void {
    this.nextStep = this.dropFrequency
  }

  step(): void {
    if (!this.tryMove(Tetromino.Moves.DOWN)) {
      this.lock()
    }
  }

  update(elapsed: number): void {
    if (!this.toppedOut) {
      this.nextStep -= elapsed

      if (this.nextStep <= 0) {
        this.nextStep += this.dropFrequency
        this.step()
      }
    }
  }
}

export default Playfield
