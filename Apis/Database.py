import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from datetime import date
import datetime
import jwt
#from practica import app

class Database:
    def __init__(self):
        self.dbname='d20hkpogjrcusn'
        self.user='amvnwrnjzqtkgh'
        self.host='ec2-99-80-200-225.eu-west-1.compute.amazonaws.com'
        self.password='e795f9d0a48704ea436bbd5d8efdbc914c9e146aaad730b0aca9c819ebbff0aa'
        self.port='5432'

    def encode_auth_token(self, user_id):
        try:
            payload = {
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=0, minutes=20, seconds=0),
                'iat': datetime.datetime.utcnow(),
                'sub': user_id
            }
            return jwt.encode(
                payload,
                app.config.get('SECRET_KEY'),
                algorithm='HS256'
            )
        except Exception as e:
            return e

    def decode_auth_token(auth_token):
        try:
            payload = jwt.decode(auth_token, app.config.get('SECRET_KEY'))
            return payload['sub']
        except jwt.ExpiredSignatureError:
            return 'Signature expired. Please log in again.'
        except jwt.InvalidTokenError:
            return 'Invalid token. Please log in again.'

    def insertUser(self, user):
        con = psycopg2.connect(dbname=self.dbname, user=self.user, host=self.host, password=self.password, port=self.port)

        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

        cur = con.cursor()
        cur.execute("insert into usuario (usuario,contrasena,nombre,apellidos,telefono,fecha_alta,administrador) values (" + user['user'] + "," + user['password'] + "," + user['name'] + "," + user['surnames'] + "," + user['phone'] + "," + date.today().strftime("%m/%d/%Y") + ",False);")

        #cur.execute("insert into usuario (usuario,contrasena,nombre,apellidos,telefono,fecha_alta,administrador) values ('" + user['usuario'] + "','" + user['contrasena'] + "','" + user['nombre'] + "','" + user['apellidos'] + "','" + user['telefono'] + "','" + date.today().strftime("%m/%d/%Y") + "',False);")
        #cur.execute("select user_id, username, password from prueba")
        #row = cur.fetchone()

        #while row is not None:
        #    print(row)
        #    row = cur.fetchone()
        cur.close

    def login(self, user):
        con = psycopg2.connect(dbname=self.dbname, user=self.user, host=self.host, password=self.password, port=self.port)

        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

        cur = con.cursor()
        cur.execute("select * from usuario where usuario.usuario = '" + user['usuario'] + "' and usuario.contrasena = '" + user['contrasena'] + "';")
        row = cur.fetchone()

        if row:
            r = str(row[0])
            auth_token = self.encode_auth_token(row[0])
            print(auth_token)
        else:
            r = ""
        
        cur.close

        return(r)