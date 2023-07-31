import Phaser from 'phaser'
import Tetromino from '../gameplay/tetromino'
import { Matrix } from '../gameplay/matrix'
import { Point, ShapeId } from '../types'

type Image = Phaser.GameObjects.Image
type Group = Phaser.GameObjects.Group

const SHAPE_IMAGES = '-IJLOSZT'
const CELL_SIZE = 68

const getBlockImage = (shapeId: ShapeId) => `block-${SHAPE_IMAGES[shapeId]}`

class Board extends Phaser.GameObjects.Container {
  private matrix: Group
  private ghost: Group
  private tetromino: Group
  private rows: number
  private cols: number

  public hideGhost = false
  public hideTetromino = false

  constructor(scene: Phaser.Scene, x: number, y: number, cols: number, rows: number) {
    super(scene, x, y)

    this.rows = rows
    this.cols = cols

    this.matrix = this.scene.add.group({
      key: 'atlas',
      frame: 'block-empty',
      visible: false,
      repeat: cols * rows - 1,
    })
    this.add(this.matrix.getChildren())

    Phaser.Actions.GridAlign(this.matrix.getChildren(), {
      width: cols,
      height: rows,
      cellWidth: CELL_SIZE,
      cellHeight: CELL_SIZE,
      x: 0,
      y: 0,
    })

    this.ghost = this.scene.add.group({
      key: 'atlas',
      frame: 'block-ghost',
      repeat: 3,
      visible: false,
      setOrigin: { x: 0, y: 0 },
    })
    this.add(this.ghost.getChildren())

    this.tetromino = this.scene.add.group({
      key: 'atlas',
      frame: 'block-O',
      repeat: 3,
      visible: false,
      setOrigin: { x: 0, y: 0 },
    })
    this.add(this.tetromino.getChildren())
  }

  animateFill(shape: ShapeId | 0, duration: number, onComplete?: () => void): void {
    this.matrix.children.iterate((block: Image, i) => {
      const delay = (duration / this.rows) * (this.rows - Math.floor(i / this.rows))
      this.scene.time.delayedCall(delay, () => {
        block.setVisible(shape !== 0)
        if (shape !== 0) {
          block.setFrame(getBlockImage(shape))
        }
      })
      return true
    })
    if (!!onComplete) {
      this.scene.time.delayedCall(duration, onComplete)
    }
  }

  updateMatrix(matrix: Matrix): void {
    const blocks = this.matrix.getChildren()
    matrix.forEach((row, r) =>
      row.forEach((value, c) => {
        const block = <Image>blocks[r * row.length + c]
        block.setVisible(value !== 0)
        if (value !== 0) {
          block.setFrame(getBlockImage(value))
        }
      }),
    )
  }

  updateGhost(ghost: Tetromino): void {
    Board.updateGroup(this.ghost, ghost.getPositions(), this.hideGhost)
  }

  updateTetromino(tetromino: Tetromino, timeToLock?: number): void {
    Board.updateGroup(
      this.tetromino,
      tetromino.getPositions(),
      this.hideTetromino,
      getBlockImage(tetromino.shapeId),
    )

    this.scene.tweens.killTweensOf(this.tetromino.getChildren())
    this.tetromino.setAlpha(1)
    if (!!timeToLock) {
      this.scene.tweens.add({
        targets: this.tetromino.getChildren(),
        alpha: 0.1,
        duration: timeToLock / 2,
        ease: Phaser.Math.Easing.Quadratic.Out,
        yoyo: true,
      })
    }
  }

  static updateGroup(group: Group, positions: Point[], hidden = false, frame?: string): void {
    positions.forEach((p, i) => {
      const block = <Image>group.getChildren()[i]
      if (!!frame) {
        block.setFrame(frame)
      }
      block.setVisible(hidden === false && p.y >= 0)
      block.setPosition(p.x * CELL_SIZE, p.y * CELL_SIZE)
    })
  }
}

export default Board
