import { Matrix } from './matrix'
import Tetromino from './tetromino'
import { Point, ShapeId, TSpin, Orientation } from '../types'

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

export const getRotation = (
  rotation: number,
  tetromino: Tetromino,
  matrix: Matrix,
): [number, Point] => {
  const kickSeries = getKickSeries(
    tetromino.shapeId,
    tetromino.rotation,
    tetromino.rotation + rotation,
  )

  const offset = kickSeries.find(
    (p) => !Matrix.obstructed(matrix, tetromino.peekPositions(rotation, p.x, p.y)),
  )

  return !!offset ? [rotation, offset] : [0, { x: 0, y: 0 }]
}

export const getKickSeries = (
  shapeId: ShapeId,
  fromRotation: number,
  toRotation: number,
): Point[] => {
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

export const getTSpin = (tetromino: Tetromino, matrix: Matrix, kickOffset: Point): TSpin => {
  // A T-spin occurs when rotating a T Tetromino to a position such that 3 of its corner blocks are
  // occupied. The logic as per the Tetris Guidelines can be found here: https://tetris.wiki/T-Spin
  const { shapeId, rotation, x, y } = tetromino

  if (shapeId === ShapeId.T) {
    const corners = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ]
    const orientation = Tetromino.getOrientation(rotation)

    const tScore = corners.reduce((score, point, i) => {
      return !Matrix.pointObstructed(matrix, point, x, y)
        ? score
        : score + ((i + orientation) % 4 < 2 ? 4 : 3)
    }, 0)

    if (tScore >= 10) {
      if (tScore >= 11 || (Math.abs(kickOffset.y) === 2 && Math.abs(kickOffset.x) === 1)) {
        return TSpin.FULL
      } else {
        return TSpin.MINI
      }
    }
  }
  return TSpin.NONE
}
