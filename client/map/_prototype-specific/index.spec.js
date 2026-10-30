import { setupEsriConfig, transformSearchRequest } from './index.js'
import { setupEsriConfig as setupEsriConfigSource } from './setupEsriConfig.js'
import { transformSearchRequest as transformSearchRequestSource } from './transformSearchRequest.js'

describe('_prototype-specific index', () => {
  it('should re-export setupEsriConfig', () => {
    expect(setupEsriConfig).toBeInstanceOf(Function)
    expect(setupEsriConfig).toBe(setupEsriConfigSource)
  })

  it('should re-export transformSearchRequest', () => {
    expect(transformSearchRequest).toBeInstanceOf(Function)
    expect(transformSearchRequest).toBe(transformSearchRequestSource)
  })
})
