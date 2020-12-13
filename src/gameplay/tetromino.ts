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

  static getKickSeries(shapeId: ShapeId, fromRotation: number, toRotation: number): Point[] {
    // Rotation logic follows the Super Rotation System: https://tetris.wiki/Super_Rotation_System
    // This function returns a series of offset points that need to be tested and applied when
    // rotating from one state to another.
    const seriesA = OffsetData[shapeId][Tetromino.getOrientation(fromRotation)]
    const seriesB = OffsetData[shapeId][Tetromino.getOrientation(toRotation)]

    const kickSeries: Point[] = []

    for (let i = 0; i < seriesA.length; i += 2) {
      kickSeries.push({
        x: seriesA[i] - seriesB[i],
        y: seriesA[i + 1] - seriesB[i + 1],
      })
    }

    return kickSeries
  }

  moveToSpawnPostion(x: number, y: number): void {
    this.x = x - Math.ceil(Shapes[this.shapeId][0].length / 2)
    this.y = y - 1
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

  getKickSeries(rotation: number): Point[] {
    return Tetromino.getKickSeries(this.shapeId, this.rotation, this.rotation + rotation)
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

const CommonOffsetData = {
  [Orientation.UP]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [Orientation.LEFT]: [0, 0, -1, 0, -1, 1, 0, -2, -1, -2],
  [Orientation.DOWN]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [Orientation.RIGHT]: [0, 0, 1, 0, 1, 1, 0, -2, 1, -2],
}

const OffsetData = {
  [ShapeId.I]: {
    [Orientation.UP]: [0, 0, -1, 0, 2, 0, -1, 0, 2, 0],
    [Orientation.LEFT]: [0, -1, 0, -1, 0, -1, 0, 1, 0, -2],
    [Orientation.DOWN]: [-1, -1, 1, -1, -2, -1, 1, 0, -2, 0],
    [Orientation.RIGHT]: [-1, 0, 0, 0, 0, 0, 0, -1, 0, 2],
  },
  [ShapeId.O]: {
    [Orientation.UP]: [0, 0],
    [Orientation.LEFT]: [-1, 0],
    [Orientation.DOWN]: [-1, 1],
    [Orientation.RIGHT]: [0, 1],
  },
  [ShapeId.J]: CommonOffsetData,
  [ShapeId.L]: CommonOffsetData,
  [ShapeId.S]: CommonOffsetData,
  [ShapeId.Z]: CommonOffsetData,
  [ShapeId.T]: CommonOffsetData,
}

export default Tetromino
