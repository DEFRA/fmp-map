const transformSearchRequest = null

// Add a proxy configuration for Esri requests from fmp-app
const setupEsriConfig = async (esriConfig) => {
  esriConfig.request.proxyUrl = `${globalThis.location.origin}/proxy/`
}

export { setupEsriConfig }
export { transformSearchRequest }
