const loadTokens = () => {
  jest.resetModules()
  return require('./transformSearchRequest.js')
}

describe('transformSearchRequest', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should attach an OS bearer token header for other OS api requests', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ access_token: 'os-token-1', expires_in: 3600 })
    })
    const { transformSearchRequest } = loadTokens()

    const result = await transformSearchRequest({ url: 'https://api.os.uk/maps/raster/v1/wmts', options: { headers: { foo: 'bar' } } })

    expect(result).toEqual({
      url: 'https://api.os.uk/maps/raster/v1/wmts',
      options: { headers: { foo: 'bar', Authorization: 'Bearer os-token-1' } }
    })
  })
})
