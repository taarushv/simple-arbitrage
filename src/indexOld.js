// Express Setup (Not being used right now)
// import express from 'express';

// const app = express();
// const port = process.env.port || 3000;

// app.get('/', (req, res) => {
//   res.send('Hello World');
// });

// app.listen(port, () => {
//   console.log(`App listening on port ${port}!`);
// });
// import { binanceInit, coinbase } from './modules/lib'
import Binance from 'binance-api-node'
import chalk from 'chalk'
import binanceOrder from './modules/binanceOrder'
const Telegraf = require('telegraf')
const Gdax = require('gdax')

const bot = new Telegraf('788094854:AAHLA8jN-Dh-Gs2qkaH5WN6YNocSnZ2-UFA')

const client = Binance({
  apiKey: '3k9sfCw9YodR9FqjYbs1KgA1EeLVMgxgGisvIKQRlLHcmMosq6ls5H3iZixMfRPA',
  apiSecret: 'cWKAGwF8C6zoje1jCv8SPX1QYHJqNgUOrAc6PYE0BLwrmWjTRN6LwmcAClkq04uA',
  useServerTime: true
})

const websocket = new Gdax.WebsocketClient('ZRX-BTC', 'wss://ws-feed.pro.coinbase.com',
  null, {
    channels: ['ticker']
  })

// binanceInit()
// coinbase()

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ trades: [], user: {}, count: 0 })
  .write()

// Add a post
// db.get('trades')
//   .push({ ts: new Date(), title: 'test db' })
//   .write()

// state variables
let gdax_price = null
let binance_price = null
let ids = [414886736, 417349325]
let status = {
  ws: { binance: false, coinbase: false }
}
// Bot handler
bot.hears('hello', ctx => {
  ctx.reply('hello')
  console.log(ctx.from.id)
})
bot.startPolling()

// Send message to all users of the bot
function sendMsg (msg) {
  ids.forEach((user) => {
    bot.telegram.sendMessage(user, msg)
  })
}

// Periodic telegram updates test
//  - boolean which states whether or not bi
async function telegramUpdates (binance_price, gdax_price, opportunity, coinbase_greater) {
  if (coinbase_greater) {
    sendMsg(`Arbitrage opportunity detected [CB -> B] - ${opportunity}`)
  }
}

const diff = function (binance, gdax) {
  if (binance > gdax) {
    // console.log('B>C, Spread =' + chalk.green([(binance - gdax) / (gdax)] * 100 + '%'))
    let spread = parseFloat(binance_price - gdax_price).toFixed(8)
    telegramUpdates(binance_price, gdax_price, spread, false)
  } else if (gdax > binance) {
    // binanceOrder(client, 10, binance)
    // console.log('C>B, Spread =' + chalk.green([(gdax - binance) / (binance)] * 100 + '%'))
    let spread = parseFloat(gdax_price - binance_price).toFixed(8)
    telegramUpdates(binance_price, gdax_price, spread, true)
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const main = async function () {
  websocket.on('message', data => {
    status.ws.coinbase = true
    if (data.price != null) {
      gdax_price = (data.price)
      // console.log(gdax_price);
    }
  })
  client.ws.candles('ZRXBTC', '1m', candle => {
    status.ws.binance = true
    binance_price = (candle.close)
  })
  while (true) {
    diff(binance_price, gdax_price)
    console.log(gdax_price, binance_price, parseFloat(gdax_price - binance_price).toFixed(8))
    await sleep(10)
  }
}
main()
setInterval(function () { telegramUpdates() }, 10000)
