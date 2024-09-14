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

func e2eS3ArnNoPrivilegeImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eS3ArnNoPrivilegeImport"))
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
		"--s3.uri", "s3://tidbcloud-samples-testimport/yx-test-import/test-with-schema/",
		"--s3.role-arn", os.Getenv(EnvAwsRoleArnNoPrivilege),
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
	expectFail(err, "is not authorized to perform: s3:ListBucket", logger)
}

func e2eS3ArnDiffPrivilegeImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eS3ArnDiffPrivilegeImport"))
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
		"--s3.uri", "s3://import-local-dev-us-east-1/yx-test-import/test-with-schema/",
		"--s3.role-arn", os.Getenv(EnvAwsRoleArnDiffExternalID),
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
	expectFail(err, "is not authorized to perform: sts:AssumeRole on resource", logger)
}

func e2eS3AccessKeyNoPrivilegeImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eS3AccessKeyNoPrivilegeImport"))
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
		"--s3.uri", "s3://tidbcloud-samples-testimport/yx-test-import/test-with-schema/",
		"--s3.access-key-id", os.Getenv(EnvAwsAccessKeyIDNoPrivilege),
		"--s3.secret-access-key", os.Getenv(EnvAwsSecretAccessKeyNoPrivilege),
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
	expectFail(err, "AccessDenied", logger)
}

func e2eS3AccessKeyImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eS3AccessKeyImport"))
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
		"--s3.uri", "s3://tidbcloud-samples-testimport/yx-test-import/test-with-schema/",
		"--s3.access-key-id", os.Getenv(EnvAwsAccessKeyID),
		"--s3.secret-access-key", os.Getenv(EnvAwsSecretAccessKey),
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
	if err != nil {
		logger.Fatal("import failed -> ", zap.Error(err))
	}
	logger.Info("import finished")
}

func e2eS3ArnImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eS3ArnImport"))
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
		"--s3.uri", "s3://tidbcloud-samples-testimport/yx-test-import/test-with-schema/",
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
	if err != nil {
		logger.Fatal("import failed -> ", zap.Error(err))
	}
	logger.Info("import finished")
}
