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
      mapState.initPointerMove()
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
