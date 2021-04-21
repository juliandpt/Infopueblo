import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

con = psycopg2.connect(dbname='d20hkpogjrcusn',
      user='amvnwrnjzqtkgh', host='ec2-99-80-200-225.eu-west-1.compute.amazonaws.com',
      password='e795f9d0a48704ea436bbd5d8efdbc914c9e146aaad730b0aca9c819ebbff0aa', port='5432')

con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

cur = con.cursor()

cur.execute("CREATE TABLE IF NOT EXISTS prueba (user_id serial PRIMARY KEY, username VARCHAR ( 50 ) UNIQUE NOT NULL, password VARCHAR ( 50 ) NOT NULL);")
cur.execute("insert into prueba (username,password) values ('julian','password1');")
cur.execute("insert into prueba (username,password) values ('jorge','pas1');")
cur.execute("select user_id, username, password from prueba")
row = cur.fetchone()

while row is not None:
    print(row)
    row = cur.fetchone()
cur.close
