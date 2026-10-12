import createInteractPlugin from '@defra/interactive-map/plugins/interact'
import { terms } from '../../terms.js'
import { mapState } from '../../interactive-map-helpers/mapState.js'
import { getInfoPanel } from '../../infoPanel.js'
import { hideDatasetsKey, reShowDatasetsKey } from '../datasets/showHideDatasetsKey.js'

let enableGetInfoButton = false

const INFO_PANEL_ID = 'info'
const INFO_PANEL_MARKER_ID = 'infoPanelMarker'

const pluginConfig = {
  manifest: {
    buttons: [{
      id: 'selectAtTarget',
      label: terms.labels.getInfo,
      enableWhen: (event) => {
        // IM-526 Once the im provides an api that returns the interfaceType
        // or emits an event when the interfaceType changes, we can use that in the reactiveUtils listener
        // and get rid of this enableWhen event all together.

        // Save the interfaceType in our local mapState
        mapState.interfaceType = event?.appState?.interfaceType || 'mouse'
        if (mapState.interfaceType !== 'touch') {
          return false
        }
        return enableGetInfoButton
      }
    }]
  },

  marker: {
    id: INFO_PANEL_MARKER_ID,
    symbol: 'pin',
    backgroundColor: { outdoor: '#0b0c0c', dark: '#ffffff' },
    foregroundColor: { outdoor: '#ffffff', dark: '#0b0c0c' }
  },
  interactionModes: ['placeMarker'], // e.g. ['selectMarker'], ['selectFeature'], ['placeMarker'], or combinations
}

export const initialiseInteractPlugin = () => pluginConfig

const initiateTriggerHitTest = (interactiveMap) => async () => {
  const screenPoint = await mapState.view.toScreen(mapState.view.center)
  mapState.updateVisibleLayers()
  await mapState.view.hitTest(screenPoint, { include: mapState.visibleLayers }).then(mapState.assignCursorStyleLayer)
  enableGetInfoButton = Boolean(mapState.cursorStyleLayer)

  interactiveMap.toggleButtonState('selectAtTarget', 'disabled', enableGetInfoButton)
}
export const interactPlugin = () => {
  const _interactPlugin = createInteractPlugin({
    manifest: {
      buttons: [{
        id: 'selectAtTarget',
        label: terms.labels.getInfo,
        enableWhen: (event) => {
        // IM-526 Once the im provides an api that returns the interfaceType
        // or emits an event when the interfaceType changes, we can use that in the reactiveUtils listener
        // and get rid of this enableWhen event all together.

          // Save the interfaceType in our local mapState
          mapState.interfaceType = event?.appState?.interfaceType || 'mouse'
          if (mapState.interfaceType !== 'touch') {
            return false
          }
          return enableGetInfoButton
        }
      }]
    },

    marker: {
      id: INFO_PANEL_MARKER_ID,
      symbol: 'pin',
      backgroundColor: { outdoor: '#0b0c0c', dark: '#ffffff' },
      foregroundColor: { outdoor: '#ffffff', dark: '#0b0c0c' }
    },
    interactionModes: ['placeMarker'], // e.g. ['selectMarker'], ['selectFeature'], ['placeMarker'], or combinations
  })

  const bindShowInfoPanel = (interactiveMap) => async (coords) => {
    const attributes = mapState.cursorAttributes
    const infoPanelValues = {
      ...mapState.getInfoPanelDataForEsriStyleLayerId(mapState.cursorStyleLayer),
      coords: `${Math.round(coords[0])},${Math.round(coords[1])}`,
      version: mapState.defraMapConfig.version
    }
    if (attributes?.flood_source) {
      infoPanelValues.fs = attributes.flood_source
    }
    const infoPanel = await getInfoPanel(infoPanelValues)
    const { width, label, html } = infoPanel
    interactiveMap.addPanel(INFO_PANEL_ID, {
      label,
      html,
      mobile: { slot: 'drawer', modal: false, open: true },
      tablet: { slot: 'left-top', width, open: true },
      desktop: { slot: 'left-top', width, open: true }
    })
  }

  const infoPanelIsVisible = () => {
    const keyPanelElement = document.getElementById('map-panel-info')
    return Boolean(keyPanelElement?.checkVisibility?.())
  }

  const bindHideInfoPanel = (interactiveMap) => () => {
    if (infoPanelIsVisible()) {
    // Only hide the info panel if it is currently visible
    // otherwise we can get side effects, as the
    // removal of the info panels event listener will
    // trigger the re-showing of the key panel
      interactiveMap.removePanel(INFO_PANEL_ID)
    }
    // But always remove the marker - as this has no side effects
    _interactPlugin.hideInfoPanelMarker()
  }

  const bindHideInfoPanelMarker = (interactiveMap) => () => interactiveMap.removeMarker(INFO_PANEL_MARKER_ID)

  _interactPlugin.attach = (interactiveMap) => {
    interactiveMap.on('map:ready', () => {
      _interactPlugin.enable()
    })

    _interactPlugin.triggerHitTest = initiateTriggerHitTest(interactiveMap)
    _interactPlugin.panelId = INFO_PANEL_ID
    _interactPlugin.markerId = INFO_PANEL_MARKER_ID
    _interactPlugin.showInfoPanel = bindShowInfoPanel(interactiveMap)
    _interactPlugin.hideInfoPanel = bindHideInfoPanel(interactiveMap)
    _interactPlugin.hideInfoPanelMarker = bindHideInfoPanelMarker(interactiveMap)

    interactiveMap.on('interact:markerchange', async (event) => {
      const { coords } = event
      const screenPoint = await mapState.view.toScreen({ x: coords[0], y: coords[1] })
      mapState.updateVisibleLayers()
      await mapState.view.hitTest(screenPoint, { include: mapState.visibleLayers }).then(mapState.assignCursorStyleLayer)

      if (mapState.cursorStyleLayer) {
        _interactPlugin.showInfoPanel(event.coords)
      } else {
        _interactPlugin.hideInfoPanel()
      }
    })

    const dismissPanelTargets = {
      dataset: true,
      timeframe: true,
      aep: true,
      depth: true
    }

    // Remove the panel when the user changes the dataset, timeframe, aep or depth
    document.addEventListener('change', ({ target }) => {
      if (dismissPanelTargets[target.name]) {
        _interactPlugin.hideInfoPanel()
      }
    })

    // Remove the marker when the panel is closed or hidden
    const onRemoveInfoPanel = (panelId) => {
      if (panelId === INFO_PANEL_ID) {
        _interactPlugin.hideInfoPanelMarker()
        reShowDatasetsKey(INFO_PANEL_ID) // Re-show the datasets key if it was previously visible when the info panel was opened
      }
    }
    interactiveMap.on('app:panelclosed', ({ panelId }) => onRemoveInfoPanel(panelId))
    interactiveMap.on('app:removepanel', (panelId) => onRemoveInfoPanel(panelId))
    interactiveMap.on('app:panelopened', ({ panelId }) => {
      if (panelId === INFO_PANEL_ID) {
        hideDatasetsKey(INFO_PANEL_ID)
      }
      if (panelId === 'mapKey') {
        _interactPlugin.hideInfoPanel()
      }
    })
  }
  return _interactPlugin
}
