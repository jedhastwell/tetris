import Phaser from 'phaser'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#7D69DD',
  scale: {
    width: 1488,
    height: 1504,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: {
    noAudio: true,
  },
}

export default config
