import Binance from 'binance-api-node'
import chalk from 'chalk'

const Gdax = require('gdax')

const client = Binance({
  apiKey: '3k9sfCw9YodR9FqjYbs1KgA1EeLVMgxgGisvIKQRlLHcmMosq6ls5H3iZixMfRPA',
  apiSecret: 'cWKAGwF8C6zoje1jCv8SPX1QYHJqNgUOrAc6PYE0BLwrmWjTRN6LwmcAClkq04uA'
})

export async function binanceInit () {
  client.ws.candles('ZRXBTC', '1m', candle => {
    console.log(candle)
  })
}

export async function coinbase () {
//   let url = 'wss://ws-feed.pro.coinbase.com'
  const websocket = new Gdax.WebsocketClient(['ZRX-BTC'])

  websocket.on('message', data => {
    console.log(data)
  })
  websocket.on('error', err => {
    console.log(err)
  })
  websocket.on('close', () => {
    console.log('Websocket closed')
  })
}
