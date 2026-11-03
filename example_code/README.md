# Connection smoke tests

Set `TIDB_PASSWORD` in the environment before running these examples. Do not
include the password in command-line arguments. Host, user, and other arguments
keep their existing order, with the password argument removed. For example:

```sh
python3 example_code/python/tls_version.py HOST 4000 USER /path/to/ca.pem TLSv1.3
```

The Java examples accept `USER HOST`. The serverless JavaScript example accepts
`DATABASE_URL` without a password and reads `TIDB_PASSWORD` separately.

CI supplies database passwords only to the connection steps. MySQL and mycli
use their supported `MYSQL_PWD` environment variable. This removes passwords
from their command lines; it does not protect secrets from malicious code
running with the same permissions on the runner.

The workflows still use `ticloud 0.5.2`, whose non-interactive cluster creation
requires `--root-password`. Those two creation commands still expose the
password in process arguments. Removing that exposure requires CLI support for
stdin or a password file, or a separately validated replacement for cluster
creation. Do not consider the entire credential handling finding resolved.

Keep CI credentials restricted to test resources and the permissions required
by each workflow. Manage rotation and revocation in the owning TiDB Cloud
project and GitHub repository secrets; never commit credentials to this repo.

Run the local credential input checks without database access:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -v
node tests/test_ci_credentials.js
```
