import { getQueryParam, setQueryParam } from './queryParams.js'
import { colours } from '../colours.js'

class MapState {
  constructor () {
    const location = getQueryParam('location')
    if (location) {
      this.location = location
      setQueryParam('location', null)
    }
  }

  defraMapConfig = null
  interactiveMap = null
  map = null
  view = null
  visibleLayers = null // The vectorTile layers that are currently visible on the map
  cursorStyleLayer = null // The style layer that the cursor or target is currently over, if any
  cursorAttributes = null // The attributes of the feature that the cursor or target is currently over, if any
  styleToValuesMap = {} // A map of esriStyleLayerId to infoPanelData values, used to get the info panel data for a given style layer

  onMapReady ({ map, view }) {
    this.map = map
    this.view = view

    if (this.location) {
    // Show a labelled marker on the map for the location passed from the /location page, if any
      const { x, y } = view.center
      this.interactiveMap.addMarker('search', [x, y], {
        label: this.location,
        showLabel: true,
        backgroundColor: { outdoor: colours.searchPin.default, dark: colours.searchPin.dark },
        foregroundColor: { outdoor: colours.searchPin.dark, dark: colours.searchPin.default }
      })
    }
  }

  get breakpoint () {
    const mapElement = document.getElementById('map')
    return mapElement?.dataset?.breakpoint || 'desktop'
  }

  attach (interactiveMap) {
    this.interactiveMap = interactiveMap
    interactiveMap.on('map:ready', this.onMapReady.bind(this))
  }

  updateVisibleLayers () {
    this.visibleLayers = this.map?.allLayers?.items?.filter((item) =>
      item.visible === true &&
      (item.type === 'vector-tile' || item.type === 'feature') &&
      item.id !== 'baselayer'
    )
  }

  getInfoPanelDataForEsriStyleLayerId (esriStyleLayerId) {
    return this.styleToValuesMap[esriStyleLayerId] || null
  }

  assignCursorStyleLayer (hitTestResponse) {
    let topHitTestData = null
    if (hitTestResponse?.results?.length > 0) {
      const visibleHitTestData = hitTestResponse?.results.reduce((hitTestData, result) => {
        // result.graphic?.origin?.layerId - is for vectorTileLayers
        // result.graphic?.origin?.layer?.id - is for featureLayers
        const layerId = result.graphic?.origin?.layerId || result.graphic?.origin?.layer?.id
        const { attributes } = result.graphic
        // skip main rivers and flood defence layers - as they have no infoPanel
        if (!layerId || layerId === 'mainrivers' || layerId === 'flooddefence') {
          return hitTestData
        }
        const vtLayer = result.layer
        // getStyleLayer is used to retrieve the style layer for vector tile layers
        // because, we need to check we are not hitting a hidden sublayer.
        // It does not exist for feature layers, but we have already filtered to visible
        // layers and they don't have sub layers - so a hit is a hit.
        // This check has changed from a check for visibility, to a check for none,
        // because the visibility property is not set until the layer is fully loaded.
        // When the layer is fully loaded, the visibility property will be set correctly.
        // This way we can click layers, that the user can see, while we are still waiting
        // for full completion
        const styleLayer = vtLayer?.getStyleLayer?.(layerId)
        if (styleLayer?.layout?.visibility !== 'none') {
          hitTestData.push({ layerId, attributes })
        }
        return hitTestData
      }, [])

      topHitTestData = visibleHitTestData?.[0] || null
    }
    mapState.cursorStyleLayer = topHitTestData?.layerId || null
    mapState.cursorAttributes = topHitTestData?.attributes || null
    document.body.style.cursor = mapState.cursorStyleLayer ? 'pointer' : 'default'
  }

  initPointerMove () {
    let lastHit = 0
    const throttleMs = 20 // Throttle to reduce hitTest usage
    const minScale = 250000 // vector tile layers use minScale value from arcgis online config for visibility

    this.view.on('pointer-enter', () => this.updateVisibleLayers())

    this.view.on('pointer-move', async event => {
      const now = Date.now()
      if (this.interfaceType !== 'mouse' || !this.visibleLayers || now - lastHit < throttleMs || this.view.scale > minScale) {
        return
      }
      lastHit = now
      const filter = this.visibleLayers.length > 0 ? { include: this.visibleLayers } : undefined
      await this.view.hitTest(event, filter)
        .then(this.assignCursorStyleLayer)
      document.body.style.cursor = this.cursorStyleLayer ? 'pointer' : 'default'
    })

    this.view.on('pointer-leave', () => {
      if (this.interfaceType === 'touch') {
        return
      }
      document.body.style.cursor = 'default'
      this.visibleLayers = null
    })
  }
}

const mapState = new MapState()

export { mapState }
