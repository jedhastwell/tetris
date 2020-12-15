import { Matrix } from '../src/gameplay/matrix'
import Tetromino from '../src/gameplay/tetromino'
import { ShapeId, TSpin } from '../src/types'
import { getTSpin } from '../src/gameplay/rules'

test('Correctly detects a full T-spin at right orientation', () => {
  const matrix: Matrix = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
  ]
  const tetromino = new Tetromino(ShapeId.T, Tetromino.Rotations.RIGHT, 1, 1)
  const result = getTSpin(tetromino, matrix, { x: 0, y: 0 })
  expect(result).toEqual(TSpin.FULL)
})

test('Correctly detects a full T-spin at left orientation', () => {
  const matrix: Matrix = [
    [0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
  ]
  const tetromino = new Tetromino(ShapeId.T, Tetromino.Rotations.LEFT, 1, 1)
  const result = getTSpin(tetromino, matrix, { x: 0, y: 0 })
  expect(result).toEqual(TSpin.FULL)
})

test('Correctly detects a mini T-spin at left orientation', () => {
  const matrix: Matrix = [
    [0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
  ]
  const tetromino = new Tetromino(ShapeId.T, Tetromino.Rotations.RIGHT, 1, 1)
  const result = getTSpin(tetromino, matrix, { x: 0, y: 0 })
  expect(result).toEqual(TSpin.MINI)
})

test('Correctly detects a mini T-spin at left orientation', () => {
  const matrix: Matrix = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
  ]
  const tetromino = new Tetromino(ShapeId.T, Tetromino.Rotations.LEFT, 1, 1)
  const result = getTSpin(tetromino, matrix, { x: 0, y: 0 })
  expect(result).toEqual(TSpin.MINI)
})

test('Correctly detects a mini T-spin at up orientation', () => {
  const matrix: Matrix = [
    [0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
  ]
  const tetromino = new Tetromino(ShapeId.T, 0, 1, 1)
  const result = getTSpin(tetromino, matrix, { x: 0, y: 0 })
  expect(result).toEqual(TSpin.MINI)
})

test('Correctly detects no T-spin ', () => {
  const matrix: Matrix = [
    [0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
  ]
  const tetromino = new Tetromino(ShapeId.T, 0, 1, 1)
  const result = getTSpin(tetromino, matrix, { x: 0, y: 0 })
  expect(result).toEqual(TSpin.NONE)
})

test('Correctly detects mini T-spin against a wall', () => {
  const matrix: Matrix = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1],
    [0, 1, 1, 1, 1],
  ]

  const tetromino = new Tetromino(ShapeId.T, Tetromino.Rotations.RIGHT, -1, 2)

  const result = getTSpin(tetromino, matrix, { x: 0, y: 0 })
  expect(result).toEqual(TSpin.MINI)
})

test('Correctly detects full T-spin when it should be a mini, but was offset by 1 by 2 positions to rotate into place', () => {
  const matrix: Matrix = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 1, 0, 0, 1],
  ]
  const tetromino = new Tetromino(ShapeId.T, Tetromino.Rotations.LEFT, 2, 2)
  const result = getTSpin(tetromino, matrix, { x: 1, y: 2 })
  expect(result).toEqual(TSpin.FULL)
})
