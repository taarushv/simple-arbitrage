const Binance = require('binance-api-node').default
const Gdax = require('gdax')
const chalk = require('chalk')
// Setting up DB and Schema
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({ CPro_trades: [], binance_trades: [], count0: 0, count1: 0 }).write()
// configurations
var config = require('../config.json')
// Authenticating binance
const binanceClient = Binance({
  apiKey: config.binanceApiKey,
  apiSecret: config.binanceApiSecret,
  useServerTime: true
})
// Authenticating coinbase

const coinbaseClient = new Gdax.AuthenticatedClient(
  config.coinbaseKey,
  config.coinbaseSecret,
  config.coinbasePassphrase,
  config.coinbaseApiURI
)

// init
var isTrading = false

// global vars
var activeOrderPrice, activeOrderProfit, activeOrderID
var tradesExecuted = 0

// Initiate coinbase OrderbookSync
const book = new Gdax.OrderbookSync([`${config.coin}-BTC`])

// Wait for a bit until coinbase socket is initialized
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
sleep(2000)

// 25 bps model START
/// ///////////////////////
// binanceClient.ws.ticker(`${config.coin}BTC`, ticker => {
//   console.log(ticker)
// })
binanceClient.ws.trades(`${config.coin}BTC`, trade => {
  console.log(trade)
})

// 25 bps model END
/// ///////////////////////

// binanceClient.ws.partialDepth({ symbol: `${config.coin}BTC`, level: 20 }, async depth => {

// })

// binanceClient.ws.partialDepth({ symbol: `${config.coin}BTC`, level: 20 }, async depth => {
//   console.log(depth)
//   // Check if the bot is already engaged in a trade
//   if (!isTrading) {
//     // Get raw asks and bids from Coinbase
//     var coinbaseAsks = await (book.books[`${config.coin}-BTC`].state().asks)
//     var coinbaseBids = await (book.books[`${config.coin}-BTC`].state().bids)
//     // Filter to 100 levels and remove duplicates
//     var cAsks = filterCB(coinbaseAsks, 100)
//     var cBids = filterCB(coinbaseBids, 100)
//     // Pop orders which add up to 'X' quantity (moving up the asks orderbook)
//     var CbfinalAsks = popOrders(cAsks, `${config.skipQuantity}`)
//     var CbfinalBids = popOrders(cBids, `${config.skipQuantity}`)
//     // Find price right in front of a wall
//     var sellPrice = await findWallPrice(finalAsks, `${config.wallHeight}`)
//     // Check if said price is profitable
//     var scenario = isProfitable(sellPrice)
//     // If profitable place sell order on Coinbase infront of wall
//     if (scenario.status) {
//       console.log(`Found a potential opportunity with ${scenario.profit} bps.`)
//       console.log(`Placing an order on Coinbase behind wall`)
//       console.log(`Sell order for ${config.tradeQuantity} ${config.coin} at price ${scenario.price} BTC`)
//       activeOrderPrice = scenario.price
//       activeOrderProfit = scenario.profit
//       var params = {
//         side: 'sell',
//         price: scenario.price,
//         size: config.tradeQuantity,
//         product_id: `${config.coin}-BTC`
//       }
//       coinbaseClient.placeOrder(params, (error, response, data) => {
//         if (error) {
//           console.log(error)
//         } else {
//           console.log('Executed !')
//           // halting search for opportunities
//           isTrading = true
//           activeOrderID = data.id
//           // Writing trade to database
//           var index = db.get('count0').value()
//           db.update('count0', n => n + 1).write()
//           var shortHand = `Placed Sell Order for  ${config.tradeQuantity} ZRX @ ${scenario.price}`
//           db.get('CPro_trades').push({ index: index, get: shortHand, data, status: 'open' }).write()
//         }
//       })
//     }
//     // If it isn't profitable
//     else {
//       console.log(chalk.red.bold('No opportunities at this moment \n' + JSON.stringify(scenario)))
//     }
//   } // If the bot has already placed an order
//   else {
//     console.log(chalk.red(`Bot engaged in strategy with ${config.coin}/BTC pair`))
//     console.log('\n')
//     console.log(`Placed a sell order behind a wall for ${config.tradeQuantity} @ ${activeOrderPrice} BTC`)
//     console.log(`Potential Profit if filled: ${activeOrderProfit} bps`)
//     console.log(`Waiting to be filled!`)
//     console.log('\n\n\n\n')
//   }
// })
// get binance market price and store in global variable
binanceClient.ws.candles(`${config.coin}BTC`, '1m', candle => {
  binanceMarketPrice = (parseFloat(candle.close))
})

// calculate price 25bps below market price
// 1 bps = 0.01% => 25bps = 0.25 %
// @param marketPrice - market price
// @return buyPrice {float} - price 25 bps below
const buyPrice = (marketPrice) => {
  let multiplier = 99.75
  let buyPrice = multiplier * marketPrice
  return parseFloat(buyPrice)
}
// calculate bps
const bps = (buy, sell) => {
  return parseFloat(((sell - buy) * 100) / buy)
}

// filter coinbase orderbook to get 100 levels and remove duplicates
function filterCB (orders, n) {
  let output = []
  for (let i = 0; i <= n; i++) {
    let bid = orders[i]
    output.push({
      'price': parseFloat(parseFloat(bid.price).toFixed(8)),
      'quantity': parseFloat(bid.size)
    })
  }
  let result = []
  output.forEach(function (a) {
    if (!this[a.price]) {
      this[a.price] = { price: a.price, quantity: 0 }
      result.push(this[a.price])
    }
    this[a.price].quantity += a.quantity
  }, Object.create(null))
  return (result)
}
let index, binanceMarketPrice

// remove 'X' orders that are closest to the market price
function popOrders (output, n) {
  var count = 0
  index = 1
  for (var i = 0; i < output.length; i++) {
    var ask = output[i]
    count = count + ask.quantity
    if (count > n) {
      var result = []
      for (i = 0; i < output.length; i++) {
        if (i >= index) {
          result.push(output[i])
        }
      }
      return result
    } else {
      index++
    }
  }
}

// Find price right infront of a wall
function findWallPrice (arr, n) {
  var final = arr.filter(order => parseFloat(order.quantity) > n)
  return (parseFloat((final[0].price - `0.0000000${config.underCutBy}`).toFixed(8)))
}

// Check if profitable or not
function isProfitable (price) {
  var profit = 10 * parseFloat(bps(binanceMarketPrice, price).toFixed(5))
  if (profit > `${config.minSpread}`) {
    return { status: true, price: price, profit: parseFloat(profit.toFixed(4)) }
  } else {
    return { status: false, price: price, profit: parseFloat(profit.toFixed(4)) }
  }
}

// Keep checking if order is filled or not, every 250 ms (coinbase rate-limit)
async function checkStatus () {
  coinbaseClient.getOrder(activeOrderID, async (err, res, data) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
      var status = data.status
      // If filled, buy on binance at market price
      if (status === 'done') {
        var orderData = await binanceClient.order({
          sybmol: `${config.coin}BTC`,
          side: 'BUY',
          quantity: `${config.order_quantity}`,
          type: 'MARKET'
        })
        isTrading = false
        var shortHand = `Sold ${config.tradeQuantity} ZRX @ Market Price`
        var index = db.get('count1').value()
        db.update('count1', n => n + 1).write()
        db.get('binance_trades').push({ index: index, get: shortHand, orderData }).write()
        tradesExecuted++
        console.log(`Successfully sold on Binance, and exited. Total # of successful trades:${tradesExecuted}`)
      } else if (status === 'open') {
        // if open just wait
        var filledSize = parseInt(data.filled_size)
        if (!(filledSize === 0)) {
          console.log('Partially filled, Waiting for order to complete')
        }
        // if order is open and unfilled 'break' from function
      }
    }
  })
}

// keeps checking order status
if (isTrading) {
  setInterval(checkStatus, 250)
}
