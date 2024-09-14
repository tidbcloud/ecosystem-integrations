package main

import (
	"bytes"
	"context"
	"database/sql"
	"os/exec"
	"regexp"
	"time"

	"github.com/tidbcloud/pkgv2/log"
	"go.uber.org/zap"
)

const (
	localFilePath = "/Users/leon/Downloads/test.a.csv"
)

func e2eLocalImport(ctx context.Context, clusterID string, db *sql.DB) {
	logger := log.WithContextL(ctx).With(zap.String("test", "e2eLocalImport"))
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
		"--local.file-path", localFilePath,
		"--local.target-database", "test",
		"--local.target-table", "a",
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
