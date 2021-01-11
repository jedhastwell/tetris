import { Matrix } from '../src/gameplay/matrix'
import { ShapeId } from '../src/types'

test('create produces expected output', () => {
  const matrix = Matrix.create(4, 4)
  expect(matrix).toEqual([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ])
})

test('clear fills matrix in place with passed value', () => {
  const matrix = Matrix.create(4, 4)
  Matrix.clear(matrix, ShapeId.J)
  expect(matrix).toEqual([
    [2, 2, 2, 2],
    [2, 2, 2, 2],
    [2, 2, 2, 2],
    [2, 2, 2, 2],
  ])
})

test('clone correctly copies matrix content', () => {
  const matrix = Matrix.clone([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ])
  expect(matrix).toEqual([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ])
})

test('clone peforms deep copy of matrix rows', () => {
  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 8],
  ]

  const clone = Matrix.clone(matrix)
  clone[1][1] = 0
  expect(clone).not.toEqual(matrix)
})

test('getLeadingEmptyRowCount returns expected value when matix is empty', () => {
  const count = Matrix.getLeadingEmptyRowCount([[]])
  expect(count).toEqual(0)
})

test('getLeadingEmptyRowCount returns expected value with no empty rows', () => {
  const count = Matrix.getLeadingEmptyRowCount([
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
  ])
  expect(count).toEqual(0)
})

test('getLeadingEmptyRowCount returns expected value with empty bottom rows', () => {
  const count = Matrix.getLeadingEmptyRowCount([
    [0, 0, 1],
    [0, 1, 0],
    [0, 0, 0],
  ])
  expect(count).toEqual(0)
})

test('getLeadingEmptyRowCount returns expected value with empty top rows', () => {
  const count = Matrix.getLeadingEmptyRowCount([
    [0, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
  ])
  expect(count).toEqual(2)
})

test('setValues updates matrix in place', () => {
  const matrix = Matrix.create(4, 4)
  Matrix.setValues(matrix, [{ x: 1, y: 2 }], 1)
  expect(matrix[2][1]).toEqual(1)
})

test('setValues with offset updates expected positions', () => {
  const matrix = Matrix.create(4, 4)
  Matrix.setValues(matrix, [{ x: 1, y: 2 }], 1, 1, -1)
  expect(matrix[1][2]).toEqual(1)
})
