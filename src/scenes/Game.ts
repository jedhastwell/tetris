import Phaser from 'phaser'
import MatrixDisplay from '../entities/matrixDisplay'
import Tetromino from '../gameplay/tetromino'
import { ShapeId } from '../types'

class Game extends Phaser.Scene {
  private debugMatrix: MatrixDisplay

  constructor() {
    super({ key: 'GameScene' })
  }

  preload(): void {}

  create(): void {
    this.debugMatrix = new MatrixDisplay(this, 10, 10, 40, 40, 1)
    this.add.existing(this.debugMatrix)

    let shape = ShapeId.I
    this.debugMatrix.draw(Tetromino.getMatrix(shape, 0))
    this.input.on('pointerdown', () => {
      shape = (shape % ShapeId.T) + 1
      this.debugMatrix.draw(Tetromino.getMatrix(shape, 0))
    })
  }

  update(time: number, delta: number): void {}
}

export default Game
