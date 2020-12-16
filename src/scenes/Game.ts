import Phaser from 'phaser'
import MatrixDisplay from '../entities/matrixDisplay'
import { Matrix } from '../gameplay/matrix'
import Tetromino from '../gameplay/tetromino'
import Playfield from '../gameplay/playfield'
import { PlayfieldCommand, TSpin } from '../types'
import Score from '../gameplay/score'
import { Settings, Controls } from '../settings'
import Repeater from '../gameplay/repeater'

const PREVIEW_COUNT = 3

class Game extends Phaser.Scene {
  private debugMatrix: MatrixDisplay
  private debugQueue: MatrixDisplay
  private debugHold: MatrixDisplay
  private playfield: Playfield
  private score: Score

  constructor() {
    super({ key: 'GameScene' })
  }

  preload(): void {}

  create(): void {
    this.debugMatrix = new MatrixDisplay(this, 10, 10, 20, 20, 1)
    this.debugQueue = new MatrixDisplay(this, 220, 10, 15, 15, 1)
    this.debugHold = new MatrixDisplay(this, 220, 155, 15, 15, 1)
    this.add.existing(this.debugMatrix)
    this.add.existing(this.debugQueue)
    this.add.existing(this.debugHold)

    this.playfield = new Playfield({
      cols: 10,
      rows: 28,
      firstVisibleRow: 8,
      queueSize: PREVIEW_COUNT,
    })

    this.score = new Score()
    this.score.bindPlayfieldEvents(this.playfield)

    this.score.on(Score.Events.POINTS_CHANGED, (points: number) => console.log('Points: ', points))
    this.score.on(Score.Events.LINES_CHANGED, (lines: number) => console.log('Lines: ', lines))
    this.score.on(Score.Events.LEVEL_CHANGED, (level: number) => console.log('Level: ', level))

    this.assignControls()

    this.playfield.on(Playfield.Events.QUEUE_UPDATED, this.updatePreview, this)
    this.playfield.on(Playfield.Events.HOLD_UPDATED, this.updateHold, this)
    this.playfield.on(Playfield.Events.MATRIX_UPDATED, this.updateMatrix, this)
    this.playfield.on(Playfield.Events.TETROMINO_UPDATED, this.updateMatrix, this)
    this.playfield.on(
      Playfield.Events.TSPIN,
      (playfield: Playfield, tSpin: TSpin, linesCleared: number) => {
        console.log('Performed T-Splin', tSpin, linesCleared)
      },
    )
  }

  handlePlayfieldInput(command: PlayfieldCommand): void {
    this.playfield[command]()
  }

  assignControls(): void {
    Object.keys(Controls.Keys).forEach((command: PlayfieldCommand) => {
      Controls.Keys[command].forEach((keyName) => {
        const key = this.input.keyboard.addKey(keyName, true)

        if (['moveLeft', 'moveRight', 'softDrop'].includes(command)) {
          const repeater = new Repeater(this, {
            callback: () => this.handlePlayfieldInput(command),
            repeatDelay: Settings.REPEAT_DELAY,
            repeatSpeed: Settings.REPEAT_SPEED,
          })

          key.on('down', repeater.start, repeater)
          key.on('up', repeater.stop, repeater)
        } else {
          key.on('down', () => this.handlePlayfieldInput(command), this)
        }
      })
    })
  }

  updateHold(playfield: Playfield): void {
    const matrix = playfield.held ? Tetromino.getMatrix(playfield.held) : Matrix.create(3, 3)
    this.debugHold.draw(matrix)
  }

  updatePreview(playfield: Playfield): void {
    const matrix = Matrix.create(4, 3 * PREVIEW_COUNT)
    playfield.queue.forEach((shapeId, index) => {
      const points = Tetromino.getPositions(shapeId)
      Matrix.setValues(matrix, points, shapeId, 0, index * 3)
    })
    this.debugQueue.draw(matrix)
  }

  updateMatrix(playfield: Playfield): void {
    const output = playfield.getMatrix(true)

    playfield
      .getGhost()
      .getPositions()
      .forEach((p) => {
        if (output[p.y][p.x] === 0) {
          output[p.y][p.x] = -1
        }
      })

    output.splice(0, 8)
    this.debugMatrix.draw(output)
  }

  update(time: number, delta: number): void {
    this.playfield.update(delta)
  }
}

export default Game
