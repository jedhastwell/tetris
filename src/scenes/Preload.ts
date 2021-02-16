import Phaser from 'phaser'
import UiScene from './Ui'
import MenuScene from './Menu'
import { SceneNames } from '../types'

class Preload extends Phaser.Scene {
  private readyCount = 0
  private logo: Phaser.GameObjects.Image

  preload(): void {
    this.logo = this.add.image(this.scale.width / 2, this.scale.height / 2, 'logo')

    this.load.webFont({ google: { families: ['Rubik:700'] } })
    this.load.atlas('atlas', 'assets/atlas.png', 'assets/atlas.json')

    this.time.delayedCall(500, this.ready, undefined, this)
  }

  create(): void {
    this.gameplay.boot()
    this.ready()
  }

  ready(): void {
    this.readyCount++
    if (this.readyCount === 2) {
      this.tweens.add({
        targets: this.logo,
        duration: 700,
        y: 74 + 300,
        ease: Phaser.Math.Easing.Back.Out,
        onComplete: () => this.launch(),
      })
    }
  }

  launch(): void {
    const duration = 700

    this.scene.launch(SceneNames.Ui)
    this.scene.launch(SceneNames.Menu)

    this.scene.moveAbove(SceneNames.Menu, SceneNames.Preload)
    ;(<UiScene>this.scene.get(SceneNames.Ui)).transitionIn(this, duration)
    ;(<MenuScene>this.scene.get(SceneNames.Menu)).transitionIn(this, duration)

    this.time.delayedCall(duration, () => this.scene.stop(SceneNames.Preload))
  }
}

export default Preload
