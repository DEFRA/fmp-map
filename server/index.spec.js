const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname, '../build')
const fixtureFile = path.join(buildDir, '__server_spec_fixture__.html')

describe('createServer', () => {
  let createServer
  let server

  beforeAll(() => {
    fs.mkdirSync(buildDir, { recursive: true })
    fs.writeFileSync(fixtureFile, '<html></html>')
  })

  afterAll(() => {
    fs.rmSync(fixtureFile, { force: true })
  })

  beforeEach(() => {
    jest.resetModules()
    createServer = require('./index')
  })

  afterEach(async () => {
    await server?.stop()
    delete process.env.PORT
  })

  it('defaults the port to 3000 when PORT is not set', async () => {
    delete process.env.PORT
    server = await createServer()
    expect(server.info.port).toBe(3000)
  })

  it('uses PORT from the environment when set', async () => {
    process.env.PORT = '4321'
    server = await createServer()
    expect(server.info.port).toBe(4321)
  })

  it('serves a file from the build directory', async () => {
    server = await createServer()
    const response = await server.inject({ method: 'GET', url: '/__server_spec_fixture__.html' })
    expect(response.statusCode).toBe(200)
  })

  it('returns 404 for a file that does not exist', async () => {
    server = await createServer()
    const response = await server.inject({ method: 'GET', url: '/does-not-exist.html' })
    expect(response.statusCode).toBe(404)
  })
})
