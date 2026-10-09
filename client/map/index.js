import { FmpMap } from './fmpMap.js'

FmpMap.initialise().then(() => {
  const fmpMap = new FmpMap()
  fmpMap.on('app:ready', () => console.log('FmpMap.interactiveMap is ready'))
})
