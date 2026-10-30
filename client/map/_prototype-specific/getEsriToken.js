const esriAuth = {}

export const getEsriToken = async (refresh = false) => {
  const hasToken = esriAuth.token

  if (refresh || !hasToken) {
    try {
      const queryString = refresh ? '?refresh=true' : ''
      const response = await window.fetch(`/esri-token${queryString}`)
      const json = await response.json()
      Object.assign(esriAuth, json)
    } catch (err) {
      console.log('Error getting ESRI access token: ', err)
    }
  }

  return esriAuth.token
}
