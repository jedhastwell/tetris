import Phaser from 'phaser'
import Playfield from '../gameplay/playfield'
import Score from '../gameplay/score'
import Leaderboard from '../gameplay/leaderboard'
import Preview from '../entities/preview'
import PreviewPanel from '../entities/preview'

const PANEL_SPACING = 68

class Ui extends Phaser.Scene {
  private nextPanel: PreviewPanel
  private holdPanel: PreviewPanel
  private scorePanel: Phaser.GameObjects.Image
  private scoreLabel: Phaser.GameObjects.Text
  private linesLabel: Phaser.GameObjects.Text
  private levelLabel: Phaser.GameObjects.Text
  private highScorePanel: Phaser.GameObjects.Image
  private highScoreLabel: Phaser.GameObjects.Text

  create(): void {
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
      .setVisible(this.gameplay.leaderboard.hasEntries())

    const highScore = this.gameplay.leaderboard.getHighScore().toLocaleString()
    this.highScoreLabel = this.createLabel(0, 0, highScore, { textAlign: 'right' })
      .setPosition(this.highScorePanel.x + 96, this.highScorePanel.y + 24)
      .setOrigin(1, 0)
      .setVisible(this.gameplay.leaderboard.hasEntries())

    // Board background
    const boardPanel = this.add
      .image(0, 0, 'atlas', 'grid-panel')
      .setPosition(this.holdPanel.getBounds().right - 96 + PANEL_SPACING, 36)
      .setOrigin(0, 0)

    // Next Panel
    this.nextPanel = new Preview(this, 0, 36, this.gameplay.playfield.queueSize, 'next')
    this.nextPanel.setX(
      boardPanel.getBounds().right - 96 + PANEL_SPACING + this.nextPanel.getBounds().width / 2,
    )
    this.add.existing(this.nextPanel)

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
    this.events.on(Phaser.Scenes.Events.TRANSITION_START, this.transitionIn, this)
    this.gameplay.score.on(Score.Events.POINTS_CHANGED, this.updatePoints, this)
    this.gameplay.score.on(Score.Events.LINES_CHANGED, this.updateLines, this)
    this.gameplay.score.on(Score.Events.LEVEL_CHANGED, this.updateLevel, this)
    this.gameplay.playfield.on(Playfield.Events.QUEUE_UPDATED, this.updatePreview, this)
    this.gameplay.playfield.on(Playfield.Events.HOLD_UPDATED, this.updateHold, this)
    this.gameplay.leaderboard.on(Leaderboard.Events.UPDATED, this.updateHighScore, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.unbindEvents, this)
  }

  unbindEvents(): void {
    this.events.off(Phaser.Scenes.Events.TRANSITION_START, this.transitionIn, this)
    this.gameplay.score.off(Score.Events.POINTS_CHANGED, this.updatePoints, this)
    this.gameplay.score.off(Score.Events.LINES_CHANGED, this.updateLines, this)
    this.gameplay.score.off(Score.Events.LEVEL_CHANGED, this.updateLevel, this)
    this.gameplay.playfield.off(Playfield.Events.QUEUE_UPDATED, this.updatePreview, this)
    this.gameplay.playfield.off(Playfield.Events.HOLD_UPDATED, this.updateHold, this)
    this.gameplay.leaderboard.off(Leaderboard.Events.UPDATED, this.updateHighScore, this)
  }

  updatePoints(points: number): void {
    this.scoreLabel.setText(points.toLocaleString())
  }

  updateLines(lines: number): void {
    this.linesLabel.setText(lines.toLocaleString())
  }

  updateLevel(level: number): void {
    this.levelLabel.setText(level.toLocaleString())
  }

  updateHighScore(leaderboard: Leaderboard): void {
    this.highScorePanel.setVisible(leaderboard.hasEntries())
    this.highScoreLabel.setVisible(leaderboard.hasEntries())
    this.highScoreLabel.setText(leaderboard.getHighScore().toLocaleString())
  }

  updateHold(playfield: Playfield): void {
    this.holdPanel.updateShapes(playfield.held)
  }

  updatePreview(playfield: Playfield): void {
    this.nextPanel.updateShapes(playfield.queue)
  }

  transitionIn(fromScene: Phaser.Scene, duration: number): void {
    this.cameras.main.alpha = 0

    this.tweens.add({
      targets: this.cameras.main,
      alpha: 1,
      duration: duration,
      ease: Phaser.Math.Easing.Quadratic.Out,
    })
  }
}

export default Ui
