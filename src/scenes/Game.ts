import Phaser from 'phaser'
import Playfield from '../gameplay/playfield'
import { PlayfieldCommand, SceneNames } from '../types'
import { Settings, Controls } from '../settings'
import Repeater from '../gameplay/repeater'
import Board from '../entities/board'

class Game extends Phaser.Scene {
  private background: Phaser.GameObjects.TileSprite
  private board: Board
  private rows: number
  private cols: number

  create(): void {
    this.cameras.main.setPosition(414, 74)

    this.cols = this.gameplay.playfield.cols
    this.rows = this.gameplay.playfield.rows - this.gameplay.playfield.firstVisibleRow

    // Background
    this.background = this.add
      .tileSprite(
        -2,
        this.rows * 68 - 2,
        this.cols * 68,
        this.rows * 68,
        'atlas',
        'block-background',
      )
      .setOrigin(0, 1)

    // Board display
    this.board = new Board(this, 0, 0, this.cols, this.rows)
    this.add.existing(this.board)

    this.assignControls()
    this.bindEvents()
  }

  bindEvents(): void {
    this.events.on(Phaser.Scenes.Events.TRANSITION_START, this.transitionIn, this)
    this.events.on(Phaser.Scenes.Events.TRANSITION_WAKE, this.transitionIn, this)
    this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, this.transitionOut, this)
    this.gameplay.playfield.on(Playfield.Events.MATRIX_UPDATED, this.updateMatrix, this)
    this.gameplay.playfield.on(Playfield.Events.TETROMINO_UPDATED, this.updateTetromino, this)
    this.gameplay.playfield.on(Playfield.Events.TOPPED_OUT, this.gameOver, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.unbindEvents, this)
  }

  unbindEvents(): void {
    this.events.off(Phaser.Scenes.Events.TRANSITION_START, this.transitionIn, this)
    this.events.off(Phaser.Scenes.Events.TRANSITION_WAKE, this.transitionIn, this)
    this.events.off(Phaser.Scenes.Events.TRANSITION_OUT, this.transitionOut, this)
    this.events.off(Phaser.Scenes.Events.UPDATE, this.updatePlayfield, this)
    this.gameplay.playfield.off(Playfield.Events.MATRIX_UPDATED, this.updateMatrix, this)
    this.gameplay.playfield.off(Playfield.Events.TETROMINO_UPDATED, this.updateTetromino, this)
    this.gameplay.playfield.off(Playfield.Events.TOPPED_OUT, this.gameOver, this)
    this.input.keyboard?.removeAllKeys()
    this.time.removeAllEvents()
  }

  assignControls(): void {
    Object.keys(Controls.Keys).forEach((command: PlayfieldCommand) => {
      Controls.Keys[command].forEach((keyName) => {
        if (this.input.keyboard) {
          const key = this.input.keyboard.addKey(keyName, true)

          if (['moveLeft', 'moveRight', 'softDrop'].includes(command)) {
            const repeater = new Repeater(this, {
              callback: () => this.gameplay.playfield[command](),
              repeatDelay: Settings.REPEAT_DELAY,
              repeatSpeed: Settings.REPEAT_SPEED,
            })
            key.on('down', repeater.start, repeater)
            key.on('up', repeater.stop, repeater)
          } else {
            key.on('down', () => this.gameplay.playfield[command](), this)
          }
        }
      })
    })
  }

  setPlaying(value: boolean): void {
    this.board.hideTetromino = !value
    this.board.hideGhost = !value
    this.input.enabled = value
    this.events.off(Phaser.Scenes.Events.UPDATE, this.updatePlayfield, this)
    if (value) {
      this.events.on(Phaser.Scenes.Events.UPDATE, this.updatePlayfield, this)
    }
  }

  gameOver(): void {
    this.setPlaying(false)

    this.gameplay.leaderboard.submit(this.gameplay.score, '', Date.now())
    this.gameplay.leaderboard.save()

    this.board.animateFill(this.gameplay.playfield.getTetromino().shapeId, 800)
    this.time.delayedCall(1500, () => {
      this.scene.transition({
        target: SceneNames.Menu,
        duration: 250,
        remove: false,
        sleep: true,
      })
      this.scene.bringToTop(SceneNames.Game)
    })
  }

  updatePlayfield(time: number, delta: number): void {
    this.gameplay.playfield.update(delta)
  }

  updateTetromino(playfield: Playfield, willLock: boolean): void {
    this.board.updateTetromino(
      playfield.getTetromino().move({ x: 0, y: -Settings.ROW_BUFFER }),
      willLock ? playfield.nextStep : undefined,
    )
    this.board.updateGhost(playfield.getGhost().move({ x: 0, y: -Settings.ROW_BUFFER }))
  }

  updateMatrix(playfield: Playfield): void {
    const matrix = playfield.getMatrix(false)
    matrix.splice(0, Settings.ROW_BUFFER)
    this.board.updateMatrix(matrix)
  }

  transitionIn(fromScene: Phaser.Scene, duration: number): void {
    this.setPlaying(false)
    this.tweens.killTweensOf(this.cameras.main)
    this.cameras.main.setAlpha(1)

    const targetHeight = this.background.height
    this.background.height = 0
    this.tweens.add({
      targets: this.background,
      height: targetHeight,
      duration: duration,
      ease: (t: number): number => Math.round(t * this.rows) / this.rows,
      completeDelay: Settings.START_DELAY,
      onComplete: () => {
        this.setPlaying(true)
        // Hack: This is here so the first shape is displayed in the queue during start delay. Can surely be done cleaner.
        this.gameplay.playfield.spawnFromQueue()
      },
    })
  }

  transitionOut(fromScene: Phaser.Scene, duration: number): void {
    this.add.tween({
      targets: this.cameras.main,
      alpha: 0,
      duration: duration,
    })
  }
}

export default Game
