/* globals beforeEach, expect, jest, test */

jest.mock('../../tidb_client/PromiseClient', () => jest.fn())

const query = require('../../tidb_client/PromiseClient')
const escapeIdentifier = require('../../tidb_client/escapeIdentifier')
const findRow = require('../../searches/row').operation.perform
const updateRow = require('../../creates/row_update').operation.perform
const createRow = require('../../creates/row').operation.perform
const triggerRow = require('../../triggers/row').operation.perform
const table = require('../../resources/table')
const column = require('../../resources/column')
const database = require('../../resources/database')

const z = { errors: { Error } }
const base = {
  host: 'localhost',
  user: 'test',
  port: 4000,
  tidbPassword: 'test',
  database: 'test',
  table: 'users',
}
const run = (perform, input = {}) => perform(z, { inputData: { ...base, ...input } })
const lastStatement = () => query.mock.calls[query.mock.calls.length - 1].slice(5)

beforeEach(() => {
  query.mockReset()
  query.mockResolvedValue([[], undefined])
})

test.each([
  ['order', '`order`'],
  ['a.b', '`a.b`'],
  ['some name', '`some name`'],
  ['x` OR 1=1 -- ', '`x`` OR 1=1 -- `'],
])('quotes the complete identifier %s', (input, expected) => {
  expect(escapeIdentifier(input)).toBe(expected)
})

test.each([undefined, null, '', ['id', 'name'], { name: 'id' }, 1])(
  'rejects invalid identifier %p',
  input => {
    expect(() => escapeIdentifier(input)).toThrow('SQL identifier must be a non-empty string')
  },
)

test('find row keeps table and predicate injection inside identifiers', async () => {
  await run(findRow, {
    table: 'users` WHERE 1=1 -- ',
    lookup_column: '1=1 OR id',
    lookup_value: '7 OR 1=1',
  })
  expect(lastStatement()).toEqual([
    'select * from `users`` WHERE 1=1 -- ` where `1=1 OR id` = ?',
    ['7 OR 1=1'],
  ])
})

test('update row quotes metadata column names and the attacker-controlled predicate', async () => {
  const field = 'name` = NULL WHERE 1=1 -- '
  query.mockResolvedValueOnce([[{ Field: field }], undefined])
  await run(updateRow, { id_column: '1=1 OR id', id_column_value: 7, [field]: 'changed' })
  expect(lastStatement()).toEqual([
    'update `users` set `name`` = NULL WHERE 1=1 -- ` = ? where `1=1 OR id` = ?',
    ['changed', 7],
  ])
})

test('insert row quotes literal table and metadata column names and binds values', async () => {
  query.mockResolvedValueOnce([[{ Field: 'select' }, { Field: 'a`b' }], undefined])
  await run(createRow, { table: 'a.b', select: "O'Reilly", 'a`b': 'value' })
  expect(query.mock.calls[0][5]).toBe('show columns from `a.b`')
  expect(lastStatement()).toEqual([
    'insert into `a.b` (`select`,`a``b`) values (?,?)',
    ["O'Reilly", 'value'],
  ])
})

test.each([false, true])('trigger quotes sort and dedupe columns (has id: %s)', async hasId => {
  query.mockResolvedValueOnce([hasId ? [{ COLUMN_NAME: 'id' }] : [], undefined])
  await run(triggerRow, { dedupe_key: 'id, (select password)', order_by: 'id DESC, SLEEP(10)' })
  expect(query.mock.calls[0][5]).toContain('where table_name = ?')
  expect(query.mock.calls[0][6]).toEqual(['users'])
  const sql = lastStatement()[0]
  expect(sql).toContain('from `users`')
  expect(sql).toContain('order by `id DESC, SLEEP(10)` desc limit 10000')
  if (!hasId) expect(sql).toContain('`id, (select password)` as id')
})

test('trigger binds table names in both metadata lookups and quotes a discovered key', async () => {
  query.mockResolvedValueOnce([[{ COLUMN_NAME: 'a`b', COLUMN_KEY: 'PRI' }], undefined])
  query.mockResolvedValueOnce([[], undefined])
  await run(triggerRow, { table: "users' OR 1=1 -- " })
  for (const call of query.mock.calls.slice(0, 2)) {
    expect(call[5]).toContain('where table_name = ?')
    expect(call[6]).toEqual(["users' OR 1=1 -- "])
  }
  expect(lastStatement()[0]).toContain('`a``b` as id')
})

test('table resources bind schema and table filter values', async () => {
  const schema = "test' OR 1=1 -- "
  const name = "users' UNION SELECT 'secret' -- "
  await run(table.list.operation.perform, { database: schema })
  expect(lastStatement()).toEqual([
    'select tidb_table_id,table_name from information_schema.tables where table_schema = ?',
    [schema],
  ])
  await run(table.search.operation.perform, { database: schema, table: name })
  expect(lastStatement()).toEqual([
    'select table_name from information_schema.tables where table_schema = ? and table_name = ?',
    [schema, name],
  ])
})

test('column picker quotes its table name', async () => {
  await run(column.list.operation.perform, { table: 'x` WHERE 1=1 -- ' })
  expect(lastStatement()).toEqual(['show columns from `x`` WHERE 1=1 -- `'])
})

test('create database quotes the complete name', async () => {
  await run(database.create.operation.perform, { database: 'x` CHARACTER SET latin1 -- ' })
  expect(lastStatement()).toEqual(['create database if not exists `x`` CHARACTER SET latin1 -- `'])
})
