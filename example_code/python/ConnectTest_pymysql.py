import pymysql
import sys

connection = pymysql.connect(host=sys.argv[1],
                             user=sys.argv[2],
                             port= 4000,
                             password = sys.argv[3],
                             database = 'test',
                             program_name = 'pingcap/serverless-test',
                             ssl_ca = sys.argv[4],
                             ssl_verify_cert = True,
                             ssl_verify_identity = True)

cursor = connection.cursor()
cursor.execute("SHOW DATABASES")
data = cursor.fetchall()
print(data)
