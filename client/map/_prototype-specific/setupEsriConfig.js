const { getOsToken } = require('./getOsToken.js')
const { getEsriToken } = require('./getEsriToken.js')

const INVALID_TOKEN_CODE = 498
const isInvalidTokenError = (error) => (error?.details?.httpStatus === INVALID_TOKEN_CODE)

let _esriConfig
export const setupEsriConfig = async (esriConfig) => {
  _esriConfig = esriConfig

  // Set ESRI API key (using cached token)
  esriConfig.apiKey = await getEsriToken()

  // Add OS Maps token interceptor - appends the Authorization header with the OS token
  esriConfig.request.interceptors.push({
    urls: 'https://api.os.uk/maps/vector/v1/vts',
    before: async params => {
      const token = (await getOsToken()).token
      params.requestOptions.headers = { Authorization: 'Bearer ' + token }
    }
  })

  // ArcGisInterceptor - handles token refresh for ArcGIS tiles
  esriConfig.request.interceptors.push({
    urls: 'https://tiles.arcgis.com/tiles',
    error: async (error) => {
      if (isInvalidTokenError(error)) {
        await refreshEsriToken()
      }
    }
  })
}

const refreshEsriToken = async () => {
  const { token } = await getEsriToken(true) // forceRefresh = true
  _esriConfig.apiKey = token
}
