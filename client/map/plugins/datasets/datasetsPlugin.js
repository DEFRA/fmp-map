import * as reactiveUtils from '@arcgis/core/core/reactiveUtils'
import createDatasetsPlugin from '@defra/interactive-map/plugins/datasets'
import { surfaceWaterDatasets, surfaceWaterExtentsKey } from './surfaceWater.js'
import { floodZonesDatasets } from './floodZones.js'
import { featureLayers } from './featureLayers.js'
import { mapState } from '../../interactive-map-helpers/mapState.js'

const pluginConfig = {
  globals: {
    opacityMode: 'global',
    opacity: 0.75,
    visible: true
  },
  hasMenu: false
}

export const initialiseDatasetsPlugin = ({ agolServiceUrl, agolVectorTileUrl, layerNameSuffix }) => {
  pluginConfig.datasets = [
    ...floodZonesDatasets({ agolVectorTileUrl, layerNameSuffix }),
    surfaceWaterExtentsKey,
    ...surfaceWaterDatasets({ agolVectorTileUrl, layerNameSuffix }),
    ...featureLayers(agolServiceUrl, layerNameSuffix),
  ]
  return pluginConfig
}

const esriStyleLayerIdToInfoPanelReducer = (datasets) => {
  return datasets.reduce((styleToValuesMap, dataset) => {
    // Only featureLayers have infoPanelData at the top level
    // and they don't have an esriStyleLayerId, so they are
    // keyed with the dataset id instead.
    // For vector tile layers, the esriStyleLayerId is used as
    // the key, which only exists for sublayers (style layers).
    if (dataset.infoPanelData) {
      styleToValuesMap[dataset.id] = dataset.infoPanelData
    }
    if (dataset.sublayers) {
      dataset.sublayers.forEach((sublayer) => {
        if (sublayer.infoPanelData) {
          styleToValuesMap[sublayer.esriStyleLayerId] = sublayer.infoPanelData
        }
      })
    }
    return styleToValuesMap
  }, {})
}

export const datasetsPlugin = () => {
  mapState.styleToValuesMap = esriStyleLayerIdToInfoPanelReducer(pluginConfig.datasets)
  const plugin = createDatasetsPlugin(pluginConfig)
  plugin.ready = false

  plugin.attach = (interactiveMap) => {
    plugin.interactiveMap = interactiveMap

    interactiveMap.on('datasets:ready', function () {
      plugin.ready = true
      mapState.updateVisibleLayers()
      reactiveUtils.when(
        () => (!mapState.view.updating),
        () => {
        // Update the enabled state of the infoPanel button when the map is moved on a touch device
          if (mapState.interfaceType === 'touch') {
            plugin.plugins.interact.triggerHitTest()
          }
        })
    })
  }

  return plugin
}
