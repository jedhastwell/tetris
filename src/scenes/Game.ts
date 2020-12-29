import Phaser from 'phaser'
import Playfield from '../gameplay/playfield'
import { PlayfieldCommand, TSpin } from '../types'
import Score from '../gameplay/score'
import Leaderboard from '../gameplay/leaderboard'
import { Settings, Controls } from '../settings'
import Repeater from '../gameplay/repeater'
import Preview from '../entities/preview'
import PreviewPanel from '../entities/preview'
import Board from '../entities/board'

const PANEL_SPACING = 68

class Game extends Phaser.Scene {
  private playfield: Playfield
  private score: Score
  private leaderboard: Leaderboard
  private nextPanel: PreviewPanel
  private holdPanel: PreviewPanel
  private board: Board
  private scorePanel: Phaser.GameObjects.Image
  private scoreLabel: Phaser.GameObjects.Text
  private linesLabel: Phaser.GameObjects.Text
  private levelLabel: Phaser.GameObjects.Text
  private highScorePanel: Phaser.GameObjects.Image
  private highScoreLabel: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'GameScene' })
  }

  preload(): void {
    this.load.atlas('atlas', 'assets/atlas.png', 'assets/atlas.json')
  }

  create(): void {
    this.playfield = new Playfield({
      cols: Settings.COLS,
      rows: Settings.ROWS + Settings.ROW_BUFFER,
      firstVisibleRow: Settings.ROW_BUFFER,
      queueSize: Settings.QUEUE_SIZE,
      lockDelay: Settings.LOCK_DELAY,
      dropFrequency: Settings.LEVEL_SPEEDS[1],
      maxLockDelayResets: Settings.MAX_LOCK_DELAY_RESETS,
    })

    this.score = new Score()
    this.leaderboard = new Leaderboard(Settings.LEADERBOARD_ENTRIES_SAVED)
    this.leaderboard.load()

    // Hold panel
    this.holdPanel = new Preview(this, 196, 36, 1, 'hold')
    this.add.existing(this.holdPanel)

    // Score panel
    this.scorePanel = this.add
      .image(0, 0, 'atlas', 'score-panel')
      .setPosition(this.holdPanel.x, this.holdPanel.getBounds().bottom - 96 + PANEL_SPACING)
      .setOrigin(0.5, 0)
    this.scoreLabel = this.createLabel(this.scorePanel.x, this.scorePanel.y + 104, '0')
    this.linesLabel = this.createLabel(this.scorePanel.x, this.scorePanel.y + 224, '0')
    this.levelLabel = this.createLabel(this.scorePanel.x, this.scorePanel.y + 344, '1')

    // High score panel
    this.highScorePanel = this.add
      .image(0, 0, 'atlas', 'high-score-panel')
      .setPosition(this.scorePanel.x, this.scorePanel.getBounds().bottom - 96 + PANEL_SPACING)
      .setOrigin(0.5, 0)
      .setVisible(this.leaderboard.hasEntries())

    const highScore = this.leaderboard.getHighScore().toLocaleString()
    this.highScoreLabel = this.createLabel(0, 0, highScore, { textAlign: 'right' })
      .setPosition(this.highScorePanel.x + 96, this.highScorePanel.y + 24)
      .setOrigin(1, 0)
      .setVisible(this.leaderboard.hasEntries())

    // Board background
    const boardPanel = this.add
      .image(0, 0, 'atlas', 'grid-panel')
      .setPosition(this.holdPanel.getBounds().right - 96 + PANEL_SPACING, 36)
      .setOrigin(0, 0)

    // Board display
    this.board = new Board(this, boardPanel.x + 62, 36 + 38, 10, 20)
    this.add.existing(this.board)

    // Next Panel
    this.nextPanel = new Preview(this, 0, 36, Settings.QUEUE_SIZE, 'next')
    this.nextPanel.setX(
      boardPanel.getBounds().right - 96 + PANEL_SPACING + this.nextPanel.getBounds().width / 2,
    )
    this.add.existing(this.nextPanel)

    this.assignControls()
    this.bindEvents()
  }

  createLabel(
    x: number,
    y: number,
    text: string,
    styles?: Record<string, any>,
  ): Phaser.GameObjects.Text {
    const fontStyles = {
      fontFamily: 'Rubik, sans-serif',
      fontStyle: 'bold',
      fontSize: '28px',
      ...styles,
    }
    const label = this.add.text(x, y, text, fontStyles).setOrigin(0.5, 0)
    return label
  }

  bindEvents(): void {
    this.score.bindPlayfieldEvents(this.playfield)
    this.score.on(Score.Events.POINTS_CHANGED, (points: number) =>
      this.scoreLabel.setText(points.toLocaleString()),
    )
    this.score.on(Score.Events.LINES_CHANGED, (lines: number) =>
      this.linesLabel.setText(lines.toLocaleString()),
    )
    this.score.on(Score.Events.LEVEL_CHANGED, (level: number) => {
      this.levelLabel.setText(level.toLocaleString())
      const newSpeed = (<any>Settings.LEVEL_SPEEDS)[level]
      if (newSpeed) {
        this.playfield.dropFrequency = newSpeed
      }
    })
    this.playfield.on(Playfield.Events.QUEUE_UPDATED, this.updatePreview, this)
    this.playfield.on(Playfield.Events.HOLD_UPDATED, this.updateHold, this)
    this.playfield.on(Playfield.Events.MATRIX_UPDATED, this.updateMatrix, this)
    this.playfield.on(Playfield.Events.TETROMINO_UPDATED, this.updateTetromino, this)
    this.playfield.on(Playfield.Events.TOPPED_OUT, this.gameOver, this)
    this.playfield.on(
      Playfield.Events.TSPIN,
      (playfield: Playfield, tSpin: TSpin, linesCleared: number) => {
        console.log('Performed T-Splin', tSpin, linesCleared)
      },
    )
  }

  handlePlayfieldInput(command: PlayfieldCommand): void {
    this.playfield[command]()
  }

  assignControls(): void {
    Object.keys(Controls.Keys).forEach((command: PlayfieldCommand) => {
      Controls.Keys[command].forEach((keyName) => {
        const key = this.input.keyboard.addKey(keyName, true)

        if (['moveLeft', 'moveRight', 'softDrop'].includes(command)) {
          const repeater = new Repeater(this, {
            callback: () => this.handlePlayfieldInput(command),
            repeatDelay: Settings.REPEAT_DELAY,
            repeatSpeed: Settings.REPEAT_SPEED,
          })

          key.on('down', repeater.start, repeater)
          key.on('up', repeater.stop, repeater)
        } else {
          key.on('down', () => this.handlePlayfieldInput(command), this)
        }
      })
    })
  }

  updateHold(playfield: Playfield): void {
    this.holdPanel.updateShapes(playfield.held)
  }

  updatePreview(playfield: Playfield): void {
    this.nextPanel.updateShapes(playfield.queue)
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

  gameOver(): void {
    this.leaderboard.submit(this.score, '', Date.now())
    this.leaderboard.save()
    this.highScorePanel.setVisible(true)
    this.highScoreLabel.setVisible(true)
    this.highScoreLabel.setText(this.leaderboard.getHighScore().toLocaleString())
  }
  update(time: number, delta: number): void {
    this.playfield.update(delta)
  }
}

export default Game
