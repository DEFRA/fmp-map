import { myFunc } from './index.js'

describe('Initial unit test', () => {
  // This test file will go - it is just here to check that github CI is working during repo setup
  it('should pass', () => {
    expect(myFunc()).toBe('IT WORKS')
  })
})
