import WebFont from '../loaders/web-font'
import { Config } from 'webfontloader'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Phaser {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Loader {
      interface LoaderPlugin {
        [WebFontLoaderPlugin.KEY]: typeof loadWebFontCallback
      }
    }
  }
}

function loadWebFontCallback(config: Config | Config[]) {
  const load = <Phaser.Loader.LoaderPlugin>this

  if (Array.isArray(config)) {
    for (let i = 0; i < config.length; i++) {
      load.addFile(new WebFont(this, config[i]))
    }
  } else {
    load.addFile(new WebFont(this, config))
  }

  return load
}

class WebFontLoaderPlugin extends Phaser.Plugins.BasePlugin {
  static readonly KEY = 'webFont'

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager)

    pluginManager.registerFileType(WebFontLoaderPlugin.KEY, loadWebFontCallback)
  }
}

export default WebFontLoaderPlugin
