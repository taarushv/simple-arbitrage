// first param - ask
// second param - bid

import chalk from 'chalk'
import findRoute from './findRoute'
/**
 * @param  {} Ask highest binance ask
 * @param  {} bid lowest coinbase bid
 *
 */
const checkArb = async (cb, b) => {
  let { ask: cask, bid } = cb

  let { ask, bid: bbid } = b
  return new Promise(async (resolve, reject) => {
    try {
      let route1 = await findRoute(ask.p, bid.p, ask.s, bid.s)
      // console.log(route);
      let route2 = await findRoute(cask.p, bbid.p, cask.s, bbid.s)
      let route = {
        'BC': route1,
        'CB': route2
      }
      resolve(route)
    } catch (error) {
      console.log(error)
    }
  })
}

export default checkArb
