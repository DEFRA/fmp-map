import createMenuPlugin from '@defra/interactive-map/plugins/menu'
import { menuConfig } from './menuConfig.js'

const pluginConfig = {
  manifest: {
    panels: [{
      id: 'menu',
      mobile: { slot: 'drawer', modal: true },
      tablet: { open: false, slot: 'side', width: '280px', modal: true },
      desktop: { open: true, slot: 'side', width: '280px', dismissible: false, exclusive: false },
    }],
    buttons: [{
      id: 'menuButton',
      mobile: { slot: 'top-left', showLabel: true, order: 1 },
    }]
  },
  menu: menuConfig
}

export const initialiseMenuPlugin = () => pluginConfig

export const menuPlugin = () => createMenuPlugin(pluginConfig)
