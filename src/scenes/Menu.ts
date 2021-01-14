import Phaser from 'phaser'
import Button, { ButtonEvents } from '../entities/button'
import { SceneNames } from '../types'

class Menu extends Phaser.Scene {
  create(): void {
    this.cameras.main.setPosition(414, 74)

    this.add.image(330, 300, 'logo')

    const playButton = new Button(this, 340, 1100, 'PLAY')
    this.add.existing(playButton)
    playButton.on(ButtonEvents.CLICKED, this.handlePlayClicked, this)

    this.bindEvents()
  }

  bindEvents(): void {
    this.events.on(Phaser.Scenes.Events.TRANSITION_START, this.transitionIn, this)
    this.events.on(Phaser.Scenes.Events.TRANSITION_WAKE, this.transitionIn, this)
    this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, this.transitionOut, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.unbindEvents, this)
  }

  unbindEvents(): void {
    this.events.off(Phaser.Scenes.Events.TRANSITION_START, this.transitionIn, this)
    this.events.off(Phaser.Scenes.Events.TRANSITION_WAKE, this.transitionIn, this)
    this.events.off(Phaser.Scenes.Events.TRANSITION_OUT, this.transitionOut, this)
  }

  handlePlayClicked(): void {
    this.gameplay.restart()

    this.scene.transition({
      target: SceneNames.Game,
      duration: 500,
      moveAbove: true,
      remove: false,
      sleep: true,
      allowInput: true,
    })
  }

  transitionIn(fromScene: Phaser.Scene, duration: number): void {
    this.cameras.main.alpha = 0
    this.tweens.add({
      targets: this.cameras.main,
      duration: duration,
      alpha: 1,
    })
  }

  transitionOut(toScene: Phaser.Scene, duration: number): void {
    this.tweens.add({
      targets: this.cameras.main,
      duration: duration,
      alpha: 0,
    })
  }
}

export default Menu
