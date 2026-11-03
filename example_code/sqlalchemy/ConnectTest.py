import os
import sys
from sqlalchemy import create_engine, text

DATABASE_URL = "mysql+mysqldb://%s:%s@%s:4000/test?ssl_ca=%s"%(sys.argv[2], os.environ["TIDB_PASSWORD"], sys.argv[1], sys.argv[3])

engine = create_engine(DATABASE_URL)
conn = engine.connect()

res = conn.execute(text("SHOW DATABASES")).fetchall()
print(res)
