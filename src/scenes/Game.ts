import Phaser from 'phaser'
import MatrixDisplay from '../entities/matrixDisplay'
import Tetromino from '../gameplay/tetromino'
import Playfield from '../gameplay/playfield'

class Game extends Phaser.Scene {
  private debugMatrix: MatrixDisplay
  private playfield: Playfield

  constructor() {
    super({ key: 'GameScene' })
  }

  preload(): void {}

  create(): void {
    this.debugMatrix = new MatrixDisplay(this, 10, 10, 20, 20, 1)
    this.add.existing(this.debugMatrix)

    this.playfield = new Playfield({
      cols: 10,
      rows: 28,
      firstVisibleRow: 8,
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

  update(time: number, delta: number): void {
    this.playfield.update(delta)
    const output = this.playfield.getMatrix(true)
    output.splice(0, 8)
    this.debugMatrix.draw(output)
  }
}

export default Game
