const loadTokens = () => {
  jest.resetModules()
  return require('./getOsToken.js')
}

describe('getOsToken', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should fetch and cache a new OS token when none is cached', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ access_token: 'os-token-1', expires_in: 3600 })
    })
    const { getOsToken } = loadTokens()

    const result = await getOsToken()

    expect(globalThis.fetch).toHaveBeenCalledWith('/os-token', expect.objectContaining({ method: 'GET' }))
    expect(result.token).toBe('os-token-1')
  })

  it('should reuse the cached token while it has not expired', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ access_token: 'os-token-1', expires_in: 3600 })
    })
    const { getOsToken } = loadTokens()

    await getOsToken()
    await getOsToken()

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('should log and leave the token unset when the request fails', async () => {
    globalThis.fetch.mockRejectedValue(new Error('network error'))
    const { getOsToken } = loadTokens()

    const result = await getOsToken()

    expect(result.token).toBeUndefined()
  })
})
