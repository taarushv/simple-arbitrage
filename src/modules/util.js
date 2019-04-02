const insert = (r, connection, trade) => {
  r.table('trades').insert(trade, { durability: 'soft' }).run(connection)
}
