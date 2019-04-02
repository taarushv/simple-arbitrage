const bps = (b, cb) => {
  return parseFloat(((cb - b) * 100) / cb)
}

const undercut = (price) => {
  return parseFloat((parseFloat(price) - 0.00000002).toFixed(8)) // Subtract 2 satoshi from price
}

const findRoute = (b, cb, askq, bidq) => {
  let bcSpread = bps(b, cb)

  return new Promise((resolve, reject) => {
    if (cb > b && bcSpread > 0.25 && askq > 250 && bidq > 250) {
      // let spread = bps(b, cb)
      // console.log(bps(b, cb))
      let direction = {
        sleep: false,
        spread: parseFloat(bcSpread.toFixed(4)),
        'askq': askq,
        'sellq': bidq,
        'buyPrice': b,
        'sellPrice': undercut(cb)
      }
      resolve(direction)
    } else {
      // sleep mode
      let direction = { sleep: true,
        spread: bcSpread.toFixed(4),
        'askq': askq,
        'sellq': bidq,
        'buyPrice': b,
        'sellPrice': undercut(cb) }
      resolve(direction)
    }
  })
}

export default findRoute

// misc

/* else if (b > cb && cbSpread > 0.25) {
      // console.log(bps(cb, b))
      // let spread = bps(cb, b)
      let direction = {
        atob: false,
        sleep: false,
        spread: cbSpread
      };
      resolve(direction);
    } */
