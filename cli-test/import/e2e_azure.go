package main

import (
	"bytes"
	"context"
	"database/sql"
	"os"
	"os/exec"
	"regexp"
	"time"

	"github.com/tidbcloud/pkgv2/log"
	"go.uber.org/zap"
)

func e2eAzureImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eAzureImport"))
	_, err := db.Exec("DROP TABLE IF EXISTS a")
	if err != nil {
		logger.Fatal("failed to drop table -> ", zap.Error(err))
	}

	logger.Info("start import")
	startImportContext, cancel := context.WithTimeout(ctx, 1*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(
		startImportContext,
		ticloudCmd,
		"serverless",
		"import",
		"start",
		"-c", clusterID,
		"--source-type", "AZURE_BLOB",
		"--azblob.sas-token", os.Getenv(EnvAzureSaToken),
		"--azblob.uri", "azure://yxstudent.blob.core.windows.net/student/",
		"--file-type", "CSV",
		"--csv.separator", ";")
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		logger.Fatal("failed to start import -> ", zap.Error(err), zap.String("stdout", stdout.String()), zap.String("stderr", stderr.String()))
	}

	re := regexp.MustCompile(importIDRegexp)
	matched := re.FindStringSubmatch(stdout.String())
	if len(matched) != 2 {
		logger.Fatal("failed to parse import task ID")
	}
	importID := matched[1]
	err = waitImport(ctx, clusterID, importID, logger)
	if err != nil {
		logger.Fatal("import failed -> ", zap.Error(err))
	}
	logger.Info("import finished")
}

func e2eAzureNoPrivilegeImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eAzureImport"))
	_, err := db.Exec("DROP TABLE IF EXISTS a")
	if err != nil {
		logger.Fatal("failed to drop table -> ", zap.Error(err))
	}

	logger.Info("start import")
	startImportContext, cancel := context.WithTimeout(ctx, 1*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(
		startImportContext,
		ticloudCmd,
		"serverless",
		"import",
		"start",
		"-c", clusterID,
		"--source-type", "AZURE_BLOB",
		"--azblob.sas-token", os.Getenv(EnvAzureSaTokenNoPrivilege),
		"--azblob.uri", "azure://yxstudent.blob.core.windows.net/student/",
		"--file-type", "CSV",
		"--csv.separator", ";")
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		logger.Fatal("failed to start import -> ", zap.Error(err), zap.String("stdout", stdout.String()), zap.String("stderr", stderr.String()))
	}

	re := regexp.MustCompile(importIDRegexp)
	matched := re.FindStringSubmatch(stdout.String())
	if len(matched) != 2 {
		logger.Fatal("failed to parse import task ID")
	}
	importID := matched[1]
	err = waitImport(ctx, clusterID, importID, logger)
	expectFail(err, "error", logger)
}
