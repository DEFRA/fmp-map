// Shared mock - see client/js/__test-helpers__ (captured once so the same jest.fn()
// instance survives the jest.resetModules() calls used to reload scale-bar.js per test)
const mockInteractiveMapMocks = require('../../../__test-helpers__/interactiveMapMocks')
jest.mock('@defra/interactive-map/plugins/scale-bar', () => mockInteractiveMapMocks.scaleBarPlugin)
const mockCreateScaleBarPlugin = mockInteractiveMapMocks.scaleBarPlugin.default

const loadScaleBarPlugin = () => {
  jest.resetModules()
  mockCreateScaleBarPlugin.mockReturnValue({ pluginInstance: true })
  return require('./scale-bar.js')
}

describe('scaleBarPlugin', () => {
  it('should return the shared plugin config using metric units from initialiseScaleBarPlugin', () => {
    const { initialiseScaleBarPlugin } = loadScaleBarPlugin()

    expect(initialiseScaleBarPlugin()).toEqual({ units: 'metric' })
  })

  it('should build the plugin using metric units', () => {
    const { scaleBarPlugin } = loadScaleBarPlugin()

    scaleBarPlugin()

    expect(mockCreateScaleBarPlugin).toHaveBeenCalledWith({ units: 'metric' })
  })

  it('should return the plugin instance built by createScaleBarPlugin', () => {
    const { scaleBarPlugin } = loadScaleBarPlugin()

    const result = scaleBarPlugin()

    expect(result).toEqual({ pluginInstance: true })
  })
})
