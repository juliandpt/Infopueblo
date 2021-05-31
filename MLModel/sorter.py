
from nltk.corpus.reader.util import PickleCorpusView
import pandas as pd
import numpy as np
import mariadb
import nltk
nltk.download('stopwords')
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import sys


cat = ['Despoblacion','No Despoblacion']

content = sys.argv[1]
print(content)
title = sys.argv[2]


try:
    conn = mariadb.connect(
        user="pr_grupob",
        password="PC2-2021",
        host="2.139.176.212",
        port=3306,
        database="prgrupob"

    )
except mariadb.Error as e:
    print(f"Error connecting to MariaDB Platform: {e}")
    sys.exit(1)

# Get Cursor
cur = conn.cursor()
leido = joblib.load("D:\Documentos\Descargas\codigo\dictionary.gay")
model = joblib.load("D:\Documentos\Descargas\codigo\model.gay")

tfidf = TfidfVectorizer(sublinear_tf=True, min_df=5, norm='l2', encoding='UTF-8', ngram_range=(1, 2), stop_words=stopwords.words('spanish'))
text_features = leido.transform(content)

predictions = model.predict(text_features)
for text, predicted in zip(news, predictions):
  print('"{}"'.format(text))
  print("  - Predicted as: '{}'".format(cat[predicted]))
  print("")