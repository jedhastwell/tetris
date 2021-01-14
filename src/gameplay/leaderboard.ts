import { GameStats } from '../types'
import { Events } from 'phaser'

interface LeaderboardEntry extends GameStats {
  name: string
  time: number
}

const StorageKey = 'lb1'

class Leaderboard extends Events.EventEmitter {
  static readonly Events = {
    UPDATED: 'Updated',
  }

  public entries: LeaderboardEntry[]
  private maxEntries: number

  private emitUpdated = (): boolean => this.emit(Leaderboard.Events.UPDATED, this)

  constructor(maxEntries: number) {
    super()
    this.maxEntries = maxEntries
    this.entries = []
  }

  load(): void {
    const storedValue = window.localStorage.getItem(StorageKey)
    if (!!storedValue) {
      this.entries = JSON.parse(storedValue)
      this.emitUpdated()
    }
  }

  save(): void {
    window.localStorage.setItem(StorageKey, JSON.stringify(this.entries))
  }

  submit(stats: GameStats, name: string, time: number): boolean {
    const i = this.entries.findIndex((entry) => {
      return (
        entry.points < stats.points || (entry.points === stats.points && stats.lines > entry.lines)
      )
    })

    const newEntry: LeaderboardEntry = {
      points: stats.points,
      lines: stats.lines,
      level: stats.level,
      name,
      time,
    }

    const dropScore = i === -1 && this.entries.length === this.maxEntries

    this.entries.splice(i === -1 ? this.entries.length : i, 0, newEntry)
    if (this.entries.length > this.maxEntries) {
      this.entries.pop()
    }

    if (!dropScore) {
      this.emitUpdated()
    }

    return !dropScore
  }

  getHighScore(): number {
    return this.entries.length ? this.entries[0].points : 0
  }

  hasEntries(): boolean {
    return this.entries.length > 0
  }
}

export default Leaderboard
