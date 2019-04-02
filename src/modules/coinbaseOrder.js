const Gdax = require('gdax')

const key = '487ac0ded84376fb56309dae2e62196e'
const secret = 'GcV7AdiNebKsSCBBiUU/DeFL2kzeHJkorRqBH8CbYzyhu6yBbEKYlbElxpAC504Ko4fwLrfDhyFYp8ZShVL+rg=='
const passphrase = '0xarb'

// const apiURI = 'https://api.gdax.com';
const sandboxURI = 'https://api-public.sandbox.gdax.com'

const authedClient = new Gdax.AuthenticatedClient(
  key,
  secret,
  passphrase,
  sandboxURI
)
var callback = function (error, response, data) {
  if (error) {
    // handle the error
    console.log(`Coinbase order error - ` + error)
  } else {
    // work with data
    console.log(`Coinbase order placed ` + data)
  }
}

const placeOrder = (data) => {
  const orderParams = {
    type: data.type,
    side: data.side,
    price: data.price,
    size: data.size,
    product_id: data.product_id,
    time_in_force: data.time_in_force
  }
  authedClient.place(orderParams, callback)
}
/*
Example usage
var data = {
  type:limit,
  side:'buy',
  price:'7001',
  size:'0.1',
  product_id:'BTC-USD',
  time_in_force:'IOC'
}
placeOrder(data);
*/

export default placeOrder
