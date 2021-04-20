from flask import Flask, jsonify, abort, request, make_response, url_for
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask_cors import CORS, cross_origin
import json

app = Flask(__name__)
CORS(app, origins="http://localhost:4200", allow_headers=[
    "Content-Type", "Authorization", "Access-Control-Allow-Credentials","Access-Control-Allow-Origin"],
    supports_credentials=True, intercept_exceptions=False)

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify( { 'error': 'Not found' } ), 404)

@app.route('/analisis', methods = ['POST'])
def create_texto():
    if not request.json or not 'cuerpo' in request.json:
        abort(400)
    texto = {
        'cuerpo': request.json['cuerpo'],
    }

    sentence = texto['cuerpo']
    analyzer = SentimentIntensityAnalyzer().polarity_scores(sentence)
    print(analyzer)
    return jsonify(analyzer), 201
    
if __name__ == '__main__':
    app.run(debug = True)
