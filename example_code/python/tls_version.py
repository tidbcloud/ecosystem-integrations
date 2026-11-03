import os
import mysql.connector
import sys

connection = mysql.connector.connect(host=sys.argv[1],
                                     port=sys.argv[2],
                                     user=sys.argv[3],
                                     password = os.environ["TIDB_PASSWORD"],
                                     database = 'test',
                                     ssl_ca = sys.argv[4],
                                     ssl_verify_identity = True,
                                     tls_versions=[sys.argv[5]])

cursor = connection.cursor()
cursor.execute("SHOW DATABASES")
data = cursor.fetchall()
print(data)
