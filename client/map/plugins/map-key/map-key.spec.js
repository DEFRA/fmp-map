// Shared mocks - see client/js/__test-helpers__ (captured once so the same jest.fn()
// instances survive the jest.resetModules() calls used to reload map-key.js per test)
const mockInteractiveMapMocks = require('../../../__test-helpers__/interactiveMapMocks')
// virtual mock: this subpath has no CJS "require" export condition in the package
jest.mock('@defra/interactive-map/plugins/map-key', () => mockInteractiveMapMocks.mapKeyPlugin, { virtual: true })
const mockCreateMapKeyPlugin = mockInteractiveMapMocks.mapKeyPlugin.default

const mockSiteBoundary = { feature: null, onSetFeature: null }
jest.mock('../../interactive-map-helpers/siteBoundary.js', () => ({
  siteBoundary: mockSiteBoundary
}))

const mockMapState = { interactiveMap: null }
jest.mock('../../interactive-map-helpers/mapState.js', () => ({
  mapState: mockMapState
}))

const loadMapKeyPlugin = () => {
  jest.resetModules()
  mockCreateMapKeyPlugin.mockReturnValue({
    addSymbol: jest.fn(),
    removeSymbol: jest.fn()
  })
  return require('./map-key.js')
}

describe('mapKeyPlugin', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    mockSiteBoundary.feature = null
    mockMapState.interactiveMap = null
  })

  it('should return the shared plugin config from initialiseMapKeyPlugin', () => {
    const { initialiseMapKeyPlugin } = loadMapKeyPlugin()

    const config = initialiseMapKeyPlugin()

    expect(config.groups['surface-water-depth-in-millimetres']).toEqual({
      groupLabel: 'Surface water depth in millimetres',
      groupStyle: 'horizontal-ramp'
    })
    expect(config.manifest.panels[0].id).toBe('mapKey')
    expect(config.manifest.buttons[0].id).toBe('mapKey')
  })

  it('should build the plugin with a horizontal-ramp surface water depth group and a mapKey panel/button', () => {
    const { mapKeyPlugin } = loadMapKeyPlugin()
    mapKeyPlugin()

    const config = mockCreateMapKeyPlugin.mock.calls[0][0]
    expect(config.groups['surface-water-depth-in-millimetres']).toEqual({
      groupLabel: 'Surface water depth in millimetres',
      groupStyle: 'horizontal-ramp'
    })
    expect(config.manifest.panels[0].id).toBe('mapKey')
    expect(config.manifest.buttons[0].id).toBe('mapKey')
  })

  describe('hideButton / showButton', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="map-map-key"></div>'
    })

    it('should hide the map key button', () => {
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()

      plugin.hideButton()

      expect(document.getElementById('map-map-key').style.display).toBe('none')
    })

    it('should show the map key button', () => {
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()

      plugin.showButton()

      expect(document.getElementById('map-map-key').style.display).toBe('flex')
    })

    it('should not throw when the button is not present', () => {
      document.body.innerHTML = ''
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()

      expect(() => plugin.hideButton()).not.toThrow()
      expect(() => plugin.showButton()).not.toThrow()
    })
  })

  describe('hidePanel / reShowPanel', () => {
    it('should warn and do nothing when there is no interactiveMap instance', () => {
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()
      jest.spyOn(console, 'warn').mockImplementation(() => {})

      plugin.hidePanel('id-1')

      expect(console.warn).toHaveBeenCalled()
    })

    it('should hide the mapKey panel when it is currently visible', () => {
      const keyPanel = document.createElement('div')
      keyPanel.id = 'map-panel-map-key'
      keyPanel.checkVisibility = () => true
      document.body.appendChild(keyPanel)
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()
      const hidePanel = jest.fn()
      mockMapState.interactiveMap = { hidePanel, showPanel: jest.fn() }

      plugin.hidePanel('id-1')

      expect(hidePanel).toHaveBeenCalledWith('mapKey')
    })

    it('should not hide the mapKey panel when it is not currently visible', () => {
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()
      const hidePanel = jest.fn()
      mockMapState.interactiveMap = { hidePanel, showPanel: jest.fn() }

      plugin.hidePanel('id-1')

      expect(hidePanel).not.toHaveBeenCalled()
    })

    it('should re-show the mapKey panel once the id that hid it re-shows it', () => {
      const keyPanel = document.createElement('div')
      keyPanel.id = 'map-panel-map-key'
      keyPanel.checkVisibility = () => true
      document.body.appendChild(keyPanel)
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()
      const showPanel = jest.fn()
      mockMapState.interactiveMap = { hidePanel: jest.fn(), showPanel }
      plugin.hidePanel('id-1')

      plugin.reShowPanel('id-1')

      expect(showPanel).toHaveBeenCalledWith('mapKey')
    })

    it('should not re-show the mapKey panel while another id still has it hidden', () => {
      const keyPanel = document.createElement('div')
      keyPanel.id = 'map-panel-map-key'
      keyPanel.checkVisibility = () => true
      document.body.appendChild(keyPanel)
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()
      const showPanel = jest.fn()
      mockMapState.interactiveMap = { hidePanel: jest.fn(), showPanel }
      plugin.hidePanel('id-1')
      plugin.hidePanel('id-2')

      plugin.reShowPanel('id-1')

      expect(showPanel).not.toHaveBeenCalled()

      plugin.reShowPanel('id-2')
      expect(showPanel).toHaveBeenCalledWith('mapKey')
    })

    it('should do nothing when re-showing an id that never hid the panel', () => {
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()
      const showPanel = jest.fn()
      mockMapState.interactiveMap = { hidePanel: jest.fn(), showPanel }

      plugin.reShowPanel('never-hidden')

      expect(showPanel).not.toHaveBeenCalled()
    })
  })

  describe('attach', () => {
    it('should update the site boundary key symbol when the map key becomes ready', () => {
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()
      const handlers = {}
      plugin.interactiveMap = { on: jest.fn((event, handler) => { handlers[event] = handler }) }
      mockSiteBoundary.feature = { id: 'boundary' }

      plugin.attach()
      handlers['map-key:ready']()

      expect(plugin.addSymbol).toHaveBeenCalledWith(expect.objectContaining({ id: 'site-boundary' }))
    })
  })

  describe('siteBoundary.onSetFeature', () => {
    it('should add the site boundary key symbol when a feature is set', () => {
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()

      mockSiteBoundary.onSetFeature({ id: 'boundary' })

      expect(plugin.addSymbol).toHaveBeenCalledWith(expect.objectContaining({
        id: 'site-boundary',
        label: 'Location boundary'
      }))
    })

    it('should remove the site boundary key symbol when the feature is cleared', () => {
      const { mapKeyPlugin } = loadMapKeyPlugin()
      const plugin = mapKeyPlugin()

      mockSiteBoundary.onSetFeature(null)

      expect(plugin.removeSymbol).toHaveBeenCalledWith(expect.objectContaining({ id: 'site-boundary' }))
    })
  })
})
