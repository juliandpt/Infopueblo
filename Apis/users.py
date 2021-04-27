import psycopg2, hashlib, json, jwt
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
            'password': request.json['password'],
            'phone': request.json['phone'],
            'entry_date': datetime.now().strftime("%Y-%m-%d")
        }
        print(user['email'])
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        cur.execute("insert into users (email,password,name,surnames,phone,entry_date,leaving_date,admin,token) values ('" +
                    user['email'] + "','" + user['password'] + "','" + user['name'] + "','" + user['surnames'] + "','" + user['phone'] + "','" + user['entry_date'] + "',NULL,true,NULL);")
        cur.close
        return 'ok'

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = {
            'email': request.json['email'],
            'password': request.json['password']
        }

        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        cur.execute("select * from users where users.email = '" + user['email'] + "' and users.password = '" + user['password'] + "';")
        response = cur.fetchall()
        print(response)
        cur.close

        if response is None:
            result = {
                'message': 'Access denied'
            }
            return jsonify(result)
        else:
            for row in response:
                userid = row[0]
            print(userid)
            claims = {
                'userid': userid,
                "jti": "9cbfbd5b-0ff2-410c-84c4-5f2ab912ae7b",
                "iat": 1619560577,
                "exp": 1619564177
            }

            token = jwt.encode(claims, "secret", "HS256")

            result = {
                'message': 'Access allowed',
                'token': token
            }

            return jsonify(result)

@app.route('/user/<int:id>', methods=['GET'])
def get_user(id):
    user = list(filter(lambda t: t['id'] == id, users))
    if len(user) == 0:
        abort(404)
    return jsonify({'user': user[0]})

@app.route('/register', methods=['GET', 'POST'])
def createUser():
    if not request.json or not 'email' in request.json:
        abort(400)
    if request.method == 'POST':
        user = {
            'email': request.json['email'],
            'name': request.json['name'],
            'surnames': request.json['surnames'],
            'password': request.json['password'],
            'phone': request.json['phone'],
            'entry_date': datetime.now().strftime("%Y-%m-%d")
        }
        print(user['email'])
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        cur.execute("insert into users (email,password,name,surnames,phone,entry_date,leaving_date,admin,token) values ('" +
                    user['email'] + "','" + user['password'] + "','" + user['name'] + "','" + user['surnames'] + "','" + user['phone'] + "','" + user['entry_date'] + "',NULL,false,NULL);")
        cur.close
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