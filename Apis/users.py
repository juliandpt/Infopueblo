import psycopg2
import hashlib
import json
import Database
from flask import Flask, jsonify, abort, request, make_response, url_for
from flask_cors import CORS, cross_origin
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from datetime import date, datetime

app = Flask(__name__)

CORS(app, origins="http://localhost:4200", allow_headers=[
    "Content-Type", "Authorization", "Access-Control-Allow-Credentials", "Access-Control-Allow-Origin"],
    supports_credentials=True, intercept_exceptions=False)

con = psycopg2.connect(dbname='d20hkpogjrcusn',
                       user='amvnwrnjzqtkgh', host='ec2-99-80-200-225.eu-west-1.compute.amazonaws.com',
                       password='e795f9d0a48704ea436bbd5d8efdbc914c9e146aaad730b0aca9c819ebbff0aa', port='5432')

con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

cur = con.cursor()


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


@app.route('/admin', methods=['GET', 'POST'])
def createAdmin():
    if not request.json or not 'titulo' in request.json:
        abort(400)
    if request.method == 'POST':
        user = {
            'email': request.json['email'],
            'name': request.json['name'],
            'surnames': request.json['surnames'],
            'password': hashlib.sha1(request.json['password'].encode('utf-8')).hexdigest(),
            'admin': True,
            'phone': request.json['phone'],
            'fecha_alta': datetime.now().strftime("%d/%m/%Y"),
            'fecha_baja': 'NULL'
        }

        db = Database.Database()
        db.insertUser(user)
        return 'ok'


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = {
            'email': request.json['Email'],
            'password': request.json['Password']
        }

        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

        cur = con.cursor()
        cur.execute("select * from usuario where usuario.email = '" +
                    request.json['Email'] + "' and usuario.contrasena = '" + request.json['Password'] + "';")
        response = cur.fetchone()
        print(response)
        cur.close

        if response:
            # auth_token = self.encode_auth_token(row[0])
            # print(auth_token)
            return 'OK'
        else:
            result = 'email y/o contraseña incorrectos'
            return 'KO'


@app.route('/user/<int:id>', methods=['GET'])
def get_user(id):
    user = list(filter(lambda t: t['id'] == id, users))
    if len(user) == 0:
        abort(404)
    return jsonify({'user': user[0]})


@app.route('/register', methods=['GET', 'POST'])
def createUser():
    if not request.json or not 'Email' in request.json:
        abort(400)
    if request.method == 'POST':
        user = {
            'email': request.json['Email'],
            'name': request.json['Name'],
            'surnames': request.json['lastName'],
            'password': request.json['Password'],
            'admin': False,
            'phone': request.json['Phone'],
            'fecha_alta': datetime.now().strftime("%d/%m/%Y"),
            'fecha_baja': 'NULL'
        }
        print(request.json['Email'])
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        cur.execute("insert into usuario (email,contrasena,nombre,apellidos,telefono,fecha_alta,fecha_baja,administrador) values ('" +
                    request.json['Email'] + "','" + request.json['Password'] + "','" + request.json['Name'] + "','" + request.json['lastName'] + "','" + request.json['Phone'] + "','" + date.today().strftime("%Y-%m-%d") + "', NULL,False);")
        cur.close
        # db = Database.Database()
        # db.insertUser(user)
        return 'ok'


@app.route('/admin/<int:id>', methods=['DELETE'])
def deleteUser(id):
    user = list(filter(lambda t: t['id'] == id, users))
    if len(user) == 0:
        abort(404)
    users.remove(user[0])
    return jsonify({'result': True})


if __name__ == '__main__':
    app.run(debug=True)
