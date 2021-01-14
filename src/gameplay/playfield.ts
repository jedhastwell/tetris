import { ShapeId, ShapeProvider, Point, TSpin } from '../types'
import { Events } from 'phaser'
import { Matrix } from './matrix'
import Tetromino from './tetromino'
import Randomizer from './randomizer'
import { getRotation, getTSpin } from './rules'

interface PlayfieldConfig {
  cols: number
  rows: number
  firstVisibleRow: number
  queueSize?: number
  shapeProvider?: ShapeProvider
  lockDelay?: number
  maxLockDelayResets?: number
  linesPerLevel?: number
  levelSpeeds?: { [key: number]: number }
}

const Defaults = {
  QUEUE_SIZE: 1,
  LOCK_DELAY: 600,
  MAX_LOCK_DELAY_RESETS: 10,
  LINES_PER_LEVEL: 10,
  LEVEL_SPEEDS: {
    1: 800,
    2: 720,
    3: 630,
    4: 550,
    5: 470,
    6: 380,
    7: 300,
    8: 220,
    9: 130,
    10: 100,
    11: 80,
    14: 70,
    17: 50,
    20: 30,
    30: 20,
  },
}

class Playfield extends Events.EventEmitter {
  readonly cols: number
  readonly rows: number
  readonly firstVisibleRow: number
  readonly queue: ShapeId[]
  readonly shapeProvider: ShapeProvider
  readonly queueSize: number
  readonly lockDelay: number
  readonly maxLockDelayResets: number
  readonly linesPerLevel: number
  readonly levelSpeeds: { [key: number]: number }
  readonly config: PlayfieldConfig

  public tetromino: Tetromino
  public held: ShapeId | null
  public canHold: boolean
  public level: number
  public toppedOut: boolean
  public nextStep: number
  public nextLevelUp: number

  private matrix: Matrix
  private willLockPrevious: boolean
  private lockDelayResets: number
  private tSpinPerfromed: TSpin

  private emitHoldUpdated = (): boolean => this.emit(Playfield.Events.HOLD_UPDATED, this)
  private emitQueueUpdated = (): boolean => this.emit(Playfield.Events.QUEUE_UPDATED, this)
  private emitMatrixUpdated = (): boolean => this.emit(Playfield.Events.MATRIX_UPDATED, this)
  private emitLevelUpdated = (level: number): boolean =>
    this.emit(Playfield.Events.LEVEL_UPDATED, this, level)
  private emitTetrominoUpdated = (willLock: boolean): boolean =>
    this.emit(Playfield.Events.TETROMINO_UPDATED, this, willLock)
  private emitSoftDrop = (): boolean => this.emit(Playfield.Events.SOFT_DROP, this)
  private emitHardDrop = (): boolean => this.emit(Playfield.Events.HARD_DROP, this)
  private emitLinesClearing = (lines: number[], tSpin: TSpin): boolean =>
    this.emit(Playfield.Events.LINES_CLEARING, this, lines, tSpin)
  private emitLinesCleared = (count: number, tSpin: TSpin): boolean =>
    this.emit(Playfield.Events.LINES_CLEARED, this, count, tSpin)
  private emitTSpin = (tSpin: TSpin, linesCleared: number): boolean =>
    this.emit(Playfield.Events.TSPIN, this, tSpin, linesCleared)
  private emitToppedOut = (): boolean => this.emit(Playfield.Events.TOPPED_OUT, this)

  constructor({
    cols,
    rows,
    firstVisibleRow,
    queueSize = Defaults.QUEUE_SIZE,
    lockDelay = Defaults.LOCK_DELAY,
    maxLockDelayResets = Defaults.MAX_LOCK_DELAY_RESETS,
    linesPerLevel = Defaults.LINES_PER_LEVEL,
    levelSpeeds = Defaults.LEVEL_SPEEDS,
    shapeProvider = new Randomizer(),
  }: PlayfieldConfig) {
    super()
    this.cols = cols
    this.rows = rows
    this.firstVisibleRow = firstVisibleRow
    this.shapeProvider = shapeProvider
    this.queueSize = queueSize
    this.lockDelay = lockDelay
    this.maxLockDelayResets = maxLockDelayResets
    this.linesPerLevel = linesPerLevel
    this.levelSpeeds = levelSpeeds
    this.matrix = Matrix.create(cols, rows)
    this.queue = []

    this.reset()
  }

  reset(level = 1): void {
    this.shapeProvider.reset()
    Matrix.clear(this.matrix)
    this.queue.splice(0, this.queue.length)

    this.held = null
    this.canHold = true
    this.toppedOut = false
    this.level = level
    this.nextStep = this.getDropFrequency()
    this.nextLevelUp = this.linesPerLevel
    this.lockDelayResets = 0
    this.tSpinPerfromed = TSpin.NONE

    this.seedQueue(this.queueSize)
    this.spawn()
    this.emitHoldUpdated()
    this.emitMatrixUpdated()
    this.emitLevelUpdated(level)
  }

  getDropFrequency(level = this.level): number {
    const levels = Object.keys(this.levelSpeeds).map((value) => Number.parseInt(value))
    const key = levels.reduce((previous, current) =>
      current <= level ? Math.max(current, previous) : previous,
    )
    return this.levelSpeeds[key]
  }

  seedQueue(size: number): void {
    // this.queue.push(ShapeId.T, ShapeId.J, ShapeId.L, ShapeId.L, ShapeId.T)
    this.queue.push(...Array.from({ length: size }, () => this.shapeProvider.next()))
    this.emitQueueUpdated()
  }

  spawnFromQueue(): void {
    this.queue.push(this.shapeProvider.next())
    this.spawn(this.queue.splice(0, 1)[0])
    this.emitQueueUpdated()
  }

  spawn(shapeId?: ShapeId): void {
    const newTetromino = new Tetromino(shapeId || this.shapeProvider.next())
    newTetromino.moveToSpawnPostion(Math.floor(this.cols / 2), this.firstVisibleRow - 1)

    // Game over occurs if the new tetromino is obstructed when spawned
    if (this.obstructed(newTetromino.getPositions())) {
      this.topOut()
    } else {
      this.tetromino = newTetromino
      // New tetrominoes spawn above the play field then immediately drop below if possible
      this.spawnDrop()

      this.resetNextStep()
      this.resetLockDelays()

      this.canHold = true
    }
    this.updatedTetromino()
  }

  spawnDrop(): void {
    let points = this.tetromino.getPositions()
    while (points.some((p) => p.y < this.firstVisibleRow) && this.tryMove(Tetromino.Moves.DOWN)) {
      points = this.tetromino.getPositions()
    }
  }

  resetLockDelays(): void {
    this.lockDelayResets = 0
    this.willLockPrevious = false
  }

  updatedTetromino(tSpin?: TSpin): void {
    const willLock = !this.canMove(Tetromino.Moves.DOWN)
    if (willLock && this.lockDelayResets < this.maxLockDelayResets) {
      this.lockDelayResets++
      this.nextStep = this.lockDelay
    } else if (!willLock && this.willLockPrevious) {
      this.nextStep = this.getDropFrequency()
    }
    this.willLockPrevious = willLock
    this.tSpinPerfromed = tSpin || TSpin.NONE
    this.emitTetrominoUpdated(willLock)
  }

  hold(): void {
    if (!this.toppedOut && this.canHold) {
      const newHold = this.tetromino.shapeId
      if (this.held) {
        this.spawn(this.held)
      } else {
        this.spawnFromQueue()
      }
      this.held = newHold
      this.canHold = false
      this.emitHoldUpdated()
    }
  }

  lock(): void {
    const points = this.tetromino.getPositions()
    // Game over occurs if the tetromino locks above the spawn line.
    if (points.every((p) => p.y < this.firstVisibleRow)) {
      this.topOut()
    } else {
      Matrix.setValues(this.matrix, points, this.tetromino.shapeId)
      const fullLines = this.getFullLines()
      if (this.tSpinPerfromed !== TSpin.NONE) {
        this.emitTSpin(this.tSpinPerfromed, fullLines.length)
      }
      this.clearLines(fullLines, this.tSpinPerfromed)
      this.emitMatrixUpdated()
      this.spawnFromQueue()
    }
  }

  getFullLines(): number[] {
    const fullLines: number[] = []
    this.matrix.forEach((row, r) => {
      if (row.every((value) => value !== 0)) {
        fullLines.push(r)
      }
    })
    return fullLines
  }

  clearLines(lines: number[], tSpin: TSpin): void {
    if (lines.length) {
      this.emitLinesClearing([...lines], tSpin)

      if (lines.length) {
        lines.forEach((r) => {
          this.matrix.splice(r, 1)
          this.matrix.unshift(Array(this.cols).fill(0))
        })
      }

      this.emitLinesCleared(lines.length, tSpin)

      this.nextLevelUp -= lines.length
      if (this.nextLevelUp <= 0) {
        this.nextLevelUp += this.linesPerLevel
        this.level++
        this.emitLevelUpdated(this.level)
      }
    }
  }

  obstructed(points: Point[]): boolean {
    return Matrix.obstructed(this.matrix, points)
  }

  getMatrix(includeTetromino?: boolean): Matrix {
    const matrix = Matrix.clone(this.matrix)
    if (includeTetromino) {
      Matrix.setValues(matrix, this.tetromino.getPositions(), this.tetromino.shapeId)
    }
    return matrix
  }

  getTetromino(): Tetromino {
    return this.tetromino.clone()
  }

  getGhost(): Tetromino {
    const ghost = this.tetromino.clone()

    while (!this.obstructed(ghost.peekPositions(0, 0, 1))) {
      ghost.move(Tetromino.Moves.DOWN)
    }
    return ghost
  }

  tryRotate(rotation: number): boolean {
    if (!this.toppedOut) {
      const [rotate, offset] = getRotation(rotation, this.tetromino, this.matrix)

      if (rotate !== 0) {
        this.tetromino.rotate(rotate)
        this.tetromino.move(offset)
        this.updatedTetromino(getTSpin(this.tetromino, this.matrix, offset))
        return true
      }
    }
    return false
  }

  rotateLeft(): boolean {
    return this.tryRotate(Tetromino.Rotations.LEFT)
  }

  rotateRight(): boolean {
    return this.tryRotate(Tetromino.Rotations.RIGHT)
  }

  canMove(movement: Point): boolean {
    return !this.obstructed(this.tetromino.peekPositions(0, movement.x, movement.y))
  }

  tryMove(movement: Point): boolean {
    const canMove = !this.toppedOut && this.canMove(movement)
    if (canMove) {
      this.tetromino.move(movement)
      this.updatedTetromino()
    }
    return canMove
  }

  moveLeft(): boolean {
    return this.tryMove(Tetromino.Moves.LEFT)
  }

  moveRight(): boolean {
    return this.tryMove(Tetromino.Moves.RIGHT)
  }

  softDrop(): void {
    if (this.tryMove(Tetromino.Moves.DOWN)) {
      this.emitSoftDrop()
    }
  }

  hardDrop(): void {
    if (!this.toppedOut) {
      while (this.canMove(Tetromino.Moves.DOWN)) {
        this.tetromino.move(Tetromino.Moves.DOWN)
        this.tSpinPerfromed = TSpin.NONE
        this.emitHardDrop()
      }
      this.lock()
    }
  }

  topOut(): void {
    this.toppedOut = true
    this.emitToppedOut()
  }

  resetNextStep(): void {
    this.nextStep = this.getDropFrequency()
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
        this.nextStep += this.getDropFrequency()
        this.step()
      }
    }
  }

  static readonly Events = {
    QUEUE_UPDATED: 'QUEUE_UPDATED',
    HOLD_UPDATED: 'HOLD_UPDATED',
    MATRIX_UPDATED: 'MATRIX_UPDATED',
    LEVEL_UPDATED: 'LEVELED_UPDATED',
    TETROMINO_UPDATED: 'TETROMINO_UPDATED',
    SOFT_DROP: 'SOFT_DROP',
    HARD_DROP: 'HARD_DROP',
    LINES_CLEARING: 'LINES_CLEARING',
    LINES_CLEARED: 'LINES_CLEARED',
    TSPIN: 'TSPIN',
    TOPPED_OUT: 'TOPPED_OUT',
  }
}

export default Playfield
