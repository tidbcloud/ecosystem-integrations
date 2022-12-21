const pjson = require('../package.json')

async function request(z, url, username, password, method, body) {
  const param = {
    url,
    headers: { 'User-Agent': `zapier-tidbcloud-integrations/${pjson.version}` },
    digest: {
      username,
      password,
    },
  }
  if (method) {
    param.method = method
  }
  if (body) {
    param.body = body
  }
  return await z.request(param)
}

module.exports = request
