import { datasetsPlugin, initialiseDatasetsPlugin } from './datasets/datasetsPlugin.js'
import { opacitySliderPlugin, initialiseOpacitySliderPlugin } from './opacity-slider/opacity-slider.js'
import { mapKeyPlugin, initialiseMapKeyPlugin } from './map-key/map-key.js'
import { menuPlugin, initialiseMenuPlugin } from './menu/menu.js'
import { mapStylePlugin, initialiseMapStylePlugin } from './map-styles/map-styles.js'
import { scaleBarPlugin, initialiseScaleBarPlugin } from './scale-bar/scale-bar.js'
import { searchPlugin, initialiseSearchPlugin } from './search/search.js'
import { drawAndFramePlugin, initialiseDrawPlugin, initialiseFramePlugin } from './draw/drawPlugin.js'
import { interactPlugin, initialiseInteractPlugin } from './interact/interact.js'

export const plugins = {}
const pluginValues = {}
const pluginArray = []

export const updatePlugin = (pluginName, overrides) => {
  if (pluginValues[pluginName]) {
    Object.assign(pluginValues[pluginName], { ...pluginValues[pluginName] }, overrides)
  }
}

export const getPluginValues = (pluginName) => {
  if (!pluginName) {
    return structuredClone(pluginValues)
  }

  if (!pluginValues[pluginName]) {
    return null
  }

  return structuredClone(pluginValues[pluginName])
}

export const initialisePlugins = (defraMapConfig) => {
  pluginValues.datasets = initialiseDatasetsPlugin(defraMapConfig)
  pluginValues.opacitySlider = initialiseOpacitySliderPlugin()
  pluginValues.mapKey = initialiseMapKeyPlugin()
  pluginValues.menu = initialiseMenuPlugin()
  pluginValues.mapStyle = initialiseMapStylePlugin(defraMapConfig.OS_ACCOUNT_NUMBER)
  pluginValues.scaleBar = initialiseScaleBarPlugin()
  pluginValues.search = initialiseSearchPlugin()
  pluginValues.draw = initialiseDrawPlugin()
  pluginValues.frame = initialiseFramePlugin()
  pluginValues.interact = initialiseInteractPlugin()
}

export const createPlugins = () => {
  plugins.datasets = datasetsPlugin()
  plugins.opacitySlider = opacitySliderPlugin(plugins.datasets)
  plugins.mapKey = mapKeyPlugin()
  plugins.menu = menuPlugin()
  plugins.mapStyle = mapStylePlugin()
  plugins.scaleBar = scaleBarPlugin()
  plugins.search = searchPlugin()
  const { drawPlugin, framePlugin } = drawAndFramePlugin()
  plugins.draw = drawPlugin
  plugins.frame = framePlugin
  plugins.interact = interactPlugin()

  pluginArray.push(
    plugins.datasets,
    plugins.opacitySlider,
    plugins.mapKey,
    plugins.menu,
    plugins.mapStyle,
    plugins.scaleBar,
    plugins.search,
    plugins.draw,
    plugins.frame,
    plugins.interact
  )

  // Ensure each Plugin has a reference to all the other plugins
  pluginArray.forEach(plugin => (plugin.plugins = plugins))
  return pluginArray
}

export const attachInteractiveMapToPlugins = (interactiveMap) => {
  pluginArray.forEach(plugin => {
    // Ensure each Plugin has a reference to the interactive map
    plugin.interactiveMap = interactiveMap
    // Call the plugins attach method if it exists
    if (typeof plugin.attach === 'function') {
      plugin.attach(interactiveMap)
    }
  })
}
