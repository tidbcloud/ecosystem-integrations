# n8n-nodes-tidb-cloud

This is an n8n community node. It lets you use TiDB Cloud in your n8n workflows.

[TiDB Cloud](https://tidbcloud.com/) is a fully-managed Database-as-a-Service (DBaaS) that brings everything great about TiDB to your cloud and lets you focus on your applications, not the complexities of your database.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform. 

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

### Prerequisites

Create a [TiDB Cloud](https://tidbcloud.com/) account.

### Using API Key

1. Access your TiDB Cloud dashboard.
2. Click on the ***account*** tab in the top right.
3. Click ***Organization Settings***.
4. Click ***API Keys*** tab.
5. Click on the ***Create API Key*** button to create a new API Key.
6. Use these ***API Keys*** with your TiDB Cloud node credentials in n8n.

For more information,	see [TiDB Cloud API Overview](https://docs.pingcap.com/tidbcloud/api-overview/).

## Supported Operations

- Create TiDB Serverless clusters
- Execute SQL in TiDB Cloud
- Delete rows in TiDB Cloud
- Insert rows in TiDB Cloud
- Update rows in TiDB Cloud

## Usage

Here is an example usage, click [here](./doc/example_usage.md) to find more information.

## Resources

* [TiDB Cloud API Overview](https://docs.pingcap.com/tidbcloud/api-overview/)
* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
