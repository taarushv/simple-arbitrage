### ArbV2 Bot

Edit: This repo is no longer maintainted. It has packages that have been since been found to be vulnerable. Only use this for educational purposes. 

**Model**: Placing orders below `market price` (price at Exchange B) on Exchange A and constantly maintaining the 25bps spread. Waits until order is filled to instantly capture the spread profits. 


- Retrieve and maintain realtime tickers on binance and coinbase
- [x] Create function that returns price -ve 25bps
- [X] Functions that place orders on coinbase and binance
- [X] Every 1 second, check if price diff( between market price and order price) is > 25 bps
  - [X] If holds true, dont do anything
  - [X] If not true, cancel and issue new order

Place API keys in config.json

```
"scripts": {
    "dev": "nodemon --exec babel-node src/index.js",
    "build": "babel src --out-dir dist",
    "start": "babel-node src/index.js",
    "orderbook": "nodemon --exec babel-node ./playground/orderbooks.js",
    "test": "mocha"
  },
````



