import Phaser from 'phaser'
import { SceneNames } from '../types'
import { Controls } from '../settings'

type Group = Phaser.GameObjects.Group

const SHAPE_IMAGES = '-IJLOSZT'
const CELL_SIZE = 68

class Pause extends Phaser.Scene {
  private matrix: Group
  private cols: number
  private rows: number

  create(): void {
    this.cameras.main.setPosition(414, 74)

    this.cols = this.gameplay.playfield.cols
    this.rows = this.gameplay.playfield.rows - this.gameplay.playfield.firstVisibleRow

    this.matrix = this.add.group(<any>{
      key: 'atlas',
      frame: 'block-J',
      visible: true,
      repeat: this.cols * this.rows - 1,
    })

    Phaser.Actions.GridAlign(this.matrix.getChildren(), {
      width: this.cols,
      height: this.rows,
      cellWidth: CELL_SIZE,
      cellHeight: CELL_SIZE,
      x: 0,
      y: 0,
    })

    this.bindEvents()
  }

  bindEvents(): void {
    for (const keyName of Controls.Keys.Game.pause) {
      if (this.input.keyboard) {
        const key = this.input.keyboard.addKey(keyName, true)
        key.on('down', this.close, this)
      }
    }
    this.events.on(Phaser.Scenes.Events.WAKE, this.transitionIn, this)
    this.events.on(Phaser.Scenes.Events.CREATE, this.transitionIn, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.unbindEvents, this)
  }

  unbindEvents(): void {
    this.input.keyboard?.removeAllKeys()
    this.events.off(Phaser.Scenes.Events.WAKE, this.transitionIn, this)
    this.events.off(Phaser.Scenes.Events.CREATE, this.transitionIn, this)
  }

  close(): void {
    this.scene.sleep(SceneNames.Pause)
    this.scene.resume(SceneNames.Game)
    this.scene.get(SceneNames.Game).input.enabled = true
  }

  transitionIn(): void {
    const frame = `block-${SHAPE_IMAGES[this.gameplay.playfield.getTetromino().shapeId]}`
    this.matrix.getChildren().forEach((image) => (<Phaser.GameObjects.Image>image).setFrame(frame))
    this.matrix.setAlpha(0)

    this.tweens.add({
      targets: this.matrix.getChildren(),
      alpha: 1,
      duration: 100,
    })
  }
}

export default Pause
