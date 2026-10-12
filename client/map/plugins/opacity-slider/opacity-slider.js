import _createOpacitySliderPlugin from './src/index.js'
import { terms } from '../../terms.js'

const pluginConfig = {
  heading: terms.labels.opacityHeading,
}

export const initialiseOpacitySliderPlugin = () => pluginConfig

export const opacitySliderPlugin = (datasetsPlugin) => _createOpacitySliderPlugin({
  ...pluginConfig,
  onChange: (opacity) => datasetsPlugin.setOpacity(opacity)
})
