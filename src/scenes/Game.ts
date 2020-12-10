import Phaser from 'phaser'
import MatrixDisplay from '../entities/matrixDisplay'
import { Matrix } from '../gameplay/matrix'
import Tetromino from '../gameplay/tetromino'
import Playfield from '../gameplay/playfield'

const PREVIEW_COUNT = 3

class Game extends Phaser.Scene {
  private debugMatrix: MatrixDisplay
  private debugQueue: MatrixDisplay
  private playfield: Playfield

  constructor() {
    super({ key: 'GameScene' })
  }

  preload(): void {}

  create(): void {
    this.debugMatrix = new MatrixDisplay(this, 10, 10, 20, 20, 1)
    this.debugQueue = new MatrixDisplay(this, 220, 10, 15, 15, 1)
    this.add.existing(this.debugMatrix)
    this.add.existing(this.debugQueue)

    this.playfield = new Playfield({
      cols: 10,
      rows: 28,
      firstVisibleRow: 8,
      queueSize: PREVIEW_COUNT,
    })

    const keys = ['LEFT', 'RIGHT']
    keys.forEach((key) => {
      this.input.keyboard
        .addKey(key, true)
        .on('down', () => this.playfield.tryMove((<any>Tetromino.Moves)[key]))
    })

    this.input.keyboard.addKey('DOWN', true).on('down', this.playfield.softDrop, this.playfield)
    this.input.keyboard.addKey('SPACE', true).on('down', this.playfield.hardDrop, this.playfield)
    this.input.keyboard.addKey('UP', true).on('down', this.playfield.rotateRight, this.playfield)
    this.input.keyboard.addKey('X', true).on('down', this.playfield.rotateRight, this.playfield)
    this.input.keyboard.addKey('Z', true).on('down', this.playfield.rotateLeft, this.playfield)
  }

  updatePreview(): void {
    const matrix = Matrix.create(4, 3 * PREVIEW_COUNT)
    this.playfield.queue.forEach((shapeId, index) => {
      const points = Tetromino.getPositions(shapeId)
      Matrix.setValues(matrix, points, shapeId, 0, index * 3)
    })
    this.debugQueue.draw(matrix)
  }

  update(time: number, delta: number): void {
    this.playfield.update(delta)
    const output = this.playfield.getMatrix(true)
    output.splice(0, 8)
    this.debugMatrix.draw(output)
    this.updatePreview()
  }
}

export default Game
