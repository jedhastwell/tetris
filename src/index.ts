import Phaser from 'phaser'
import config from './config'
import BootScene from './scenes/Boot'
import PreloadScene from './scenes/Preload'
import GameScene from './scenes/Game'

new Phaser.Game(
  Object.assign(config, {
    scene: [BootScene, PreloadScene, GameScene],
  }),
)
