
import joblib, sys, json
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer

news = [sys.argv[1]]
#news = ["texto a clasificar"]

leido = joblib.load('./MLModel/responses/dictionary.pkl')
model = joblib.load('./MLModel/responses/model.pkl')

tfidf = TfidfVectorizer(sublinear_tf=True, min_df=5, norm='l2', encoding='UTF-8', ngram_range=(1, 2), stop_words=stopwords.words('spanish'))
text_features = leido.transform(news)

predictions = model.predict(text_features)
result = json.dumps({"predict": str(predictions[0])})
# for text, predicted in zip(news, predictions):
#   json = json.dumps({"predict": cat[predicted]})

print(result)