const mockFmpMap = { name: 'FmpMap' }
jest.mock('./fmpMap.js', () => ({
  FmpMap: mockFmpMap
}))

describe('map index', () => {
  it('should expose FmpMap on globalThis', () => {
    jest.resetModules()
    delete globalThis.FmpMap

    require('./index.js')

    expect(globalThis.FmpMap).toBe(mockFmpMap)
  })
})
