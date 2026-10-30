import InteractiveMap from '@defra/interactive-map'
import esriProvider from '@defra/interactive-map/providers/esri'
import { getDefraMapConfig } from './services/getDefraMapConfig.js'
import { siteBoundary } from './interactive-map-helpers/siteBoundary.js'
import { mapState } from './interactive-map-helpers/mapState.js'
import { initialisePlugins, attachInteractiveMapToPlugins, getPluginValues, updatePlugin, createPlugins } from './plugins/initialisePlugins.js'
import { setupEsriConfig } from './_fmp-app-specific/index.js'

export class FmpMap extends InteractiveMap {
  constructor (interactiveMapOptions, useProxy = false) {
    if (!FmpMap.defraMapConfig) {
      throw new Error('You must await FmpMap.initialise() before creating an FmpMap instance')
    }

    super('map', {
      mapProvider: esriProvider({ setupConfig: FmpMap.setupConfig }),
      ...interactiveMapOptions,
      extent: siteBoundary.buffedExtents || interactiveMapOptions.extent
    })
    mapState.attach(this)
    attachInteractiveMapToPlugins(this)

    this.on('app:ready', () => this.addButton('help', {
      label: 'Help',
      href: '/map-help',
      iconSvgContent: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
      mobile: { slot: 'right-top', showLabel: false, order: 1 },
      tablet: { slot: 'right-top', showLabel: false, order: 1 },
      desktop: { slot: 'right-top', showLabel: false, order: 1 }
    })
    )
  }

  static async initialise () {
    const defraMapConfig = await getDefraMapConfig()
    FmpMap.defraMapConfig = defraMapConfig
    // setupProxyConfig is used by fmp-app - behind a proxy
    // setupEsriConfig is used by the prototype (still appends tokens at runtime)
    FmpMap.setupConfig = setupEsriConfig
    mapState.defraMapConfig = defraMapConfig
    initialisePlugins(defraMapConfig)
    return FmpMap.defraMapConfig
  }
}

FmpMap.getPluginValues = getPluginValues
FmpMap.updatePlugin = updatePlugin
FmpMap.createPlugins = createPlugins
FmpMap.getDefraMapConfig = getDefraMapConfig

globalThis.FmpMap = FmpMap
