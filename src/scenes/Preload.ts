import Phaser from 'phaser'
import WebFont from '../loaders/web-font'
import { SceneNames } from '../types'

class Game extends Phaser.Scene {
  private loaded = false
  private displayTimeExpired = false
  private logo: Phaser.GameObjects.Image

  constructor() {
    super({ key: SceneNames.PrealoadScene })
  }

  preload(): void {
    this.logo = this.add.image(this.scale.width / 2, this.scale.height / 3, 'logo')

    this.load.addFile(new WebFont(this.load, { google: { families: ['Rubik:700'] } }))
    this.load.atlas('atlas', 'assets/atlas.png', 'assets/atlas.json')

    this.events.on('transitionout', this.transitionOut, this)

    this.time.delayedCall(500, () => {
      this.displayTimeExpired = true
      this.startGame()
    })
  }

  create(): void {
    this.loaded = true
    this.startGame()
  }

  transitionOut(toScene: Phaser.Scene, duration: number): void {
    this.tweens.add({
      targets: this.logo,
      scale: 0,
      duration: duration,
      ease: Phaser.Math.Easing.Back.In,
    })
  }

  startGame(): void {
    if (this.loaded && this.displayTimeExpired) {
      this.scene.transition({
        target: SceneNames.GameScene,
        duration: 500,
        moveBelow: true,
        remove: true,
        allowInput: false,
      })
    }
  }
}

export default Game
