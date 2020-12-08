import { ShapeId, Point } from '../types'
import { Matrix } from './matrix'

class Tetromino {
  constructor(public shapeId: ShapeId, public rotation = 0, public x = 0, public y = 0) {}

  static randomShapeId(): ShapeId {
    return <ShapeId>(Math.floor(Math.random() * 7) + 1)
  }

  static getMatrix(shapeId: ShapeId, rotation = 0): Matrix {
    const matrix = Shapes[shapeId].map((r) => r.map((v) => (!!v ? shapeId : 0)))
    return Matrix.rotate(matrix, rotation)
  }

  static getPositions(shapeId: ShapeId, rotation = 0, x = 0, y = 0): Point[] {
    const points: Point[] = []

    Tetromino.getMatrix(shapeId, rotation).forEach((row, r) => {
      row.forEach((value, c) => {
        !!value && points.push({ x: x + c, y: y + r })
      })
    })
    return points
  }

  alignCenterTopTo(x: number, y: number): void {
    const matrix = Shapes[this.shapeId]
    this.x = x - Math.ceil(matrix[0].length / 2)
    this.y = y - Matrix.getLeadingEmptyRowCount(matrix)
  }

  rotate(rotation: number): void {
    this.rotation += rotation
  }

  move(movement: Point): void {
    this.x += movement.x
    this.y += movement.y
  }

  getMatrix(): number[][] {
    return Tetromino.getMatrix(this.shapeId, this.rotation)
  }

  peekMatrix(rotation = 0): number[][] {
    return Tetromino.getMatrix(this.shapeId, this.rotation + rotation)
  }

  getPositions(): Point[] {
    return Tetromino.getPositions(this.shapeId, this.rotation, this.x, this.y)
  }

  peekPositions(rotation = 0, movementX = 0, movementY = 0): Point[] {
    return Tetromino.getPositions(
      this.shapeId,
      this.rotation + rotation,
      this.x + movementX,
      this.y + movementY,
    )
  }

  static Moves = {
    RIGHT: { x: 1, y: 0 },
    LEFT: { x: -1, y: 0 },
    DOWN: { x: 0, y: 1 },
  }

  static Rotations = {
    RIGHT: -90,
    LEFT: 90,
  }
}

const Shapes = {
  [ShapeId.I]: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [ShapeId.J]: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [ShapeId.L]: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  [ShapeId.O]: [
    [1, 1],
    [1, 1],
  ],
  [ShapeId.S]: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  [ShapeId.Z]: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  [ShapeId.T]: [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
}

export default Tetromino
