const getAreaPolygon = require('area-polygon')
const { encode, decode } = require('@mapbox/polyline')

const roundTo2Dp = (x) => Math.round(x * 100) / 100

const getArea = (polygon) => {
  polygon = polygonToArray(polygon)
  if (polygon) {
    return polygon.length && polygon.length > 2 ? getAreaPolygon(polygon) : 0
  }
  return undefined
}

const getAreaInHectares = (polygon) => {
  const areaInSqM = getArea(polygon)
  const areaInHectares = areaInSqM !== undefined ? Math.round((areaInSqM / 10000) * 100) / 100 : undefined
  return areaInHectares !== undefined ? `${areaInHectares}` : undefined
}

const polygonToArray = (polygon) => {
  if (!polygon) {
    return undefined
  }
  const array = Array.isArray(polygon) ? polygon : JSON.parse(polygon)
  if (array.length === 1 && Array.isArray(array[0])) {
    return array[0]
  }
  return array
}

const decodePolygonToArray = (polygonString) => {
  try {
    const polygonArray = JSON.parse(polygonString)
    if (Array.isArray(polygonArray) && Array.isArray(polygonArray[0])) {
      return polygonArray
    }
  } catch {
    return decode(polygonString)
  }
  const errorMsg = `Error - unhandled polygon array ${polygonString}`
  console.log(errorMsg)
  throw new Error(errorMsg)
}

const decodePolygon = (polygonString) => {
  const polygonArray = decodePolygonToArray(polygonString)
  validatePolygon(polygonArray)
  return JSON.stringify(polygonArray)
}

const validatePolygon = (polygonArray) => {
  // must have at least 4 points
  if (polygonArray.length < 4) {
    throw new Error('Polygon must have a length of at least 4')
  }
  const first = polygonArray[0]
  const last = polygonArray.at(polygonArray.length - 1)
  // first coordinates must match last
  if (first[0] !== last[0] || first[1] !== last[1]) {
    throw new Error('First and last coordinates should match')
  }
}

const encodePolygon = (polygonArray) => {
  if (typeof polygonArray !== 'string') {
    const polygonString = JSON.stringify(polygonArray)
    return encode(JSON.parse(polygonString))
  }
  return encode(JSON.parse(polygonArray))
}

const encodeQueryPolygonIfRequired = (queryObject) => {
  if (queryObject.encodedPolygon || queryObject.encode === false) {
    return queryObject.encodedPolygon
  }
  return encodePolygon(queryObject.polygon)
}

// call like this: checkParamsForPolygon({...request.query, encode: false}) if you don't require an encodedPolygon
const checkParamsForPolygon = (queryObject) => {
  const encodedPolygon = encodeQueryPolygonIfRequired(queryObject)
  const polygon = queryObject.polygon ? queryObject.polygon : decodePolygon(encodedPolygon)
  return {
    encodedPolygon,
    polygon
  }
}

const WEST = 0
const SOUTH = 1
const EAST = 2
const NORTH = 3

const getExtents = (polygon) => {
  polygon = polygonToArray(polygon)
  return polygon.reduce((acc, [x, y]) => {
    acc[WEST] = Math.min(acc[WEST], x)
    acc[SOUTH] = Math.min(acc[SOUTH], y)
    acc[EAST] = Math.max(acc[EAST], x)
    acc[NORTH] = Math.max(acc[NORTH], y)
    return acc
  }, [Infinity, Infinity, -Infinity, -Infinity])
}

const getDimensions = (polygon) => {
  const extents = getExtents(polygon)
  return {
    width: roundTo2Dp(extents[EAST] - extents[WEST]),
    height: roundTo2Dp(extents[NORTH] - extents[SOUTH])
  }
}

module.exports = {
  getArea,
  getAreaInHectares,
  polygonToArray,
  decodePolygon,
  encodePolygon,
  checkParamsForPolygon,
  getExtents,
  getDimensions
}
