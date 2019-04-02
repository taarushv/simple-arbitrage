const binanceParse = async depth => {
  return new Promise((resolve, reject) => {
    // Get asks
    let { price, quantity } = depth.asks[0];
    let binanceBids = depth.bids;
    let bestBinanceBid = {
      p: parseFloat(binanceBids[0].price),
      s: parseFloat(binanceBids[0].quantity)
    };
    let bestBinanceAsk = { p: parseFloat(price), s: parseFloat(quantity) };

    let bOutput = { ask: bestBinanceAsk, bid: bestBinanceBid };
    resolve(bOutput);
  });
};

export default binanceParse;
