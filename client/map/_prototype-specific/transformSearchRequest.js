const { getOsToken } = require('./getOsToken.js')

// transformSearchRequest - intercepts search requests, adding the OS token to the Authorization header
export const transformSearchRequest = async (request) => {
  const { url, options } = request

  const token = (await getOsToken()).token
  return {
    url: url.toString(),
    options: {
      ...options,
      headers: { ...options?.headers, Authorization: 'Bearer ' + token }
    }
  }
}
