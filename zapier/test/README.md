
> You can learn how to test in this doc.

# PreRequisites

- Please go into zapier-tidbcloud directory before test with `cd zapier`.
- Please Add a `.env` file in zapier-tidbcloud directory to store your environment variables.

# Auth Test

1. Add public key and private key in .env file:

```
TEST_PUBLIC_KEY = fake_public_key
TEST_PRIVATE_KEY = fake_private_key
```

2. Test auth:

```
npm test -- authentication.test.js
```

# Project Resource Test

1. Add the following environment variables in .env file:

```
TEST_PUBLIC_KEY = fake_public_key
TEST_PRIVATE_KEY = fake_private_key
```

2.  Test project resource:

```
npm test -- project.test.js
```

# Cluster Resource Test

1. Add the following environment variables in .env file:

```
TEST_PUBLIC_KEY = fake_public_key
TEST_PRIVATE_KEY = fake_public_key
TEST_PROJECTID = fake_project_id
```

2. Test cluster resource

Make sure you don't have any serverless tier in your account.

```
npm test -- cluster.test.js
```

# Database Resource Test

1. Add the following environment variables in .env file:

```
TEST_PUBLIC_KEY = fake_public_key
TEST_PRIVATE_KEY = fake_public_key
TEST_PROJECTID = fake_project_id
TEST_CLUSTERID = fake_cluster_id
TEST_TIDB_HOST = fake_tidb_host
TEST_TIDB_USER = fake_tidb_user
TEST_TIDB_PORT = fake_tidb_port
TEST_TIDB_PASSWORD = fake_tidb_password
```

2. Test database resource

```
npm test -- database.test.js
```

# Table Resource Test

1. Add the following environment variables in .env file:

```
TEST_PUBLIC_KEY = fake_public_key
TEST_PRIVATE_KEY = fake_public_key
TEST_PROJECTID = fake_project_id
TEST_CLUSTERID = fake_cluster_id
TEST_TIDB_HOST = fake_tidb_host
TEST_TIDB_USER = fake_tidb_user
TEST_TIDB_PORT = fake_tidb_port
TEST_TIDB_PASSWORD = fake_tidb_password
TEST_DATABASE = fake_databse
```

2. Test table resource

```
npm test -- table.test.js
```

# Column Resource Test

1. Add the following environment variables in .env file:

```
TEST_PUBLIC_KEY = fake_public_key
TEST_PRIVATE_KEY = fake_public_key
TEST_PROJECTID = fake_project_id
TEST_CLUSTERID = fake_cluster_id
TEST_TIDB_HOST = fake_tidb_host
TEST_TIDB_USER = fake_tidb_user
TEST_TIDB_PORT = fake_tidb_port
TEST_TIDB_PASSWORD = fake_tidb_password
TEST_DATABASE = fake_databse
```

2. Test column resource

```
npm test -- column.test.js
```

# Row Test

1. Add the following environment variables in .env file:

```
TEST_PUBLIC_KEY = fake_public_key
TEST_PRIVATE_KEY = fake_public_key
TEST_PROJECTID = fake_project_id
TEST_CLUSTERID = fake_cluster_id
TEST_TIDB_HOST = fake_tidb_host
TEST_TIDB_USER = fake_tidb_user
TEST_TIDB_PORT = fake_tidb_port
TEST_TIDB_PASSWORD = fake_tidb_password
TEST_DATABASE = fake_databse
```

2. Test creates of row

```
npm test -- test/creates/row.test.js
```

3. Test searches of row

```
npm test -- test/searches/row.test.js
```

4. Test triggers of row

```
npm test -- test/triggers/row.test.js
```

# Test ALL

You can use `zapier test` to test all the tests. But we recommend you to test one by one because you can only create one serverless tier.

Thus, you can hardly test the cluster create and other tests which need a TiDB cluster in the same time.
