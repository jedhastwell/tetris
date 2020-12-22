import { Events } from 'phaser'
import Playfield from './playfield'
import { GameStats, TSpin } from '../types'

class Score extends Events.EventEmitter implements GameStats {
  level: number
  lines: number
  points: number
  combo: boolean

  constructor() {
    super()
    this.reset()
  }

  reset(): void {
    this.level = 1
    this.lines = 0
    this.points = 0
    this.combo = false
    this.emit(Score.Events.POINTS_CHANGED, this.points)
    this.emit(Score.Events.LEVEL_CHANGED, this.level)
    this.emit(Score.Events.LINES_CHANGED, this.lines)
  }

  bindPlayfieldEvents(emitter: Events.EventEmitter): void {
    const { LINES_CLEARED, TSPIN, SOFT_DROP, HARD_DROP } = Playfield.Events

    emitter.on(LINES_CLEARED, (playfield: Playfield, count: number, tSpin: TSpin) => {
      this.clearLines(count, tSpin)
    })
    emitter.on(TSPIN, (playfield: Playfield, tSpin: TSpin, linesCleared: number) => {
      if (linesCleared === 0) {
        this.tSpin(tSpin)
      }
    })
    emitter.on(SOFT_DROP, this.softDrop, this)
    emitter.on(HARD_DROP, this.hardDrop, this)
  }

  setLevel(level: number): void {
    if (this.level !== level) {
      this.level = level
      this.emit(Score.Events.LEVEL_CHANGED, this.level)
    }
  }

  increasePoints(points: number): void {
    this.points += points
    this.emit(Score.Events.POINTS_CHANGED, this.points)
  }

  increaseLines(value: number): void {
    this.lines += value
    this.emit(Score.Events.LINES_CHANGED, this.lines)
    this.setLevel(Math.floor(this.lines / Score.Values.LINES_PER_LEVEL) + 1)
  }

  softDrop(): void {
    this.increasePoints(Score.Values.SOFT_DROP)
  }

  hardDrop(): void {
    this.increasePoints(Score.Values.HARD_DROP)
  }

  tSpin(tSpin: TSpin): void {
    this.increasePoints(Score.Values.TSPIN[tSpin] * this.level)
  }

  clearLines(count: number, tSpin: TSpin): void {
    let basePoints = 0
    if (count === 4) {
      basePoints = Score.Values.TETRIS
    } else if (count === 3) {
      basePoints = Score.Values.TRIPLE[tSpin]
    } else if (count === 2) {
      basePoints = Score.Values.DOUBLE[tSpin]
    } else if (count === 1) {
      basePoints = Score.Values.SINGLE[tSpin]
    }
    this.increasePoints(basePoints * this.level * (this.combo ? Score.Values.BACK_TO_BACK : 1))
    this.combo = count === 4 || tSpin !== TSpin.NONE
    this.increaseLines(count)
  }

  static Events = {
    POINTS_CHANGED: 'POINTS_CHANGED',
    LEVEL_CHANGED: 'LEVEL_CHANGED',
    LINES_CHANGED: 'LINES_CHANGED',
  }

  // Values with arrays refer to points for T-Spins: [No T-spin, T-spin Mini, T-spin Full]
  static Values = {
    SOFT_DROP: 1,
    HARD_DROP: 2,
    SINGLE: [100, 200, 800],
    DOUBLE: [300, 400, 1200],
    TRIPLE: [500, 500, 1600],
    TETRIS: 800,
    TSPIN: [0, 100, 400],
    BACK_TO_BACK: 1.5,
    LINES_PER_LEVEL: 10,
  }
}

export default Score
