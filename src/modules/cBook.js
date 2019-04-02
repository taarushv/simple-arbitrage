import { parse } from "url";

const Gdax = require("gdax");
var BigNumber = require("bignumber.js");
var chalk = require("chalk");

// Sync orderbook
/**
 * @param  {} book - Coinbase synced orderbook init in Index.js
 * @param  {} =>{returnnewPromise((resolve
 * @param  {} reject
 *
 * parse the book to get asks, and the best ask. Followed by getting bids and best bid
 *
 */
let cBook = async book => {
  return new Promise((resolve, reject) => {
    try {
      let arrayOfAsks = book.books["ZRX-BTC"].state().asks; // use this to send a list of asks later
      let bestAsk = book.books["ZRX-BTC"].state().asks[0];

      // Asks values

      if (bestAsk != undefined) {
        let { price, size } = bestAsk;
        let bestPrice = parseFloat(price.toString())
          ? parseFloat(price.toString())
          : null;
        let bestQuantity = parseFloat(size.toString())
          ? parseFloat(size.toString())
          : null;

        // parsed best ask
        const parsedAsk = { s: bestQuantity, p: bestPrice };

        // console.log(parsedAsk.p)
        // Parsing bids
        let arrayOfBids = book.books["ZRX-BTC"].state().bids; // Use this to send bids later on
        let bestBid = book.books["ZRX-BTC"].state().bids[0];
        let bidPrice = parseFloat(bestBid.price.toString())
          ? parseFloat(bestBid.price.toString())
          : null;
        let bidQuantity = parseFloat(bestBid.size.toString())
          ? parseFloat(bestBid.size.toString())
          : null;

        // parsed best bid
        let parsedBid = { s: bidQuantity, p: bidPrice };

        // console.log(parsedBid)

        // Bids values
        // let { bidbid, bidSize } = bestBid
        // console.log('Coinbase Bids' + bid, bidSize)
        let cbOutput = { ask: parsedAsk, bid: parsedBid };
        resolve(cbOutput);
      }
    } catch (error) {
      console.log(error);
    }
  });
};

export default cBook;
