package main

import (
	"bytes"
	"context"
	"crypto/tls"
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/tidbcloud/pkgv2/log"
	"github.com/tidbcloud/tidbcloud-cli/pkg/tidbcloud/v1beta1/serverless/imp"
	"go.uber.org/zap"
)

const (
	ticloudCmd = "/Users/leon/GolandProjects/tidbcloud-cli/bin/ticloud"

	importIDRegexp = "Import task ([\\w-]+) started."

	EnvAwsRoleArn                    = "AWS_ROLE_ARN"
	EnvAwsRoleArnDiffExternalID      = "AWS_ROLE_ARN_DIFF_EXTERNAL_ID"
	EnvAwsRoleArnNoPrivilege         = "AWS_ROLE_ARN_NO_PRIVILEGE"
	EnvAwsAccessKeyID                = "AWS_ACCESS_KEY_ID"
	EnvAwsSecretAccessKey            = "AWS_SECRET_ACCESS_KEY"
	EnvAwsAccessKeyIDNoPrivilege     = "AWS_ACCESS_KEY_ID_NO_PRIVILEGE"
	EnvAwsSecretAccessKeyNoPrivilege = "AWS_SECRET_ACCESS_KEY_NO_PRIVILEGE"

	EnvGcsServiceAccountKey            = "GCS_SERVICE_ACCOUNT_KEY"
	EnvGcsServiceAccountKeyNoPrivilege = "GCS_SERVICE_ACCOUNT_KEY_NO_PRIVILEGE"

	EnvAzureSaToken            = "AZURE_BLOB_SA_TOKEN"
	EnvAzureSaTokenNoPrivilege = "AZURE_BLOB_SA_TOKEN_NO_PRIVILEGE"
)

func main() {
	host := os.Args[1]
	user := os.Args[2]
	password := os.Args[3]
	clusterID := os.Args[4]

	ctx := context.Background()
	err := mysql.RegisterTLSConfig("tidb", &tls.Config{
		MinVersion: tls.VersionTLS12,
		ServerName: host,
	})
	if err != nil {
		log.Fatal(ctx, "failed to register tls config -> ", zap.Error(err))
	}
	db, err := sql.Open("mysql", fmt.Sprintf(
		"%s:%s@tcp(%s:4000)/test?tls=tidb&connectionAttributes=%s",
		user, password, host, url.QueryEscape("program_name:pingcap/cli-test-import")),
	)
	if err != nil {
		log.Fatal(ctx, "failed to connect database -> ", zap.Error(err))
	}
	defer db.Close()

	// s3 e2e
	//e2eS3ArnImport(ctx, clusterID, db)
	//
	//e2eS3ArnNoPrivilegeImport(ctx, clusterID, db)
	//
	//e2eS3ArnDiffPrivilegeImport(ctx, clusterID, db)
	//
	//e2eS3AccessKeyImport(ctx, clusterID, db)
	//
	//e2eS3AccessKeyNoPrivilegeImport(ctx, clusterID, db)

	// local file e2e
	//e2eLocalImport(ctx, clusterID, db)

	// gcs e2e
	//e2eGcsImport(ctx, clusterID, db)
	//e2eGcsNoPrivilegeImport(ctx, clusterID, db)

	// azure e2e
	//e2eAzureImport(ctx, clusterID, db)
	e2eAzureNoPrivilegeImport(ctx, clusterID, db)

	// file type e2e
	//e2eParquetImport(ctx, clusterID, db)

	//e2eSchemaColumnNumberMismatchImport(ctx, clusterID, db)

	//e2eSchemaCompressImport(ctx, clusterID, db)

	//e2eSchemaTypeMisMatchedImport(ctx, clusterID, db)
}

func waitImport(ctx context.Context, clusterID, importID string, logger *zap.Logger) error {
	logger = logger.With(zap.String("importID", importID))
	// Wait for the import task to finish
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	timeout := time.After(5 * time.Minute)

	for {
		select {
		case <-ticker.C:
			cmd := exec.CommandContext(
				ctx,
				ticloudCmd,
				"serverless",
				"import",
				"get",
				"-c", clusterID,
				"--import-id", importID)
			var stdout bytes.Buffer
			var stderr bytes.Buffer
			cmd.Stdout = &stdout
			cmd.Stderr = &stderr
			err := cmd.Run()
			if err != nil {
				logger.Fatal("failed to get import status -> ", zap.Error(err), zap.String("stdout", stdout.String()), zap.String("stderr", stderr.String()))
			}
			var i imp.Import
			err = i.UnmarshalJSON(stdout.Bytes())
			if err != nil {
				logger.Fatal("failed to unmarshal import status -> ", zap.Error(err), zap.String("stdout", stdout.String()))
			}
			if *i.State == imp.IMPORTSTATEENUM_COMPLETED {
				if i.HasTotalSize() && strings.EqualFold(*i.TotalSize, "0") {
					return errors.New("import succeeded but no data imported")
				}
				return nil
			} else if *i.State == imp.IMPORTSTATEENUM_FAILED {
				if i.Message == nil {
					return errors.New("import failed")
				}
				return errors.New(*i.Message)
			} else if *i.State == imp.IMPORTSTATEENUM_CANCELING || *i.State == imp.IMPORTSTATEENUM_CANCELED {
				logger.Fatal("import task cancelled")
			}
		case <-timeout:
			logger.Fatal("import task timed out")
		}
	}
}

func expectFail(err error, errorMsg string, logger *zap.Logger) {
	if err != nil {
		if strings.Contains(err.Error(), errorMsg) {
			logger.Info("import failed as expected")
			return
		}
		logger.Fatal("import failed, but not as expected -> ", zap.Error(err))
	}
	logger.Fatal("import should fail, but succeeded")
}
