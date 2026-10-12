const mockDotenvConfig = jest.fn()
jest.mock('dotenv', () => ({
  config: (...args) => mockDotenvConfig(...args)
}))

const mockCreateServer = jest.fn()
jest.mock('./server', () => (...args) => mockCreateServer(...args))

const flushPromises = () => new Promise((resolve) => process.nextTick(resolve))

describe('index', () => {
  let consoleLogSpy
  let processExitSpy

  beforeEach(() => {
    jest.resetModules()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    processExitSpy.mockRestore()
  })

  it('should load environment variables via dotenv', () => {
    mockCreateServer.mockReturnValue(new Promise(() => {})) // never resolves, no need to start

    require('./index.js')

    expect(mockDotenvConfig).toHaveBeenCalled()
  })

  it('should start the server and log its uri once created', async () => {
    const start = jest.fn().mockResolvedValue()
    mockCreateServer.mockResolvedValue({ start, info: { uri: 'http://localhost:3000' } })

    require('./index.js')
    await flushPromises()
    await flushPromises()

    expect(start).toHaveBeenCalled()
    expect(consoleLogSpy).toHaveBeenCalledWith('Server running at: http://localhost:3000')
    expect(processExitSpy).not.toHaveBeenCalled()
  })

  it('should log the error and exit with code 1 when the server fails to start', async () => {
    const error = new Error('boom')
    mockCreateServer.mockRejectedValue(error)

    require('./index.js')
    await flushPromises()
    await flushPromises()

    expect(consoleLogSpy).toHaveBeenCalledWith(error)
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })
})
