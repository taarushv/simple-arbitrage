const Gdax = require('gdax')
const WebSocket = require('ws')
/*
Ran one r
*/

// Request
// Subscribe to ETH-USD and ETH-EUR with the level2, heartbeat and ticker channels,
// plus receive the ticker entries for ETH-BTC and ETH-USD
// Basis:
// Coinbase is Exploring ADA, BAT, XLM, ZEC, and ZRX
let request = {
  'type': 'subscribe',
  'product_ids': [
    'XLM-BTC',
    'XLM-USD',
    'ADA-BTC',
    'ADA-USD',
    'BAT-BTC',
    'BAT-USD',
    'ZEC-BTC',
    'ZEC-USD'
  ],
  //   add 'heartbeat' if it makes things easier
  'channels': [
    'ticker',
    'level2',
    'full'

  ]
}
// TODO: Add gdax Index.js init and the telegram handler
const newCoin = () => {
  // TODO: Move ws init to Index and pass it as an argument
  let ws = new WebSocket('wss://ws-feed.pro.coinbase.com', {
    perMessageDeflate: false
  })
  ws.on('open', () => {
    ws.send(JSON.stringify(request))
  })
  ws.on('message', data => {
    console.log(data)
  })
  ws.on('error', err => {
    /* handle error */
    console.error(err)
  })
  ws.on('close', () => {
    console.log(`Socket closed`)
    let ws = new WebSocket('wss://ws-feed.pro.coinbase.com', {
      perMessageDeflate: false
    })
  })
}

newCoin()
