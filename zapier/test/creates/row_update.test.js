/* globals beforeEach, expect, jest, test */

jest.mock('../../tidb_client/PromiseClient', () => jest.fn())

const query = require('../../tidb_client/PromiseClient')
const { operation } = require('../../creates/row_update')

const inputData = {
  host: 'localhost',
  user: 'test',
  port: 4000,
  tidbPassword: 'test',
  database: 'test',
  table: 'users',
  id_column: 'id',
  id_column_value: 1,
}
const z = { errors: { Error } }

beforeEach(() => {
  query.mockReset()
  query.mockResolvedValueOnce([[{ Field: 'name' }, { Field: 'age' }], undefined])
  query.mockResolvedValueOnce([{}, undefined])
})

test.each(["O'Reilly", "changed' WHERE 1=1 -- "])(
  'binds update value %s instead of adding it to SQL',
  async name => {
    await operation.perform(z, { inputData: { ...inputData, name, age: 20 } })

    expect(query).toHaveBeenLastCalledWith(
      'localhost',
      'test',
      4000,
      'test',
      'test',
      'update users set name = ?,age = ? where id = ?',
      [name, 20, 1],
    )
  },
)

test.each(['1 OR 1=1', 'customer-123'])(
  'binds ID value %s instead of adding it to SQL',
  async id => {
    await operation.perform(z, {
      inputData: { ...inputData, name: 'updated', id_column_value: id },
    })

    expect(query).toHaveBeenLastCalledWith(
      'localhost',
      'test',
      4000,
      'test',
      'test',
      'update users set name = ? where id = ?',
      ['updated', id],
    )
  },
)

test.each([undefined, null, ''])('continues skipping empty update value %s', async name => {
  await operation.perform(z, { inputData: { ...inputData, name, age: 0 } })

  expect(query).toHaveBeenLastCalledWith(
    'localhost',
    'test',
    4000,
    'test',
    'test',
    'update users set age = ? where id = ?',
    [0, 1],
  )
})
