const loadTokens = () => {
  jest.resetModules()
  return require('./getEsriToken.js')
}

describe('getEsriToken', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should fetch a new token when none is cached', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ token: 'esri-token-1' })
    })
    const { getEsriToken } = loadTokens()

    const token = await getEsriToken()

    expect(globalThis.fetch).toHaveBeenCalledWith('/esri-token')
    expect(token).toBe('esri-token-1')
  })

  it('should reuse the cached token on subsequent calls', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ token: 'esri-token-1' })
    })
    const { getEsriToken } = loadTokens()

    await getEsriToken()
    await getEsriToken()

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('should force a refresh with the refresh query string when requested', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ token: 'esri-token-2' })
    })
    const { getEsriToken } = loadTokens()

    await getEsriToken()
    await getEsriToken(true)

    expect(globalThis.fetch).toHaveBeenLastCalledWith('/esri-token?refresh=true')
  })

  it('should log and leave the token unset when the request fails', async () => {
    globalThis.fetch.mockRejectedValue(new Error('network error'))
    const { getEsriToken } = loadTokens()

    const token = await getEsriToken()

    expect(token).toBeUndefined()
  })
})
