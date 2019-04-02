const Binance = require('binance-api-node').default
const Gdax = require('gdax')

// config
var config = require('../config.json')

// Authenticating binance
const binanceClient = Binance({
  apiKey: config.binanceApiKey,
  apiSecret: config.binanceApiSecret,
  useServerTime: true
})

const coinbaseClient = new Gdax.AuthenticatedClient(
  config.coinbaseKey,
  config.coinbaseSecret,
  config.coinbasePassphrase,
  config.coinbaseApiURI
)
const callback = (err, response, data) => {
  if (err) {
    console.log(err)
  } else {
    console.log(data)
  }
}

async function main () {
  var binance = (await binanceClient.accountInfo())
  console.log(binance)
  coinbaseClient.getAccounts().then(data => {
    console.log((data))
  })
}
async function kill () {
  coinbaseClient.cancelAllOrders({ product_id: 'ZRX-BTC' }, (err, res, data) => {
    if (err) {
      console.log(err)
    }
    console.log(data)
  })
}

async function sell () {
  const buyParams = {
    product_id: 'ZRX-BTC'
  }
  coinbaseClient.buy(buyParams, callback)
}

sell()
