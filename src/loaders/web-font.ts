import webFontLoader from 'webfontloader'

const FILE_POPULATED = Phaser.Loader.FILE_POPULATED

class WebFont extends Phaser.Loader.File {
  constructor(loader: Phaser.Loader.LoaderPlugin, config: webFontLoader.Config) {
    super(loader, {
      key: Date.now().toString(),
      type: 'webfont',
      config: config,
    })
  }

  load(): void {
    if (this.state === FILE_POPULATED) {
      this.loader.nextFile(this, true)
    } else {
      const config = { ...this.config }
      config.active = this.onLoad.bind(this)
      config.inactive = this.onError.bind(this)
      config.fontactive = this.onFontActive.bind(this)
      config.fontinactive = this.onFontInactive.bind(this)
      webFontLoader.load(config)
    }
  }

  onLoad(): void {
    this.loader.nextFile(this, true)
  }

  onError(): void {
    this.loader.nextFile(this, false)
  }

  onFontActive(familyName: string, fvd: string): void {
    this.loader.emit('webfontactive', this, familyName, fvd)
  }

  onFontInactive(familyName: string, fvd: string): void {
    this.loader.emit('webfontinactive', this, familyName, fvd)
  }
}

export default WebFont
