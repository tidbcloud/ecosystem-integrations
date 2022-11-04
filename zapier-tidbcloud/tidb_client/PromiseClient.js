const promiseMysql = require('mysql2/promise');

function isEmpty(obj) {
  return obj === null || obj === undefined || obj === "";
}

// https://www.npmjs.com/package/mysql2#using-promise-wrapper
async function query(host, user, port, password, database, sql, values) {
  if ( isEmpty(host) ) {
    return [undefined, "Missing required Parameter: host"]
  }
  if ( isEmpty(user) ) {
    return [undefined, "Missing required Parameter: user"]
  }
  if ( isEmpty(port) ) {
    return [undefined, "Missing required Parameter: port"]
  }
  if ( isEmpty(password) ) {
    return [undefined, "Missing required Parameter: password"]
  }
  if( isEmpty(sql) ) {
    return [undefined, "Missing required Parameter: sql"]
  }
  if( isEmpty(database) ) {
    database = 'test'
  }

  let connection
  try {
    connection = await promiseMysql.createConnection({
      host: host,
      user: user,
      port: port,
      password: password,
      database: database,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });
    const [rows, filed] = await connection.execute(sql, values)
    return [rows, undefined]
  } catch (error) {
    return [undefined, error]
  } finally {
    if (connection) {
      await connection.end()
    }
  }


}

module.exports = query