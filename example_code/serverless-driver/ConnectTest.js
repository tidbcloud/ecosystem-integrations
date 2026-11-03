import { connect } from '@tidbcloud/serverless'

const conn = connect({url: process.env.DATABASE_URL,password: process.env.TIDB_PASSWORD})
const result = await conn.execute("show databases",null,{fullResult: true})
console.log(result)
