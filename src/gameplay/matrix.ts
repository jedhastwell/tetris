import { Utils } from 'phaser'
import { ShapeId, Point } from '../types'

export type Matrix = (ShapeId | 0)[][]

export const Matrix = {
  create(cols: number, rows: number): Matrix {
    return Array.from({ length: rows }, () => Array(cols).fill(0))
  },

  clone(matrix: Matrix): Matrix {
    return matrix.map((row) => [...row])
  },

  rotate(matrix: Matrix, rotation: number): Matrix {
    return Utils.Array.Matrix.RotateMatrix(matrix, rotation)
  },

  setValues(matrix: Matrix, points: Point[], value: ShapeId | 0): Matrix {
    points
      .filter((p) => p.y >= 0 && p.y < matrix.length && p.x >= 0 && p.x <= matrix[0].length)
      .forEach((p) => (matrix[p.y][p.x] = value))
    return matrix
  },

  getLeadingEmptyRowCount(matrix: Matrix): number {
    return Math.max(
      0,
      matrix.findIndex((row) => row.some((v) => v !== 0)),
    )
  },
}
