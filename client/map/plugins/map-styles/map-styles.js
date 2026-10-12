import createMapStylesPlugin from '@defra/interactive-map/plugins/map-styles'

const MAP_STYLES_BUTTON_ID = 'map-styles-button'
const logo = '/assets/images/os-logo.svg'
const whiteLogo = '/assets/images/os-logo-white.svg'

const pluginConfig = {
  mapStyles: [
    {
      id: 'outdoor',
      label: 'Outdoor',
      url: '/map/styles/master-map',
      thumbnail: '/assets/images/outdoor-map-icon.jpg',
      backgroundColor: '#A9DDEF',
      logo
    },
    {
      id: 'dark',
      label: 'Dark',
      url: '/map/styles/master-map-dark',
      mapColorScheme: 'dark',
      appColorScheme: 'dark',
      thumbnail: '/assets/images/dark-map-icon.jpg',
      logo: whiteLogo
    },
    {
      id: 'black-and-white',
      label: 'Black and white',
      url: '/map/styles/black-and-white-map',
      thumbnail: '/assets/images/black-and-white-map-icon.jpg',
      backgroundColor: '#2C2C2C',
      logo
    }
  ],
  manifest: {
    buttons: [{
      id: 'mapStyles',
      desktop: { slot: 'right-top', order: 2, showLabel: false },
      tablet: { slot: 'right-top', order: 2, showLabel: false },
      mobile: { slot: 'right-top', order: 2, showLabel: false }
    }],
    panels: [{
      id: 'mapStyles',
      desktop: { slot: MAP_STYLES_BUTTON_ID, width: '400px', modal: true },
      tablet: { slot: MAP_STYLES_BUTTON_ID, width: '400px', modal: true },
      mobile: { slot: 'drawer', modal: true }
    }]
  }
}

export const initialiseMapStylePlugin = (osAccountNumber) => {
  const currentYear = new Date().getFullYear()
  const copyRightNotice = `&copy; Crown copyright and database rights ${currentYear} OS ${osAccountNumber}`
  const attribution = `<a href="/os-terms" class="os-credits__link">${copyRightNotice}</a>`
  pluginConfig.mapStyles.forEach(mapStyle => { mapStyle.attribution = attribution })
  return pluginConfig
}

export const mapStylePlugin = () => createMapStylesPlugin(pluginConfig)
