import Leaderboard from '../gameplay/leaderboard'
import Playfield from '../gameplay/playfield'
import Score from '../gameplay/score'
import { Settings } from '../settings'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Phaser {
    interface Scene {
      [GameplayPlugin.KEY]: GameplayPlugin
    }
  }
}

class GameplayPlugin extends Phaser.Plugins.BasePlugin {
  static readonly KEY = 'gameplay'

  public playfield: Playfield
  public score: Score
  public leaderboard: Leaderboard

  boot(): void {
    this.playfield = new Playfield({
      cols: Settings.COLS,
      rows: Settings.ROWS + Settings.ROW_BUFFER,
      firstVisibleRow: Settings.ROW_BUFFER,
      queueSize: Settings.QUEUE_SIZE,
    })

    this.score = new Score()
    this.score.bindPlayfieldEvents(this.playfield)

    this.leaderboard = new Leaderboard(Settings.LEADERBOARD_ENTRIES_SAVED)
    this.leaderboard.load()
  }

  restart(level = 1): void {
    this.score.reset(level)
    this.playfield.reset(level)
  }

  destory(): void {
    this.score.destroy()
    this.playfield.destroy()
    this.leaderboard.destroy()
  }
}

export default GameplayPlugin
