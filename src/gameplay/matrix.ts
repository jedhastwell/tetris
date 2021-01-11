import { Utils } from 'phaser'
import { ShapeId, Point } from '../types'

export type Matrix = (ShapeId | 0)[][]

export const Matrix = {
  create(cols: number, rows: number, value: ShapeId | 0 = 0): Matrix {
    return Array.from({ length: rows }, () => Array(cols).fill(value))
  },

  clear(matrix: Matrix, value: ShapeId | 0 = 0): Matrix {
    matrix.forEach((row) => row.fill(value, 0))
    return matrix
  },

  clone(matrix: Matrix): Matrix {
    return matrix.map((row) => [...row])
  },

  rotate(matrix: Matrix, rotation: number): Matrix {
    return Utils.Array.Matrix.RotateMatrix(matrix, rotation)
  },

  setValues(matrix: Matrix, points: Point[], value: ShapeId | 0, xOffset = 0, yOffset = 0): Matrix {
    points
      .filter(
        (p) =>
          p.y + yOffset >= 0 &&
          p.y + yOffset < matrix.length &&
          p.x + xOffset >= 0 &&
          p.x + xOffset <= matrix[0].length,
      )
      .forEach((p) => (matrix[p.y + yOffset][p.x + xOffset] = value))
    return matrix
  },

  pointObstructed(matrix: Matrix, point: Point, xOffset = 0, yOffset = 0): boolean {
    return (
      point.x + xOffset < 0 ||
      point.x + xOffset >= matrix[0].length ||
      point.y + yOffset < 0 ||
      point.y + yOffset >= matrix.length ||
      matrix[point.y + yOffset][point.x + xOffset] !== 0
    )
  },

  obstructed(matrix: Matrix, points: Point[], xOffset = 0, yOffset = 0): boolean {
    return points.some((p) => Matrix.pointObstructed(matrix, p, xOffset, yOffset))
  },

  getLeadingEmptyRowCount(matrix: Matrix): number {
    return Math.max(
      0,
      matrix.findIndex((row) => row.some((v) => v !== 0)),
    )
  },
}
