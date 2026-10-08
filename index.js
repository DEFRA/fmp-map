const createServer = require('./server')

createServer()
  .then((server) => server.start().then(() => console.log(`Server running at: ${server.info.uri}`)))
  .catch((err) => {
    console.log(err)
    process.exit(1)
  })
