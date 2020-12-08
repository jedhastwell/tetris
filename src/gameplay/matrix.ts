import { Utils } from 'phaser'
import { ShapeId } from '../types'

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

  getLeadingEmptyRowCount(matrix: Matrix): number {
    return Math.max(
      0,
      matrix.findIndex((row) => row.some((v) => v !== 0)),
    )
  },
}
