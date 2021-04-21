from flask import Flask, jsonify, abort, request, make_response, url_for
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask_cors import CORS, cross_origin
import json

app = Flask(__name__)

CORS(app, origins="http://localhost:4200", allow_headers=[
    "Content-Type", "Authorization", "Access-Control-Allow-Credentials","Access-Control-Allow-Origin"],
    supports_credentials=True, intercept_exceptions=False)

users = [
    {
        'id': 1,
        'name': u'Julian',
        'surnames': u'de Pablo Torremocha',
        'password': u'1234',
        'admin': True,
        'phone': u'123456789',
    },
    {
        'id': 2,
        'name': u'Alfonso',
        'surnames': u'Vega Garcia',
        'password': u'1234',
        'admin': True,
        'phone': u'123456789',
    },
    {
        'id': 3,
        'name': u'Juan',
        'surnames': u'Lasso de la Vega Ruiz-Fornells',
        'password': u'1234',
        'admin': True,
        'phone': u'123456789',
    }
]

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify( { 'error': 'Not found' } ), 404)

@app.route('/admin', methods = ['GET'])
def get_users():
    return jsonify( { 'users': users } )

@app.route('/user/<int:id>', methods = ['GET'])
def get_user(id):
    user = list(filter(lambda t: t['id'] == id, users))
    if len(user) == 0:
        abort(404)
    return jsonify( { 'user': user[0] } )

@app.route('/register', methods = ['POST'])
def create_user():
    if not request.json or not 'titulo' in request.json:
        abort(400)
    user = {
        'id': users[-1]['id'] + 1,
        'name': request.json['name'],
        'surnames': request.json['surnames'],
        'password': request.json['password'],
        'admin': False,
        'phone': request.json['phone'],
    }
    users.append(user)
    return jsonify( { 'actividad': user } ), 201

@app.route('/admin/<int:id>', methods = ['DELETE'])
def delete_user(id):
    user = list(filter(lambda t: t['id'] == id, users))
    if len(user) == 0:
        abort(404)
    users.remove(user[0])
    return jsonify( { 'result': True } )
    
if __name__ == '__main__':
    app.run(debug = True)