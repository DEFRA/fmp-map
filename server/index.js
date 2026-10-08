const hapi = require('@hapi/hapi')
const path = require('path')

const createServer = async () => {
  const server = hapi.server({
    port: process.env.PORT || 3000,
    routes: {
      files: {
        relativeTo: path.join(__dirname, '../build')
      }
    }
  })

  await server.register(require('@hapi/inert'))

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        index: true,
        redirectToSlash: true
      }
    }
  })

  return server
}

module.exports = createServer
