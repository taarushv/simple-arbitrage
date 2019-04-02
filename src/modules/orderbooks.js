const Binance = require('binance-api-node').default
const Gdax = require('gdax')
const chalk = require('chalk')
var BigNumber = require('bignumber.js')

const client = Binance({
  apiKey: '3k9sfCw9YodR9FqjYbs1KgA1EeLVMgxgGisvIKQRlLHcmMosq6ls5H3iZixMfRPA',
  apiSecret: 'cWKAGwF8C6zoje1jCv8SPX1QYHJqNgUOrAc6PYE0BLwrmWjTRN6LwmcAClkq04uA',
  useServerTime: true
})

// Coinbase orderbook
const websocket = new Gdax.WebsocketClient('ZRX-BTC', 'wss://ws-feed.pro.coinbase.com',
  null, {
    channels: ['level2']
  })

// Binance Orderbook
client.ws.partialDepth({ symbol: 'ZRXBTC', level: 10 }, depth => {
  console.log(new Date())
  let { price, quantity } = depth.asks[0]
  // console.log(chalk.green.bold(`Best ask on binance - ${price} - ${quantity}`))
})

websocket.on('message', data => {
  // Ticker channel provides updates everytime a match takes place

  if (data.type != 'heartbeat' || data.type != 'ticker') {
    // console.log(data)
  }
})
websocket.on('error', err => {
  throw new Error(err)
})
websocket.on('close', () => {
  console.log('WEBSOCKET CLOSED - COINBASE')
})

// Sync orderbook
// const orderbookSync = new Gdax.OrderbookSync(['ZRX-BTC'])
// setTimeout(() => {
//   console.log(orderbookSync.books['ZRX-BTC'].state().bids[0])
// }, 2000)
