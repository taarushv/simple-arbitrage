// WS server setup
// WS setup end

import chalk from 'chalk'

// Exchange modules
import cBook from './modules/cBook'
import checkArb from './modules/checkArb'
import sendMsg from './modules/botHandler'
import { placeOrderCB as place, orderStatusCB } from '../playground/CB-tunnel'
import binanceParse from './modules/binanceParse'
import { cell } from './modules/logger'
const http = require('http')
const r = require('rethinkdb')
const Telegraf = require('telegraf')
const express = require('express')
const io = require('socket.io-client')
const port = process.env.PORT || 5003
const app = express()
let server = http.createServer(app)
const ioServer = require('socket.io')(server)

const Binance = require('binance-api-node').default
const Gdax = require('gdax')
// State variables
let connection = null
let isTrading = false
let tgUpdates = []
// Global var to be emitted on client connection
let data = {
  cbStatus: null,
  dbStatus: null,
  bStatus: null,
  isTrading: null
}
const dbConnect = async () => {
  let conn = await r.connect({ host: 'localhost', port: 28015 })
  connection = conn
  await r.db('test').tableCreate('trades').run(connection)
}
dbConnect()

// Change the api keys on production
const client = Binance({
  apiKey: '3k9sfCw9YodR9FqjYbs1KgA1EeLVMgxgGisvIKQRlLHcmMosq6ls5H3iZixMfRPA',
  apiSecret: 'cWKAGwF8C6zoje1jCv8SPX1QYHJqNgUOrAc6PYE0BLwrmWjTRN6LwmcAClkq04uA',
  useServerTime: true
})
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
// Initiate coinbase OrderbookSync
const book = new Gdax.OrderbookSync(['ZRX-BTC'])

// Wait for a bit until coinbase socket is initialized
sleep(2000)

// Binance Orderbook
client.ws.partialDepth({ symbol: 'ZRXBTC', level: 10 }, async depth => {
  //   console.log(new Date())

  // Get Coinbase orderbook
  let cb = await cBook(book)

  // Parse binance orderbook
  let b = await binanceParse(depth)

  // Binance to coinbase
  // let logicBtoC = await checkArb(b.ask, cb.bid);

  // TODO: Coinbase to binance
  // let logicCtoB = checkArb(cb.ask, b.bid)

  let logic = await checkArb(cb, b)
  insert(logic.BC)

  // destructuring logic
  let { BC } = logic
  let { CB } = logic
  if (!isTrading) {
    if (BC.sleep === false && BC.spread > 0.5) {
      // logic for buying on binance and selling on coinbase
      tgUpdates.push(BC)
      insert(BC)
    } else if (CB.sleep === false && CB.spread > 0.5) {
      // logic for buying on coinbase and selling on binance
      tgUpdates.push(BC)
      insert(CB)
    }
  }

  // console.log(await logicBtoC)
  // TODO: Implement new logger - logging prices for both exchanges
  // console.log(chalk.red.bold(`Coinbase - ${cb.bid.p} - ${cb.bid.s}`));

  let table = {
    'Coinbase(Ask)': new cell(cb.ask.p, cb.ask.s.toFixed()),
    'Coinbase(Bid)': new cell(cb.bid.p, cb.bid.s.toFixed()),
    'Binance(Ask)': new cell(b.ask.p, b.ask.s.toFixed()),
    'Binance(Bid)': new cell(b.bid.p, b.bid.s.toFixed())
  }
  console.clear()
  console.log(logic)
  console.log('Asks and Bids')
  console.table(table)
  console.log('Logic')
  console.table(logic)
})

// setTimeout(async () => {
//   console.log(
//     await place({
//       type: 'limit',
//       side: 'sell',
//       id: 'ZRX-BTC',
//       size: '1',
//       tif: 'IOC',
//       price: '0.00010'
//     })
//   )
// }, 10000)
// WS Config
ioServer.on('connection', socket => {
  socket.emit('data', data)

  send(socket)
  console.log('user connected')
})

const send = socket => {
  // function to periodically send data to the frontend every 5 seconds
  setInterval(() => {}, 10000)
}

server.listen(port)

const statusCheck = () => {

}

const insert = (trade) => {
  r.table('trades').insert(trade, { durability: 'soft' }).run(connection)
}

const bot = new Telegraf('788094854:AAHLA8jN-Dh-Gs2qkaH5WN6YNocSnZ2-UFA')
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))

bot.startPolling()

setInterval(async () => {
  await sendMsg(bot, tgUpdates)
  // reset updates
  tgUpdates = []
}, 900000)
