import createScaleBarPlugin from '@defra/interactive-map/plugins/scale-bar'
const pluginConfig = { units: 'metric' }
export const initialiseScaleBarPlugin = () => pluginConfig
export const scaleBarPlugin = () => createScaleBarPlugin(pluginConfig)
