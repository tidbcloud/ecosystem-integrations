# User Guide

See [Integrate TiDB Cloud with Zapier](https://docs.pingcap.com/tidbcloud/integrate-tidbcloud-with-zapier)

Use a dedicated database user with only the permissions needed by the Zap, scoped to its tables or database. Replace the default **TiDB User** with that username and use its password; avoid the cluster's default administrative account for routine workflows.

**Custom Query** and **Create Table** execute SQL supplied by the Zap author with the configured database user's permissions. Keep **Query** and **Table DDL** under the author's control. Do not map untrusted webhook, email or form data into those fields or concatenate it into SQL. Use the structured row actions and search for external data values instead. Restrict access to editing Zaps and their connection settings.

# Dev Guide

### Requirements

You need nodejs14 and zapier CLI to develop the zapier-tidbcloud.

See [zapier-platform](https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md) for more details.

### How to fmt

```
npm i -g @sane-fmt/wasm32-wasi
```

```
cd zapier
sane-fmt --write
```

### How to test

See [test/README.md](test/README.md) for more details.


### How to manage version

See [Deploying an App Version](https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#deploying-an-app-version) for more details.

### How to release

> Warning
> - Do not push to zapier for your every change! Only push it when you want to release a new version.
> - Do not push a new App to zapier!

1. Ask cloud ecosystem team to add you to the zapier-tidbcloud team

2. List the App you can administer

```
zapier integrations
```

3. Lists and links a selected app in Zapier to your current folder

```
zapier link
```

4. Change version in `package.json` and build

```
npm install
```

6. Push to Zapier (it is private and will not push to production)

```
zapier push
```

6. Release (mark a version as the "production" version)

```
zapier promote ${version}
```

7. Migrate (migrate a version to a new version)

```
 zapier migrate ${old_version} ${new_version}
```
