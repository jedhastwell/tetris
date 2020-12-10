import Playfield from '../src/gameplay/playfield'
import { ShapeId } from '../src/types'

test('The I tetromino drops into place after spawning', () => {
  const playfield = new Playfield({
    cols: 10,
    rows: 24,
    firstVisibleRow: 4,
  })
  playfield.spawn(ShapeId.I)

  const matrix = playfield.getMatrix(true)

  expect(matrix[4]).toEqual([0, 0, 0, 1, 1, 1, 1, 0, 0, 0])
})

test('The J tetromino drops into place after spawning', () => {
  const playfield = new Playfield({
    cols: 10,
    rows: 28,
    firstVisibleRow: 8,
  })
  playfield.spawn(ShapeId.J)

  const matrix = playfield.getMatrix(true)

  expect(matrix[8]).toEqual([0, 0, 0, 2, 0, 0, 0, 0, 0, 0])
  expect(matrix[9]).toEqual([0, 0, 0, 2, 2, 2, 0, 0, 0, 0])
})

test('Game over if a tetromino locks above the first visible row', () => {
  const playfield = new Playfield({ cols: 10, rows: 40, firstVisibleRow: 20 })
  playfield.tryMove({ x: 0, y: -6 })
  playfield.lock()
  expect(playfield.toppedOut).toEqual(true)
})

test('Game not over if tetromino locks partially out of view', () => {
  const playfield = new Playfield({ cols: 10, rows: 40, firstVisibleRow: 20 })
  playfield.spawn(ShapeId.O)
  playfield.tryMove({ x: -4, y: -1 })
  const matrix = playfield.getMatrix(true)
  expect(matrix[19]).toEqual([4, 4, 0, 0, 0, 0, 0, 0, 0, 0])
  expect(matrix[20]).toEqual([4, 4, 0, 0, 0, 0, 0, 0, 0, 0])
  playfield.lock()
  expect(playfield.toppedOut).toEqual(false)
})

test('Time to next drop is reset after a spawn', () => {
  const playfield = new Playfield({ cols: 10, rows: 8, firstVisibleRow: 4, dropFrequency: 2000 })
  playfield.update(500)
  expect((<any>playfield).nextStep).toEqual(1500)
  playfield.spawn()
  expect((<any>playfield).nextStep).toEqual(2000)
})
