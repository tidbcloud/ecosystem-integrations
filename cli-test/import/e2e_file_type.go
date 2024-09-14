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

func e2eParquetImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eParquetImport"))
	_, err := db.Exec("DROP TABLE IF EXISTS ppp")
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
		"--s3.uri", "s3://tidbcloud-samples-testimport/yx-test-import/test-parquet/",
		"--s3.role-arn", os.Getenv(EnvAwsRoleArn),
		"--source-type", "S3",
		"--file-type", "PARQUET")
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

func e2eSchemaCompressImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eSchemaCompressImport"))
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
		"--s3.uri", "s3://tidbcloud-samples-testimport/yx-test-import/test-with-schema-compress/",
		"--s3.role-arn", os.Getenv(EnvAwsRoleArn),
		"--source-type", os.Getenv(EnvAwsRoleArn),
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

func e2eSchemaTypeMisMatchedImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eSchemaTypeMisMatchedImport"))
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
		"--s3.uri", "s3://tidbcloud-samples-testimport/yx-test-import/test-schema-type-mismatch/",
		"--s3.role-arn", os.Getenv(EnvAwsRoleArn),
		"--source-type", "S3",
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
	expectFail(err, "failed to cast value as int(11) for column `name`", logger)
}

func e2eSchemaColumnNumberMismatchImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eSchemaColumnNumberMismatchImport"))
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
		"--s3.uri", "s3://tidbcloud-samples-testimport/yx-test-import/test-schema-column-number-mismatch/",
		"--s3.role-arn", os.Getenv(EnvAwsRoleArn),
		"--source-type", "S3",
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
	expectFail(err, "TiDB schema `test`.`a` doesn't have the default value for number", logger)
}
