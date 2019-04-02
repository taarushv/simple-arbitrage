
export default async function (price, amount) {
  return new Promise((resolve, reject) => {
    // Logic
    // 1. Create Sell orderStatus
    // 2. Keep polling every 'x' ms to check order status
    // 3. If order is filled, resolve it and pass the control flow to the next function(buy on binance)
  })
}
