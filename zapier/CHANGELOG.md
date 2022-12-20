## 0.5.0

### Enhancements

- Replace the error `Code must be None or str, got dict` to a more readable error. [#7](https://github.com/tidbcloud/ecosystem-integrations/pull/7)

## 0.4.0

### Bug Fixes

- Fix the bug that fail to load connection information in Create/Find Row.

## 0.3.0

### Enhancements

- Add help doc link in auth help text.
- Add user-agent header in TiDB Cloud Open API request.

## 0.2.0

### Bug Fixes

- Fix the bug that error message is not displayed when you fail to insert a row with `Create Row` action.

### Enhancements

- `New Row (Custom Query)` trigger can only get the top 1000000 results in every fetch. The redundant results will be removed if you return more than 1000000 results. 
- `New Row (Custom Query)` trigger will check if you return an `id` field now. An error will be thrown if you don't return an `id` field.

## 0.1.0

### New Triggers

- New Cluster: Triggers when a new cluster is created.
- New Table: Triggers when a new table is created.
- New Row: Triggers when new rows are created. Only fetch the recently 10000 new rows.
- New Row (Custom Query): Triggers when new rows are returned from a custom query that you provide.

### New Actions

- Find Cluster: Finds an existing Serverless tier or Dedicated tier.
- Create Cluster: Creates a new cluster. Only support create a free serverless tier now.
- Find Database: Finds an existing Database.
- Create Database: Creates a new database.
- Find Table: Finds an existing Table.
- Create Table: Creates a new table.
- Create Row: Creates a new row.
- Update Row: Updates an existing row.
- Find Row: Finds a row in a table via a lookup column.
- Find Row (Custom Query): Finds a Row in a table via a custom query in your control.
