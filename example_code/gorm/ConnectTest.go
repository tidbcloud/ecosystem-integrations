package main

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/url"
	"os"

	"github.com/go-sql-driver/mysql"
	gormmysql "gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	host := os.Args[1]
	user := os.Args[2]
	password := os.Args[3]

	mysql.RegisterTLSConfig("tidb", &tls.Config{
		MinVersion: tls.VersionTLS12,
		ServerName: host,
	})
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:4000)/test?tls=tidb&connectionAttributes=%s",
		user, password, host, url.QueryEscape("program_name:pingcap/serverless-test"),
	)

	db, err := gorm.Open(gormmysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database", err)
	}

	var dbname string
	db.Raw("SELECT DATABASE()").Scan(&dbname)
	fmt.Println(dbname)
}
