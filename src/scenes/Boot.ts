import Phaser from 'phaser'
import { SceneNames } from '../types'

class Game extends Phaser.Scene {
  preload(): void {
    this.load.image('logo', 'assets/logo.png')
    document.body.style.backgroundColor = this.game.config.backgroundColor.rgba
  }

  create(): void {
    this.scene.start(SceneNames.Preload)
  }
}

export default Game
