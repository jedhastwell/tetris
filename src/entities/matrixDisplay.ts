import Phaser from 'phaser'
import { ShapeId } from '../types'
import { Matrix } from '../gameplay/matrix'

const Colors = {
  grid: 0x4c4b4c,
  background: 0x262626,
  [ShapeId.I]: 0x2cade2,
  [ShapeId.J]: 0x005a9d,
  [ShapeId.L]: 0xf89622,
  [ShapeId.O]: 0xfde102,
  [ShapeId.S]: 0xee2733,
  [ShapeId.Z]: 0x4eb748,
  [ShapeId.T]: 0x922b8c,
}

class MatrixDisplay extends Phaser.GameObjects.Graphics {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    public cellWidth: number,
    public cellHeight: number,
    public gridStroke: number,
  ) {
    super(scene, { x, y })
  }

  draw(matrix: Matrix): void {
    this.clear()
    this.lineStyle(this.gridStroke, Colors.grid)
    this.fillStyle(Colors.background)
    this.fillRect(0, 0, matrix[0].length * this.cellWidth, matrix.length * this.cellHeight)
    this.strokeRect(0, 0, matrix[0].length * this.cellWidth, matrix.length * this.cellHeight)
    matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value === 0) {
          this.strokeRect(c * this.cellWidth, r * this.cellHeight, this.cellWidth, this.cellHeight)
        } else {
          this.fillStyle(Colors[value])
          this.fillRect(c * this.cellWidth, r * this.cellHeight, this.cellWidth, this.cellHeight)
        }
      })
    })
  }
}

export default MatrixDisplay
