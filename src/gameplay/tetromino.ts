import { ShapeId, Point, Orientation } from '../types'
import { Matrix } from './matrix'

class Tetromino {
  constructor(public shapeId: ShapeId, public rotation = 0, public x = 0, public y = 0) {}

  static randomShapeId(): ShapeId {
    return <ShapeId>(Math.floor(Math.random() * 7) + 1)
  }

  static getOrientation(rotation: number): Orientation {
    return (((rotation / 90) % 4) + 4) % 4
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

  clone(): Tetromino {
    return new Tetromino(this.shapeId, this.rotation, this.x, this.y)
  }

  moveToSpawnPostion(x: number, y: number): this {
    this.x = x - Math.ceil(Shapes[this.shapeId][0].length / 2)
    this.y = y - 1
    return this
  }

  rotate(rotation: number): this {
    this.rotation += rotation
    return this
  }

  move(movement: Point): this {
    this.x += movement.x
    this.y += movement.y
    return this
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
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
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
    [0, 1, 1],
    [0, 1, 1],
    [0, 0, 0],
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
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

export default Tetromino
