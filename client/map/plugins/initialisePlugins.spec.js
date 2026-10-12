// jsdom's test environment does not expose structuredClone on the global object
globalThis.structuredClone = globalThis.structuredClone || ((value) => JSON.parse(JSON.stringify(value)))

const mockScaleBarValues = { name: 'scaleBarValues' }
const mockScaleBarInstance = { name: 'scaleBar' }
const mockInitialiseScaleBarPlugin = jest.fn()
const mockScaleBarPlugin = jest.fn()
jest.mock('./scale-bar/scale-bar.js', () => ({
  initialiseScaleBarPlugin: (...args) => mockInitialiseScaleBarPlugin(...args),
  scaleBarPlugin: (...args) => mockScaleBarPlugin(...args)
}))

const mockSearchValues = { name: 'searchValues' }
const mockSearchPluginInstance = { name: 'search' }
const mockInitialiseSearchPlugin = jest.fn()
const mockSearchPlugin = jest.fn()
jest.mock('./search/search.js', () => ({
  initialiseSearchPlugin: (...args) => mockInitialiseSearchPlugin(...args),
  searchPlugin: (...args) => mockSearchPlugin(...args)
}))

const mockMapKeyValues = { name: 'mapKeyValues' }
const mockMapKeyPluginInstance = { name: 'mapKey' }
const mockInitialiseMapKeyPlugin = jest.fn()
const mockMapKeyPlugin = jest.fn()
jest.mock('./map-key/map-key.js', () => ({
  initialiseMapKeyPlugin: (...args) => mockInitialiseMapKeyPlugin(...args),
  mapKeyPlugin: (...args) => mockMapKeyPlugin(...args)
}))

const mockMenuValues = { name: 'menuValues' }
const mockMenuPluginInstance = { name: 'menu' }
const mockInitialiseMenuPlugin = jest.fn()
const mockMenuPlugin = jest.fn()
jest.mock('./menu/menu.js', () => ({
  initialiseMenuPlugin: (...args) => mockInitialiseMenuPlugin(...args),
  menuPlugin: (...args) => mockMenuPlugin(...args)
}))

const mockInteractValues = { name: 'interactValues' }
const mockInteractPluginInstance = { name: 'interact' }
const mockInitialiseInteractPlugin = jest.fn()
const mockInteractPlugin = jest.fn()
jest.mock('./interact/interact.js', () => ({
  initialiseInteractPlugin: (...args) => mockInitialiseInteractPlugin(...args),
  interactPlugin: (...args) => mockInteractPlugin(...args)
}))

const mockMapStyleValues = { name: 'mapStyleValues' }
const mockMapStyleInstance = { name: 'mapStyle' }
const mockInitialiseMapStylePlugin = jest.fn()
const mockMapStylePlugin = jest.fn()
jest.mock('./map-styles/map-styles.js', () => ({
  initialiseMapStylePlugin: (...args) => mockInitialiseMapStylePlugin(...args),
  mapStylePlugin: (...args) => mockMapStylePlugin(...args)
}))

const mockDatasetsValues = { name: 'datasetsValues' }
const mockDatasetsInstance = { name: 'datasets' }
const mockInitialiseDatasetsPlugin = jest.fn()
const mockDatasetsPlugin = jest.fn()
jest.mock('./datasets/datasetsPlugin.js', () => ({
  initialiseDatasetsPlugin: (...args) => mockInitialiseDatasetsPlugin(...args),
  datasetsPlugin: (...args) => mockDatasetsPlugin(...args)
}))

const mockOpacitySliderValues = { name: 'opacitySliderValues' }
const mockOpacitySliderInstance = { name: 'opacitySlider' }
const mockInitialiseOpacitySliderPlugin = jest.fn()
const mockOpacitySliderPlugin = jest.fn()
jest.mock('./opacity-slider/opacity-slider.js', () => ({
  initialiseOpacitySliderPlugin: (...args) => mockInitialiseOpacitySliderPlugin(...args),
  opacitySliderPlugin: (...args) => mockOpacitySliderPlugin(...args)
}))

const mockDrawValues = { name: 'drawValues' }
const mockFrameValues = { name: 'frameValues' }
const mockDrawPluginInstance = { name: 'draw' }
const mockFramePluginInstance = { name: 'frame' }
const mockInitialiseDrawPlugin = jest.fn()
const mockInitialiseFramePlugin = jest.fn()
const mockDrawAndFramePlugin = jest.fn()
jest.mock('./draw/drawPlugin.js', () => ({
  initialiseDrawPlugin: (...args) => mockInitialiseDrawPlugin(...args),
  initialiseFramePlugin: (...args) => mockInitialiseFramePlugin(...args),
  drawAndFramePlugin: (...args) => mockDrawAndFramePlugin(...args)
}))

const loadInitialisePlugins = () => {
  jest.resetModules()
  return require('./initialisePlugins.js')
}

describe('initialisePlugins', () => {
  const defraMapConfig = { OS_ACCOUNT_NUMBER: 'AC0000807064' }

  beforeEach(() => {
    mockInitialiseScaleBarPlugin.mockReturnValue(mockScaleBarValues)
    mockInitialiseSearchPlugin.mockReturnValue(mockSearchValues)
    mockInitialiseMapKeyPlugin.mockReturnValue(mockMapKeyValues)
    mockInitialiseMenuPlugin.mockReturnValue(mockMenuValues)
    mockInitialiseInteractPlugin.mockReturnValue(mockInteractValues)
    mockInitialiseMapStylePlugin.mockReturnValue(mockMapStyleValues)
    mockInitialiseDatasetsPlugin.mockReturnValue(mockDatasetsValues)
    mockInitialiseOpacitySliderPlugin.mockReturnValue(mockOpacitySliderValues)
    mockInitialiseDrawPlugin.mockReturnValue(mockDrawValues)
    mockInitialiseFramePlugin.mockReturnValue(mockFrameValues)

    mockScaleBarPlugin.mockReturnValue(mockScaleBarInstance)
    mockSearchPlugin.mockReturnValue(mockSearchPluginInstance)
    mockMapKeyPlugin.mockReturnValue(mockMapKeyPluginInstance)
    mockMenuPlugin.mockReturnValue(mockMenuPluginInstance)
    mockInteractPlugin.mockReturnValue(mockInteractPluginInstance)
    mockMapStylePlugin.mockReturnValue(mockMapStyleInstance)
    mockDatasetsPlugin.mockReturnValue(mockDatasetsInstance)
    mockOpacitySliderPlugin.mockReturnValue(mockOpacitySliderInstance)
    mockDrawAndFramePlugin.mockReturnValue({ drawPlugin: mockDrawPluginInstance, framePlugin: mockFramePluginInstance })
  })

  describe('initialisePlugins', () => {
    it('should build the datasets plugin values from the defra map config', () => {
      const { initialisePlugins, getPluginValues } = loadInitialisePlugins()

      initialisePlugins(defraMapConfig)

      expect(mockInitialiseDatasetsPlugin).toHaveBeenCalledWith(defraMapConfig)
      expect(getPluginValues('datasets')).toEqual(mockDatasetsValues)
    })

    it('should build the map style plugin values from the OS account number', () => {
      const { initialisePlugins, getPluginValues } = loadInitialisePlugins()

      initialisePlugins(defraMapConfig)

      expect(mockInitialiseMapStylePlugin).toHaveBeenCalledWith(defraMapConfig.OS_ACCOUNT_NUMBER)
      expect(getPluginValues('mapStyle')).toEqual(mockMapStyleValues)
    })

    it('should build every other plugin values with no arguments', () => {
      const { initialisePlugins, getPluginValues } = loadInitialisePlugins()

      initialisePlugins(defraMapConfig)

      expect(mockInitialiseOpacitySliderPlugin).toHaveBeenCalledWith()
      expect(mockInitialiseMapKeyPlugin).toHaveBeenCalledWith()
      expect(mockInitialiseMenuPlugin).toHaveBeenCalledWith()
      expect(mockInitialiseScaleBarPlugin).toHaveBeenCalledWith()
      expect(mockInitialiseSearchPlugin).toHaveBeenCalledWith()
      expect(mockInitialiseDrawPlugin).toHaveBeenCalledWith()
      expect(mockInitialiseFramePlugin).toHaveBeenCalledWith()
      expect(mockInitialiseInteractPlugin).toHaveBeenCalledWith()

      expect(getPluginValues()).toEqual({
        datasets: mockDatasetsValues,
        opacitySlider: mockOpacitySliderValues,
        mapKey: mockMapKeyValues,
        menu: mockMenuValues,
        mapStyle: mockMapStyleValues,
        scaleBar: mockScaleBarValues,
        search: mockSearchValues,
        draw: mockDrawValues,
        frame: mockFrameValues,
        interact: mockInteractValues
      })
    })
  })

  describe('getPluginValues', () => {
    it('should return null for a plugin that has not been initialised', () => {
      const { getPluginValues } = loadInitialisePlugins()

      expect(getPluginValues('datasets')).toBeNull()
    })

    it('should return a clone, not a reference, of the plugin values', () => {
      const { initialisePlugins, getPluginValues } = loadInitialisePlugins()

      initialisePlugins(defraMapConfig)
      const values = getPluginValues('datasets')
      values.changed = true

      expect(getPluginValues('datasets')).not.toHaveProperty('changed')
    })
  })

  describe('updatePlugin', () => {
    it('should merge overrides into the existing plugin values', () => {
      const { initialisePlugins, updatePlugin, getPluginValues } = loadInitialisePlugins()

      initialisePlugins(defraMapConfig)
      updatePlugin('datasets', { extra: 'value' })

      expect(getPluginValues('datasets')).toEqual({ ...mockDatasetsValues, extra: 'value' })
    })

    it('should do nothing when the plugin has not been initialised', () => {
      const { updatePlugin, getPluginValues } = loadInitialisePlugins()

      updatePlugin('datasets', { extra: 'value' })

      expect(getPluginValues('datasets')).toBeNull()
    })
  })

  describe('createPlugins', () => {
    it('should build the opacity slider plugin wired to the datasets plugin', () => {
      const { createPlugins } = loadInitialisePlugins()

      createPlugins()

      expect(mockOpacitySliderPlugin).toHaveBeenCalledWith(mockDatasetsInstance)
    })

    it('should return every plugin in a single array', () => {
      const { createPlugins } = loadInitialisePlugins()

      const pluginArray = createPlugins()

      expect(pluginArray).toEqual([
        mockDatasetsInstance,
        mockOpacitySliderInstance,
        mockMapKeyPluginInstance,
        mockMenuPluginInstance,
        mockMapStyleInstance,
        mockScaleBarInstance,
        mockSearchPluginInstance,
        mockDrawPluginInstance,
        mockFramePluginInstance,
        mockInteractPluginInstance
      ])
    })

    it('should give every plugin a reference to the full set of named plugins', () => {
      const { createPlugins } = loadInitialisePlugins()

      const pluginArray = createPlugins()

      pluginArray.forEach((plugin) => {
        expect(plugin.plugins).toEqual(expect.objectContaining({
          datasets: mockDatasetsInstance,
          opacitySlider: mockOpacitySliderInstance,
          mapKey: mockMapKeyPluginInstance,
          menu: mockMenuPluginInstance,
          mapStyle: mockMapStyleInstance,
          scaleBar: mockScaleBarInstance,
          search: mockSearchPluginInstance,
          draw: mockDrawPluginInstance,
          frame: mockFramePluginInstance,
          interact: mockInteractPluginInstance
        }))
      })
    })
  })

  describe('attachInteractiveMapToPlugins', () => {
    it('should give every plugin a reference to the interactive map', () => {
      const { createPlugins, attachInteractiveMapToPlugins } = loadInitialisePlugins()
      const pluginArray = createPlugins()
      const interactiveMap = { name: 'interactiveMap' }

      attachInteractiveMapToPlugins(interactiveMap)

      pluginArray.forEach((plugin) => {
        expect(plugin.interactiveMap).toBe(interactiveMap)
      })
    })

    it("should call each plugin's attach method, if it has one, with the interactive map", () => {
      const { createPlugins, attachInteractiveMapToPlugins } = loadInitialisePlugins()
      mockDatasetsInstance.attach = jest.fn()
      createPlugins()
      const interactiveMap = { name: 'interactiveMap' }

      attachInteractiveMapToPlugins(interactiveMap)

      expect(mockDatasetsInstance.attach).toHaveBeenCalledWith(interactiveMap)
      delete mockDatasetsInstance.attach
    })

    it('should not throw for plugins without an attach method', () => {
      const { createPlugins, attachInteractiveMapToPlugins } = loadInitialisePlugins()
      createPlugins()
      const interactiveMap = { name: 'interactiveMap' }

      expect(() => attachInteractiveMapToPlugins(interactiveMap)).not.toThrow()
    })
  })
})
