# n8n-nodes-tidb-cloud

This is an n8n community node. It lets you use TiDB Cloud in your n8n workflows.

[TiDB Cloud](https://tidbcloud.com/) is a MySQL-compatible, fully-managed Database-as-a-Service (DBaaS) that brings everything great about TiDB to your cloud and lets you focus on your applications, not the complexities of your database.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform. 

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

### Prerequisites

Create a [TiDB Cloud](https://tidbcloud.com/) account.

### Using API Key

1. Access your TiDB Cloud dashboard.
2. Click **Organization** >  **Organization Settings** in the upper-right corner.
3. Click the **API Keys** tab.
4. Click the **Create API Key** button to create a new API Key.
5. Save the created API key for later use in n8n.

For more information, see [TiDB Cloud API Overview](/tidb-cloud/api-overview.md).

## Support Operation

TiDB Cloud Node acts as a [regular node](https://docs.n8n.io/workflows/nodes/#regular-nodes), and only supports the following five operations.

- **Create Serverless Cluster**: Create a TiDB Cloud Serverless Tier cluster.
- **Execute SQL**: Execute an SQL statement in TiDB.
- **Delete**：Delete rows in TiDB.
- **Insert**: Insert rows in TiDB.
- **Update**: Update rows in TiDB.

## Usage

Here is an example usage, click [here](./doc/example_usage.md) to find more information.

## Fields Description

Different operations require different fields to be filled in. The following shows the respective field descriptions according to the operation.

### Create Serverless Cluster

- **Credential for TiDB Cloud API**: Only supports TiDB Cloud API key authentication. Refer to [Get TiDB Cloud API Key](#prerequisites-get-tidb-cloud-api-key).
- **Project**: The TiDB Cloud project name.
- **Operation**: The operation of this node. Refer to [Support Operation](#support-operation).
- **Cluster**: The TiDB Cloud cluster name. Enter one name for your new cluster.
- **Region**: The region name. Choose a region where your cluster will be deployed. Usually, choose the region closest to your application deployment.
- **Password**: The root password. Set a password for your new cluster.

### Execute SQL

- **Credential for TiDB Cloud API**: Only supports TiDB Cloud API key authentication. Refer to [Get TiDB Cloud API Key](#prerequisites-get-tidb-cloud-api-key).
- **Project**: The TiDB Cloud project name.
- **Operation**: The operation of this node. Refer to [Support Operation](#support-operation).
- **Cluster**: The TiDB Cloud cluster name.
- **Password**: The password of TiDB Cloud cluster.
- **User**: The username of your TiDB Cloud cluster.
- **Database**: The database name.
- **SQL**: The SQL statement to execute.

### Delete

- **Credential for TiDB Cloud API**: Only supports TiDB Cloud API key authentication. Refer to [Get TiDB Cloud API Key](#prerequisites-get-tidb-cloud-api-key).
- **Project**: The TiDB Cloud project name.
- **Operation**: The operation of this node. Refer to [Support Operation](#support-operation).
- **Cluster**: The TiDB Cloud cluster name. In the Create Serverless Cluster operation, you need to enter one name for your new cluster . While in other operations, you should choose one existing cluster.
- **Password**: The password of TiDB Cloud cluster.
- **User**: The username of your TiDB Cloud cluster.
- **Database**: The database name.
- **Table**: The table name. You can use `From list` mode to choose one or `Name` mode to type table name manually.
- **Delete Key**: The Name of the item's property which decides which rows in the database should be deleted. Item is the data sent from one node to another. A node performs its action on each item of incoming data. For more information about item in n8n, see [n8n documentation](https://docs.n8n.io/workflows/items/).

### Insert

- **Credential for TiDB Cloud API**: Only supports TiDB Cloud API key authentication. Refer to [Get TiDB Cloud API Key](#prerequisites-get-tidb-cloud-api-key).
- **Project**: The TiDB Cloud project name.
- **Operation**: The operation of this node. Refer to [Support Operation](#support-operation).
- **Cluster**: The TiDB Cloud cluster name. In the Create Serverless Cluster operation, you need to enter one name for your new cluster . While in other operations, you should choose one existing cluster.
- **Password**: The password of TiDB Cloud cluster.
- **User**: The username of your TiDB Cloud cluster.
- **Database**: The database name.
- **Table**: The table name. You can use `From list` mode to choose one or `Name` mode to type table name manually.
- **Columns**: The comma-separated list of the input item's property which should used as columns for the new rows. Item is the data sent from one node to another. A node performs its action on each item of incoming data. For more information about item in n8n, see [n8n documentation](https://docs.n8n.io/workflows/items/).

### Update

- **Credential for TiDB Cloud API**: Only supports TiDB Cloud API key authentication. Refer to [Get TiDB Cloud API Key](#prerequisites-get-tidb-cloud-api-key).
- **Project**: The TiDB Cloud project name.
- **Operation**: The operation of this node. Refer to [Support Operation](#support-operation).
- **Cluster**: The TiDB Cloud cluster name. In the Create Serverless Cluster operation, you need to enter one name for your new cluster. While in other operations, you should choose one existing cluster.
- **Password**: The password of TiDB Cloud cluster.
- **User**: The username of your TiDB Cloud cluster.
- **Database**: The database name.
- **Table**: The table name. You can use `From list` mode to choose one or `Name` mode to type table manually.
- **Update Key**: The name of the item's property which decides which rows in the database should be updated. Item is the data sent from one node to another. A node performs its action on each item of incoming data. For more information about item in n8n, see [n8n documentation](https://docs.n8n.io/workflows/items/).
- **Columns**: The comma-separated list of the input item which should used as columns for the rows to update.

## Limitations

1. Normally only one SQL statement is allowed in the **Execute SQL** operation. If you want to execute more than one statement in a single operation, you need to manually enable [`tidb_multi_statement_mode`](https://docs.pingcap.com/tidb/dev/system-variables#tidb_multi_statement_mode-new-in-v4011).
2. The **Delete** and **Update** operation need to specify one field as a key. For example, the `Delete Key` is set to `id`, which is equivalent to executing `delete from table where id = ${item.id}`. Currently, it only supports specifying one key.
3. The **Insert** and **Update** operation need to specify the comma-separated list in the **Columns** field, and the field name must be the same as the input item's property.

## Resources

* [TiDB Cloud API Overview](https://docs.pingcap.com/tidbcloud/api-overview/)
* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
