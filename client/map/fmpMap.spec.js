const mockGetDefraMapConfig = jest.fn()
const mockSetupEsriConfig = jest.fn()
jest.mock('./tokens.js', () => ({
  setupEsriConfig: (...args) => mockSetupEsriConfig(...args),
  getDefraMapConfig: (...args) => mockGetDefraMapConfig(...args)
}))

const mockSiteBoundary = { buffedExtents: null }
jest.mock('./interactive-map-helpers/siteBoundary.js', () => ({
  siteBoundary: mockSiteBoundary
}))

const mockMapState = { attach: jest.fn(), defraMapConfig: null }
jest.mock('./interactive-map-helpers/mapState.js', () => ({
  mapState: mockMapState
}))

const mockInitialisePlugins = jest.fn()
const mockAttachInteractiveMapToPlugins = jest.fn()
const mockGetPluginValues = jest.fn()
const mockUpdatePlugin = jest.fn()
const mockCreatePlugins = jest.fn()
jest.mock('./plugins/initialisePlugins.js', () => ({
  initialisePlugins: (...args) => mockInitialisePlugins(...args),
  attachInteractiveMapToPlugins: (...args) => mockAttachInteractiveMapToPlugins(...args),
  getPluginValues: (...args) => mockGetPluginValues(...args),
  updatePlugin: (...args) => mockUpdatePlugin(...args),
  createPlugins: (...args) => mockCreatePlugins(...args)
}))

// Shared @defra/interactive-map mocks - see client/js/__test-helpers__/interactiveMapMocks.js
const mockInteractiveMapMocks = require('../__test-helpers__/interactiveMapMocks')
jest.mock('@defra/interactive-map', () => mockInteractiveMapMocks.interactiveMap)
// virtual mock: this subpath has no CJS "require" export condition in the package
jest.mock('@defra/interactive-map/providers/esri', () => mockInteractiveMapMocks.esriProvider, { virtual: true })

const mockInteractiveMapInstance = { on: jest.fn(), addButton: jest.fn() }
const mockInteractiveMapConstructor = mockInteractiveMapMocks.interactiveMap.default
const mockEsriProvider = mockInteractiveMapMocks.esriProvider.default

const loadFmpMap = () => {
  jest.resetModules()
  return require('./fmpMap.js').FmpMap
}

describe('FmpMap', () => {
  beforeEach(() => {
    mockSiteBoundary.buffedExtents = null
    mockGetDefraMapConfig.mockResolvedValue({ someConfig: true })
    mockInteractiveMapConstructor.mockImplementation(function () {
      return mockInteractiveMapInstance
    })
  })

  it('should throw when constructed before initialise has resolved', () => {
    const FmpMap = loadFmpMap()

    expect(() => new FmpMap({})).toThrow('You must await FmpMap.initialise() before creating an FmpMap instance')
  })

  describe('initialise', () => {
    it('should resolve the defra map config and store it on the class and mapState', async () => {
      const FmpMap = loadFmpMap()
      const defraMapConfig = { some: 'config' }
      mockGetDefraMapConfig.mockResolvedValue(defraMapConfig)

      const result = await FmpMap.initialise()

      expect(FmpMap.defraMapConfig).toBe(defraMapConfig)
      expect(mockMapState.defraMapConfig).toBe(defraMapConfig)
      expect(result).toBe(defraMapConfig)
    })

    it('should initialise the plugins with the resolved defra map config', async () => {
      const FmpMap = loadFmpMap()
      const defraMapConfig = { some: 'config' }
      mockGetDefraMapConfig.mockResolvedValue(defraMapConfig)

      await FmpMap.initialise()

      expect(mockInitialisePlugins).toHaveBeenCalledWith(defraMapConfig)
    })
  })

  describe('constructor', () => {
    it('should build the interactive map with the default England extent when there is no boundary', async () => {
      const FmpMap = loadFmpMap()
      await FmpMap.initialise()

      // eslint-disable-next-line no-new
      new FmpMap({
        extent: [50000, 40000, 400000, 650000],
        place: 'England',
        minZoom: 6,
        maxZoom: 20
      })

      expect(mockInteractiveMapConstructor).toHaveBeenCalledWith('map', expect.objectContaining({
        extent: [50000, 40000, 400000, 650000],
        place: 'England',
        minZoom: 6,
        maxZoom: 20
      }))
    })

    it('should use the site boundary buffed extents when available', async () => {
      const FmpMap = loadFmpMap()
      await FmpMap.initialise()
      mockSiteBoundary.buffedExtents = [1, 2, 3, 4]

      // eslint-disable-next-line no-new
      new FmpMap({ extent: [50000, 40000, 400000, 650000] })

      expect(mockInteractiveMapConstructor).toHaveBeenCalledWith('map', expect.objectContaining({
        extent: [1, 2, 3, 4]
      }))
    })

    it('should forward any other interactiveMapOptions to the interactive map', async () => {
      const FmpMap = loadFmpMap()
      await FmpMap.initialise()

      // eslint-disable-next-line no-new
      new FmpMap({ plugins: ['plugin-a'] })

      expect(mockInteractiveMapConstructor).toHaveBeenCalledWith('map', expect.objectContaining({
        plugins: ['plugin-a']
      }))
    })

    it('should attach the interactive map to mapState and the plugins', async () => {
      const FmpMap = loadFmpMap()
      await FmpMap.initialise()

      // eslint-disable-next-line no-new
      new FmpMap({})

      expect(mockMapState.attach).toHaveBeenCalledWith(mockInteractiveMapInstance)
      expect(mockAttachInteractiveMapToPlugins).toHaveBeenCalledWith(mockInteractiveMapInstance)
    })

    it('should add a help button once the interactive map reports it is ready', async () => {
      const FmpMap = loadFmpMap()
      await FmpMap.initialise()

      // eslint-disable-next-line no-new
      new FmpMap({})
      const readyHandler = mockInteractiveMapInstance.on.mock.calls.find(([name]) => name === 'app:ready')[1]
      readyHandler()

      expect(mockInteractiveMapInstance.addButton).toHaveBeenCalledWith('help', expect.objectContaining({
        label: 'Help',
        href: '/map-help'
      }))
    })

    it('should configure the esri provider with the setupEsriConfig helper', async () => {
      const FmpMap = loadFmpMap()
      await FmpMap.initialise()

      // eslint-disable-next-line no-new
      new FmpMap({})

      const providerArgs = mockEsriProvider.mock.calls[0][0]
      expect(typeof providerArgs.setupConfig).toBe('function')

      providerArgs.setupConfig('some-config')
      expect(mockSetupEsriConfig).toHaveBeenCalledWith('some-config')
    })
  })

  describe('static helpers', () => {
    it('should expose getPluginValues, updatePlugin and createPlugins from initialisePlugins.js', () => {
      const FmpMap = loadFmpMap()

      FmpMap.getPluginValues('datasets')
      FmpMap.updatePlugin('datasets', { visible: false })
      FmpMap.createPlugins()

      expect(mockGetPluginValues).toHaveBeenCalledWith('datasets')
      expect(mockUpdatePlugin).toHaveBeenCalledWith('datasets', { visible: false })
      expect(mockCreatePlugins).toHaveBeenCalledWith()
    })
  })
})
