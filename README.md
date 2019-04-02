### ArbV2 Bot

#### **Logic**

**Model**: Placing orders below `market price` and constantly maintaining the 25bps spread


- Retrieve and maintain realtime tickers on binance and coinbase
- [x] Create function that returns price -ve 25bps
- [ ] Functions that place orders on coinbase and binance
- [ ] Every 1 second, check if price diff( between market price and order price) is > 25 bps
  - [ ] If holds true, dont do anything
  - [ ] If not true, cancel and issue new order



```
"scripts": {
    "dev": "nodemon --exec babel-node src/index.js",
    "build": "babel src --out-dir dist",
    "start": "babel-node src/index.js",
    "orderbook": "nodemon --exec babel-node ./playground/orderbooks.js",
    "test": "mocha"
  },
````



**Ticker data structure**

```
{ eventType: '24hrTicker',
  eventTime: 1545628955773,
  symbol: 'ZRXBTC',
  priceChange: '0.00000071',
  priceChangePercent: '0.828',
  weightedAvg: '0.00008592',
  prevDayClose: '0.00008577',
  curDayClose: '0.00008641',
  closeTradeQuantity: '508.00000000',
  bestBid: '0.00008641',
  bestBidQnt: '4749.00000000',
  bestAsk: '0.00008647',
  bestAskQnt: '2371.00000000',
  open: '0.00008570',
  high: '0.00008745',
  low: '0.00008417',
  volume: '7058234.00000000',
  volumeQuote: '606.44407585',
  openTime: 1545542555769,
  closeTime: 1545628955769,
  firstTradeId: 9430710,
  lastTradeId: 9445620,
  totalTrades: 14911 
}
```

Useful values:
- weightedAvg,n bestBid, bestAsk, o, h, l, c
