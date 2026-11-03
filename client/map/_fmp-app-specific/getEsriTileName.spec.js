const { getEsriTileName } = require('./getEsriTileName.js')

describe('getEsriTileName (fmp-app)', () => {
  it.each(['flood-zones', 'sw-low', 'main-rivers', 'anything-else'])('should return the key "%s" unchanged', (key) => {
    expect(getEsriTileName(key)).toBe(key)
  })
})
