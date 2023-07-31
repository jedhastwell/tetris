import Phaser from 'phaser'
import config from './config'
import BootScene from './scenes/Boot'
import PreloadScene from './scenes/Preload'
import UiScene from './scenes/Ui'
import GameScene from './scenes/Game'
import MenuScene from './scenes/Menu'
import PauseScene from './scenes/Pause'
import GameplayPlugin from './plugins/gameplay'
import WebFontLoaderPlugin from './plugins/web-font'
import { SceneNames } from './types'

class Game extends Phaser.Game {
  constructor() {
    super(config)

    this.plugins.install(GameplayPlugin.KEY, GameplayPlugin, true, GameplayPlugin.KEY)
    this.plugins.install(WebFontLoaderPlugin.KEY, WebFontLoaderPlugin, true)

    this.scene.add(SceneNames.Boot, BootScene)
    this.scene.add(SceneNames.Preload, PreloadScene)
    this.scene.add(SceneNames.Ui, UiScene)
    this.scene.add(SceneNames.Game, GameScene)
    this.scene.add(SceneNames.Menu, MenuScene)
    this.scene.add(SceneNames.Pause, PauseScene)

    this.scene.start(SceneNames.Boot)
  }
}

new Game()
