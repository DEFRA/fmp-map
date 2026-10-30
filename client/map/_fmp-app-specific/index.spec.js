import { setupEsriConfig, transformSearchRequest } from './index.js'

describe('_fmp-app-specific', () => {
  describe('setupEsriConfig', () => {
    it('should set the proxy url from the current origin', async () => {
      const esriConfig = { request: {} }

      await setupEsriConfig(esriConfig)

      expect(esriConfig.request.proxyUrl).toBe(`${globalThis.location.origin}/proxy/`)
    })

    it('should not alter other request settings', async () => {
      const interceptors = []
      const esriConfig = { request: { interceptors } }

      await setupEsriConfig(esriConfig)

      expect(esriConfig.request.interceptors).toBe(interceptors)
      expect(interceptors).toHaveLength(0)
    })
  })

  describe('transformSearchRequest', () => {
    it('should be null so the default search request is used', () => {
      expect(transformSearchRequest).toBeNull()
    })
  })
})
