// Shared mock - see client/js/__test-helpers__ (captured once so the same jest.fn()
// instance survives the jest.resetModules() calls used to reload search.js per test)
const mockInteractiveMapMocks = require('../../../__test-helpers__/interactiveMapMocks')
jest.mock('@defra/interactive-map/plugins/search', () => mockInteractiveMapMocks.searchPlugin)
const mockCreateSearchPlugin = mockInteractiveMapMocks.searchPlugin.default

const buildInteractiveMap = () => {
  const handlers = {}
  return {
    on: jest.fn((event, handler) => { handlers[event] = handler }),
    trigger: (event, ...args) => handlers[event](...args),
    addMarker: jest.fn()
  }
}

const loadSearchPlugin = () => {
  jest.resetModules()
  mockCreateSearchPlugin.mockReturnValue({})
  return require('./search.js')
}

describe('searchPlugin', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should return the shared plugin config from initialiseSearchPlugin', () => {
    const { initialiseSearchPlugin } = loadSearchPlugin()

    const config = initialiseSearchPlugin()

    expect(config).toEqual(expect.objectContaining({
      placeholder: 'Search for a place in England',
      regions: ['england'],
      width: '300px',
      showMarker: false
    }))
    expect(config.osNamesURL).toContain('https://api.os.uk/search/names/v1/find')
  })

  it('should build the plugin with the expected parameters, ', () => {
    const { searchPlugin } = loadSearchPlugin()
    searchPlugin()

    expect(mockCreateSearchPlugin).toHaveBeenCalledWith(expect.objectContaining({
      placeholder: 'Search for a place in England',
      regions: ['england'],
      width: '300px',
      showMarker: false
    }))
    const config = mockCreateSearchPlugin.mock.calls[0][0]
    expect(config.osNamesURL).toContain('https://api.os.uk/search/names/v1/find')
  })

  it('should add a single search button', () => {
    const { searchPlugin } = loadSearchPlugin()
    searchPlugin()

    const config = mockCreateSearchPlugin.mock.calls[0][0]
    expect(config.manifest.buttons).toEqual([expect.objectContaining({ id: 'search' })])
  })

  describe('hideButton / showButton', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="map-search"></div>'
    })

    it('should hide the search button', () => {
      const { searchPlugin } = loadSearchPlugin()
      const plugin = searchPlugin()

      plugin.hideButton()

      expect(document.getElementById('map-search').style.display).toBe('none')
    })

    it('should show the search button', () => {
      const { searchPlugin } = loadSearchPlugin()
      const plugin = searchPlugin()

      plugin.showButton()

      expect(document.getElementById('map-search').style.display).toBe('flex')
    })

    it('should not throw when the button is not present', () => {
      document.body.innerHTML = ''
      const { searchPlugin } = loadSearchPlugin()
      const plugin = searchPlugin()

      expect(() => plugin.hideButton()).not.toThrow()
      expect(() => plugin.showButton()).not.toThrow()
    })
  })

  describe('onOpen / onClosed', () => {
    it('should hide the info panel marker when search opens', () => {
      const { searchPlugin } = loadSearchPlugin()
      const plugin = searchPlugin()
      plugin.plugins = { interact: { hideInfoPanelMarker: jest.fn(), hideInfoPanel: jest.fn() } }

      plugin.onOpen()

      expect(plugin.plugins.interact.hideInfoPanelMarker).toHaveBeenCalled()
    })

    it('should hide the info panel when search closes', () => {
      const { searchPlugin } = loadSearchPlugin()
      const plugin = searchPlugin()
      plugin.plugins = { interact: { hideInfoPanelMarker: jest.fn(), hideInfoPanel: jest.fn() } }

      plugin.onClosed()

      expect(plugin.plugins.interact.hideInfoPanel).toHaveBeenCalled()
    })

    it('should not throw when there are no plugins attached yet', () => {
      const { searchPlugin } = loadSearchPlugin()
      const plugin = searchPlugin()

      expect(() => plugin.onOpen()).not.toThrow()
      expect(() => plugin.onClosed()).not.toThrow()
    })
  })

  describe('attach', () => {
    it('should register handlers for search:open, search:close and search:match', () => {
      const { searchPlugin } = loadSearchPlugin()
      const plugin = searchPlugin()
      const interactiveMap = buildInteractiveMap()

      plugin.attach(interactiveMap)

      expect(interactiveMap.on).toHaveBeenCalledWith('search:open', plugin.onOpen)
      expect(interactiveMap.on).toHaveBeenCalledWith('search:close', plugin.onClosed)
      expect(interactiveMap.on).toHaveBeenCalledWith('search:match', expect.any(Function))
    })

    it('should add a labelled marker styled with the literal search pin colours on search:match', () => {
      const { searchPlugin } = loadSearchPlugin()
      const plugin = searchPlugin()
      const interactiveMap = buildInteractiveMap()
      plugin.attach(interactiveMap)

      interactiveMap.trigger('search:match', { point: [1, 2], text: 'Bristol' })

      expect(interactiveMap.addMarker).toHaveBeenCalledWith('search', [1, 2], {
        label: 'Bristol',
        showLabel: true,
        backgroundColor: { outdoor: '#ca3535', dark: '#ffffff' },
        foregroundColor: { outdoor: '#ffffff', dark: '#ca3535' }
      })
    })
  })
})
