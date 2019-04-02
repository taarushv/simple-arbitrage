
let ids = [414886736]

export function sendMsg (bot, msg) {
  return new Promise((resolve, reject) => {
    ids.forEach((user) => {
      bot.telegram.sendMessage(user, msg)
    })
    resolve(true)
  })
  
}
