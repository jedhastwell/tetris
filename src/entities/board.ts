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

  constructor(scene: Phaser.Scene, x: number, y: number, cols: number, rows: number) {
    super(scene, x, y)

    const background = this.scene.add
      .tileSprite(-2, -2, cols * CELL_SIZE, rows * CELL_SIZE, 'atlas', 'block-background')
      .setOrigin(0, 0)
    this.add(background)

    this.matrix = this.scene.add.group(<any>{
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
      x: CELL_SIZE / 2,
      y: CELL_SIZE / 2,
    })

    this.ghost = this.scene.add.group(<any>{
      key: 'atlas',
      frame: 'block-ghost',
      repeat: 3,
      visible: false,
      setOrigin: { x: 0, y: 0 },
    })
    this.add(this.ghost.getChildren())

    this.tetromino = this.scene.add.group(<any>{
      key: 'atlas',
      frame: 'block-O',
      repeat: 3,
      visible: false,
      setOrigin: { x: 0, y: 0 },
    })
    this.add(this.tetromino.getChildren())
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
    Board.updateGroup(this.ghost, ghost.getPositions())
  }

  updateTetromino(tetromino: Tetromino, timeToLock?: number): void {
    Board.updateGroup(this.tetromino, tetromino.getPositions(), getBlockImage(tetromino.shapeId))

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

  static updateGroup(group: Group, positions: Point[], frame?: string): void {
    positions.forEach((p, i) => {
      const block = <Image>group.getChildren()[i]
      if (frame) {
        block.setFrame(frame)
      }
      block.setVisible(p.y >= 0)
      block.setPosition(p.x * CELL_SIZE, p.y * CELL_SIZE)
    })
  }
}

export default Board
