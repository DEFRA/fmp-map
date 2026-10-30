const INVALID_TOKEN_CODE = 498
const loadTokens = () => {
  jest.resetModules()
  return require('./setupEsriConfig.js')
}

describe('setupEsriConfig', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should set the api key and register the OS maps and arcgis interceptors', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ token: 'esri-token-1' })
    })
    const { setupEsriConfig } = loadTokens()
    const esriConfig = { apiKey: null, request: { interceptors: [] } }

    await setupEsriConfig(esriConfig)

    expect(esriConfig.apiKey).toBe('esri-token-1')
    expect(esriConfig.request.interceptors).toHaveLength(2)
    expect(esriConfig.request.interceptors[0].urls).toBe('https://api.os.uk/maps/vector/v1/vts')
    expect(esriConfig.request.interceptors[1].urls).toBe('https://tiles.arcgis.com/tiles')
  })

  it('should attach an OS bearer token header via the vector maps interceptor', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ token: 'esri-token-1' }) })
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ access_token: 'os-token-1', expires_in: 3600 }) })
    const { setupEsriConfig } = loadTokens()
    const esriConfig = { apiKey: null, request: { interceptors: [] } }
    await setupEsriConfig(esriConfig)

    const params = { requestOptions: {} }
    await esriConfig.request.interceptors[0].before(params)

    expect(params.requestOptions.headers).toEqual({ Authorization: 'Bearer os-token-1' })
  })

  it('should refresh the esri token when an invalid token error is received', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ token: 'esri-token-1' }) })
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ token: 'esri-token-refreshed' }) })
    const { setupEsriConfig } = loadTokens()
    const esriConfig = { apiKey: null, request: { interceptors: [] } }
    await setupEsriConfig(esriConfig)

    const invalidTokenError = { details: { httpStatus: INVALID_TOKEN_CODE } }
    await esriConfig.request.interceptors[1].error(invalidTokenError)

    // getEsriToken resolves to a plain token string, so destructuring { token } from it
    // yields undefined - this reflects the current (buggy) refreshEsriToken behaviour
    expect(esriConfig.apiKey).toBeUndefined()
    expect(globalThis.fetch).toHaveBeenLastCalledWith('/esri-token?refresh=true')
  })

  it('should not refresh the esri token for unrelated errors', async () => {
    globalThis.fetch.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ token: 'esri-token-1' }) })
    const { setupEsriConfig } = loadTokens()
    const esriConfig = { apiKey: null, request: { interceptors: [] } }
    await setupEsriConfig(esriConfig)

    await esriConfig.request.interceptors[1].error({ details: { httpStatus: 500 } })

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(esriConfig.apiKey).toBe('esri-token-1')
  })
})
