import { connect } from '@tidbcloud/serverless'
import { fetch } from 'undici'


const conn = connect({url: process.env.DATABASE_URL,fetch:fetch})
const result = await conn.execute("show tables")
console.log(process.env.DATABASE_URL)
console.log(result)
