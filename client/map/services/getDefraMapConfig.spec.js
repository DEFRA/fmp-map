const loadFmpMapConfig = () => {
  jest.resetModules()
  return require('./getDefraMapConfig.js')
}

describe('getDefraMapConfig', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn()
  })

  it('should fetch and cache the defra map config', async () => {
    globalThis.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ some: 'config' })
    })
    const { getDefraMapConfig } = loadFmpMapConfig()

    const first = await getDefraMapConfig()
    const second = await getDefraMapConfig()

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect(first).toEqual({ some: 'config' })
    expect(second).toBe(first)
  })
})
