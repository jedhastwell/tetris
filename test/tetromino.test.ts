import Tetromino from '../src/gameplay/tetromino'
import { ShapeId } from '../src/types'

test('getMatrix returns expected ouput for I shape', () => {
  const matrix = Tetromino.getMatrix(ShapeId.I)
  expect(matrix).toEqual([
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ])
})

test('getMatrix returns expected ouput for J shape', () => {
  const matrix = Tetromino.getMatrix(ShapeId.J, 0)
  expect(matrix).toEqual([
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ])
})

test('getMatrix returns expected ouput with left rotation', () => {
  const matrix = Tetromino.getMatrix(ShapeId.L, Tetromino.Rotations.LEFT)
  expect(matrix).toEqual([
    [3, 3, 0],
    [0, 3, 0],
    [0, 3, 0],
  ])
})

test('getMatrix returns expected ouput with right rotation', () => {
  const matrix = Tetromino.getMatrix(ShapeId.S, Tetromino.Rotations.RIGHT)
  expect(matrix).toEqual([
    [0, 5, 0],
    [0, 5, 5],
    [0, 0, 5],
  ])
})

test('getMatrix returns expected ouput with 180 rotation', () => {
  const matrix = Tetromino.getMatrix(ShapeId.T, 180)
  expect(matrix).toEqual([
    [0, 7, 0],
    [7, 7, 7],
    [0, 0, 0],
  ])
})

test('randomShapeId returns values within expected range', () => {
  const testValues = Array(7).fill(false)

  for (let i = 0; i < 100; i++) {
    const testShapeId = Tetromino.randomShapeId()
    testValues[testShapeId - 1] = true
    expect(testShapeId).toBeGreaterThanOrEqual(1)
    expect(testShapeId).toBeLessThanOrEqual(7)
  }

  expect(testValues).toEqual(Array(7).fill(true))
})

test('alignCenterTopTo moves I shape to expected location', () => {
  const tetromino = new Tetromino(ShapeId.I)
  tetromino.alignCenterTopTo(5, 0)
  expect(tetromino.x).toEqual(3)
  expect(tetromino.y).toEqual(-1)
})

test('alignCenterTopTo moves L shape to expected location', () => {
  const tetromino = new Tetromino(ShapeId.L)
  tetromino.alignCenterTopTo(5, 5)
  expect(tetromino.x).toEqual(3)
  expect(tetromino.y).toEqual(5)
})

test('alignCenterTopTo moves rotated J shape to expected location', () => {
  const tetromino = new Tetromino(ShapeId.J, 90)
  tetromino.alignCenterTopTo(5, 1)
  expect(tetromino.x).toEqual(3)
  expect(tetromino.y).toEqual(1)
})

test('alignCenterTopTo moves O shape to expected location', () => {
  const tetromino = new Tetromino(ShapeId.O, 0, 10, 10)
  tetromino.alignCenterTopTo(1, 1)
  expect(tetromino.x).toEqual(0)
  expect(tetromino.y).toEqual(1)
})

test('rotate increments current rotation value', () => {
  const tetromino = new Tetromino(ShapeId.S, 90)
  tetromino.rotate(Tetromino.Rotations.LEFT)
  expect(tetromino.rotation).toEqual(180)
})

test('move increments current position', () => {
  const tetromino = new Tetromino(ShapeId.S, 0, 5, 10)
  tetromino.move({ x: 2, y: 2 })
  expect(tetromino.x).toEqual(7)
  expect(tetromino.y).toEqual(12)
})
