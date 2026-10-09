import InteractiveMap from '@defra/interactive-map'
import esriProvider from '@defra/interactive-map/providers/esri'
import { setupEsriConfig, getDefraMapConfig } from './tokens.js'
import { siteBoundary } from './interactive-map-helpers/siteBoundary.js'
import { mapState } from './interactive-map-helpers/mapState.js'
import { initialisePlugins, getPlugins, attachInteractiveMapToPlugins } from './plugins/initialisePlugins.js'

const ENGLAND_WEST = 50000
const ENGLAND_SOUTH = 40000
const ENGLAND_EAST = 400000
const ENGLAND_NORTH = 650000

const interactiveMapOptions = {
  behaviour: 'inline',
  place: 'England',
  minZoom: 6,
  maxZoom: 20,
  extent: siteBoundary.buffedExtents || [ENGLAND_WEST, ENGLAND_SOUTH, ENGLAND_EAST, ENGLAND_NORTH],
  containerHeight: '100%',
  enableMapControls: false,
  enableZoomControls: true
}

export class FmpMap extends InteractiveMap {
  constructor (overrides = {}) {
    if (!FmpMap.defraMapConfig) {
      throw new Error('You must await FmpMap.initialise() before creating an FmpMap instance')
    }
    // const plugins = initialisePlugins(FmpMap.defraMapConfig)
    const mapProvider = esriProvider({ setupConfig: setupEsriConfig })

    super('map', {
      mapProvider,
      plugins: getPlugins(),
      ...interactiveMapOptions,
      ...overrides
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
    mapState.defraMapConfig = defraMapConfig
    initialisePlugins(defraMapConfig)
    console.log('plugins', getPlugins())
    return FmpMap.defraMapConfig
  }
}

globalThis.FmpMap = FmpMap
