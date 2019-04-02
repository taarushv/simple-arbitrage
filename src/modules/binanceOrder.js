// Market Buy on Binance
import chalk from 'chalk'
const uuidv1 = require('uuid/v1')

const binanceOrder = (client, amount, price, db) => {
  let id = uuidv1()
  console.log(chalk.bold.green(
    `Binance Buy order generated
     ID : ${id}
     Amount : ${amount}
     Price  : ${price}`))

  // TODO: Change to `order` when deployed
  console.log(await client.orderTest({
    symbol: 'ZRXBTC',
    side: 'BUY',
    type: 'MARKET',
    quantity: amount
    // price: 0.0002, /*optional for market orders*/
  }))
}
