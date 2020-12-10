import Randomizer from '../src/gameplay/randomizer'

test('calling next 21 times will produce each shape exactly 3 times', () => {
  const randomizer = new Randomizer()

  const output = Array(7).fill(0)
  for (let i = 0; i < 21; i++) {
    output[randomizer.next() - 1]++
  }

  expect(output).toEqual([3, 3, 3, 3, 3, 3, 3])
})
