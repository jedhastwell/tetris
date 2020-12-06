import Phaser from 'phaser'

class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  preload(): void {
    this.load.image('robotune', 'assets/robotune.png')
  }

  create(): void {
    this.add.image(400, 300, 'robotune')
  }

  update(time: number, delta: number): void {}
}

export default Game
