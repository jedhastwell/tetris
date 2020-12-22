import Leaderboard from '../src/gameplay/leaderboard'

test('leaderboard returns the expected high score', () => {
  const leaderboard = new Leaderboard(3)
  leaderboard.submit({ points: 1500, level: 0, lines: 0 }, '', 0)
  expect(leaderboard.getHighScore()).toEqual(1500)
  leaderboard.submit({ points: 1100, level: 0, lines: 0 }, '', 0)
  expect(leaderboard.getHighScore()).toEqual(1500)
  leaderboard.submit({ points: 1800, level: 0, lines: 0 }, '', 0)
  expect(leaderboard.getHighScore()).toEqual(1800)
})

test('leaderboard drops entries when full', () => {
  const leaderboard = new Leaderboard(2)
  leaderboard.submit({ points: 1500, level: 0, lines: 0 }, '', 0)
  leaderboard.submit({ points: 1600, level: 0, lines: 0 }, '', 0)
  leaderboard.submit({ points: 1700, level: 0, lines: 0 }, '', 0)
  expect(leaderboard.entries.length).toEqual(2)
  expect(leaderboard.entries[0].points).toEqual(1700)
  expect(leaderboard.entries[1].points).toEqual(1600)
})

test('submit returns true when a score is submitted and false when it is dropped', () => {
  const leaderboard = new Leaderboard(2)
  expect(leaderboard.submit({ points: 1500, level: 0, lines: 0 }, '', 0)).toEqual(true)
  expect(leaderboard.submit({ points: 1600, level: 0, lines: 0 }, '', 0)).toEqual(true)
  expect(leaderboard.submit({ points: 1700, level: 0, lines: 0 }, '', 0)).toEqual(true)
  expect(leaderboard.submit({ points: 1300, level: 0, lines: 0 }, '', 0)).toEqual(false)
})

test('entries with equal points are ordered by lines with new entries with equal lines coming after old ones', () => {
  const leaderboard = new Leaderboard(1)
  expect(leaderboard.submit({ points: 1500, level: 0, lines: 0 }, '', 0)).toEqual(true)
  expect(leaderboard.submit({ points: 1500, level: 0, lines: 2 }, '', 0)).toEqual(true)
  expect(leaderboard.submit({ points: 1500, level: 0, lines: 2 }, '', 0)).toEqual(false)
})
