const mysql = require('mysql2')
const mysql2Timeout = require('mysql2-timeout-additions')

function isEmpty(obj) {
  return obj === null || obj === undefined || obj === ''
}

// https://www.npmjs.com/package/mysql2-timeout-additions
// TODO do not use pool
async function queryWithTimeOut(host, user, port, password, database, timeout, sql, values) {
  if (isEmpty(host)) {
    return [undefined, 'Missing required Parameter: host']
  }
  if (isEmpty(user)) {
    return [undefined, 'Missing required Parameter: user']
  }
  if (isEmpty(port)) {
    return [undefined, 'Missing required Parameter: port']
  }
  if (isEmpty(password)) {
    return [undefined, 'Missing required Parameter: password']
  }
  if (isEmpty(sql)) {
    return [undefined, 'Missing required Parameter: sql']
  }
  if (isEmpty(database)) {
    database = 'test'
  }
  let promisePool
  try {
    if (!promisePool) {
      const pool = mysql.createPool({
        host: host,
        user: user,
        port: port,
        password: password,
        database: database,
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        },
      })
      promisePool = pool.promise()
    }
    mysql2Timeout.addTimeoutToPromisePool({
      pool: promisePool,
      seconds: timeout,
    })
    const [rows, filed] = await promisePool.execute(sql, values)
    return [rows, undefined]
  } catch (error) {
    return [undefined, error.message]
  } finally {
    if (promisePool) {
      await promisePool.end()
    }
  }
}

module.exports = queryWithTimeOut
