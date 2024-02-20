import mysql.connector
import sys

connection = mysql.connector.connect(host=sys.argv[1],
                                     port=sys.argv[2],
                                     user=sys.argv[3],
                                     password = sys.argv[4],
                                     database = 'test',
                                     ssl_ca = sys.argv[5],
                                     ssl_verify_identity = True,
                                     tls_versions=[sys.argv[6]])

cursor = connection.cursor()
cursor.execute("SHOW DATABASES")
data = cursor.fetchall()
print(data)
