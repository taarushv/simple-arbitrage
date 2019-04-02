const Binance = require('binance-api-node').default
const Gdax = require('gdax')
const chalk = require('chalk')
// Setting up DB and Schema
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({ CPro_trades: [], binance_trades: [], count0: 0, count1: 0 }).write()

// config
var config = require('../config.json')

// global variables
var isTrading = false
var tradesExecuted = 0
var activeOrderID, activeOrderPrice, binancePrice
// Authenticating binance
const binanceClient = Binance({
  apiKey: config.binanceApiKey,
  apiSecret: config.binanceApiSecret,
  useServerTime: true
})

// Initiate coinbase OrderbookSync
const book = new Gdax.OrderbookSync([`${config.coin}-BTC`])

// Authenticating coinbase

const coinbaseClient = new Gdax.AuthenticatedClient(
  config.coinbaseKey,
  config.coinbaseSecret,
  config.coinbasePassphrase,
  config.coinbaseApiURI
)

// Maker buy on coinbase
binanceClient.ws.partialDepth({ symbol: `${config.coin}BTC`, level: 20 }, depth => {
  // stats(depth)
  if (!isTrading) {
    var binanceBids = depth.bids
    var binanceFilteredBids = []
    for (var i = 0; i < binanceBids.length; i++) {
      var bid = binanceBids[i]
      // console.log(typeof parseFloat(bid.quantity))
      if (parseFloat(bid.quantity) > 24) {
        binanceFilteredBids.push(bid)
      }
    }
    binancePrice = binanceFilteredBids[0].price
    var optimalPrice = buyPrice(binancePrice)
    console.log(`Executing trade on coinbase 25bps away @ ${optimalPrice}`)
    var params = {
      side: 'buy',
      price: optimalPrice,
      size: config.tradeQuantity,
      product_id: `${config.coin}-BTC`
    }
    coinbaseClient.placeOrder(params, (error, response, data) => {
      if (error) {
        console.log(error)
      } else {
        console.log(data)
        console.log(chalk.red.bold(`Placed buy order on coinbase @ ${optimalPrice}`))
        // halting search for opportunities
        isTrading = true
        activeOrderID = data.id
        activeOrderPrice = optimalPrice
        // Writing trade to database
        var index = db.get('count0').value()
        db.update('count0', n => n + 1).write()
        var shortHand = `Placed Sell Order for  ${config.tradeQuantity} ZRX @ ${optimalPrice}`
        db.get('CPro_trades').push({ index: index, get: shortHand, data, status: 'open' }).write()
      }
    })
  } else { // when the bot already places a limit on coinbase
    console.log(chalk.green.bold(`Bot enganged @ ${activeOrderPrice}. Awaiting order to be filled on Binance`))
    console.log('\n\n\n\n')
  }
})

const checkTradeStatus = (activeOrderID, activeOrderPrice) => {
  // Check if the 25bps distance still holds true
  if (stillProfitable(activeOrderPrice)) {
    checkOrderStatus(activeOrderID)
  } else {
    coinbaseClient.cancelOrder(activeOrderID, (err, res, data) => {
      if (err) {
        console.log(err)
      } else {
        console.log(chalk.red.bold(`Trade is no longer profitable. Coinbase order has been cancelled`))
      }
    })
    isTrading = false
    console.log('Trading will now resume')
  }
}

const checkOrderStatus = (orderID) => {
  coinbaseClient.getOrder(orderID, async (err, res, data) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
      var status = data.status
      // If filled, buy on binance at market price
      if (status === 'done') {
        var orderData = await binanceClient.order({
          sybmol: `${config.coin}BTC`,
          side: 'SELL',
          quantity: `${config.tradeQuantity}`,
          type: 'MARKET'
        })
        isTrading = false
        var shortHand = `Sold ${config.tradeQuantity} ZRX @ Market Price`
        var index = db.get('count1').value()
        db.update('count1', n => n + 1).write()
        db.get('binance_trades').push({ index: index, get: shortHand, orderData }).write()
        tradesExecuted++
        console.log(chalk.green.bold(`Successfully sold on Binance, and exited. Total # of successful trades:${tradesExecuted}`))
      } else if (status === 'open') {
        // if open just wait
        var filledSize = parseInt(data.filled_size)
        if (!(filledSize === 0)) {
          console.log('Partially filled, Waiting for order to complete')
        }
      }
    }
  })
}

// eslint-disable-next-line no-unmodified-loop-condition
while (isTrading) {
  setInterval(checkTradeStatus(activeOrderID, activeOrderPrice), 250)
}
// HELPERS

const stillProfitable = (activeOrderPrice) => {
  // Check if our oder is still atleast >15bps
  // REVIEW
  if (activeOrderPrice < parseFloat(binancePrice * 99.85)) {
    return true
  } else { // if it is return true
    return false
  }
}
// calculate price 25bps below market price
// 1 bps = 0.01% => 25bps = 0.25 %
// @param marketPrice - market price
// @return buyPrice {float} - price 25 bps below
const buyPrice = (marketPrice) => {
  return parseFloat(parseFloat(0.9975 * marketPrice).toFixed(8))
}
/*
const stats = (depth) => {
  let obj = { 'bestBid': parseFloat(depth.bids[0]), 'bestAsk': parseFloat(depth.asks[0]) }
}

*/
