import { ShapeId, ShapeProvider, Point } from '../types'
import { Matrix } from './matrix'
import Tetromino from './tetromino'
import Randomizer from './randomizer'

interface PlayfieldConfig {
  cols: number
  rows: number
  firstVisibleRow: number
  queueSize?: number
  dropFrequency?: number
  shapeProvider?: ShapeProvider
}

const Defaults = {
  QUEUE_SIZE: 1,
  DROP_FREQUENCY: 800,
}

class Playfield {
  readonly cols: number
  readonly rows: number
  readonly firstVisibleRow: number
  readonly queue: ShapeId[]
  readonly shapeProvider: ShapeProvider

  public tetromino: Tetromino
  public held: ShapeId | null
  public canHold: boolean
  public dropFrequency: number
  public toppedOut: boolean

  private matrix: Matrix
  private nextStep: number

  constructor({
    cols,
    rows,
    firstVisibleRow,
    dropFrequency = Defaults.DROP_FREQUENCY,
    queueSize = Defaults.QUEUE_SIZE,
    shapeProvider = new Randomizer(),
  }: PlayfieldConfig) {
    this.cols = cols
    this.rows = rows
    this.firstVisibleRow = firstVisibleRow

    this.matrix = Matrix.create(cols, rows)
    this.queue = []
    this.held = null
    this.shapeProvider = shapeProvider
    this.canHold = true

    this.toppedOut = false
    this.nextStep = this.dropFrequency = dropFrequency
    this.seedQueue(queueSize)
    this.spawn()
  }

  seedQueue(size: number): void {
    this.queue.push(...Array.from({ length: size }, () => this.shapeProvider.next()))
  }

  spawnFromQueue(): void {
    this.queue.push(this.shapeProvider.next())
    this.spawn(this.queue.splice(0, 1)[0])
  }

  spawn(shapeId?: ShapeId): void {
    this.tetromino = new Tetromino(shapeId || this.shapeProvider.next())
    this.tetromino.moveToSpawnPostion(Math.floor(this.cols / 2), this.firstVisibleRow - 1)

    // Game over occurs if the new tetromino is obstructed when spawned
    if (this.obstructed(this.tetromino.getPositions())) {
      this.topOut()
    } else {
      // New tetrominoes spawn above the play field then immediately drop below if possible
      this.spawnDrop()
      this.resetNextStep()

      this.canHold = true
    }
  }

  spawnDrop(): void {
    let points = this.tetromino.getPositions()
    while (points.some((p) => p.y < this.firstVisibleRow) && this.tryMove(Tetromino.Moves.DOWN)) {
      points = this.tetromino.getPositions()
    }
  }

  hold(): void {
    if (this.canHold) {
      const newHold = this.tetromino.shapeId
      if (this.held) {
        this.spawn(this.held)
      } else {
        this.spawnFromQueue()
      }
      this.held = newHold
      this.canHold = false
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
      this.spawnFromQueue()
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

  getGhost(): Tetromino {
    const ghost = new Tetromino(
      this.tetromino.shapeId,
      this.tetromino.rotation,
      this.tetromino.x,
      this.tetromino.y,
    )

    while (!this.obstructed(ghost.peekPositions(0, 0, 1))) {
      ghost.move(Tetromino.Moves.DOWN)
    }
    return ghost
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
