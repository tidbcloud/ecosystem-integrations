var mysql = require('mysql2');



var connection = mysql.createConnection({
  host:  process.argv[2],
  port: 4000,
  user: process.argv[3],
  password: process.env.TIDB_PASSWORD,
  database: 'test',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  connectAttributes: {
    program_name: 'pingcap/serverless-test'
  }
});
connection.connect(function(err) {
  if (err) {
    throw err
  }
  connection.query('SELECT DATABASE();', function(err, rows) {
    if (err) {
      throw err
    }
    console.log(rows[0]['DATABASE()']);
    connection.end()
  });
});
