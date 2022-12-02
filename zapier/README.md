# User Guide

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
zapier integration
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