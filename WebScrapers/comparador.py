#Introduccion de la información y pre-procesamiento
import pandas as pd
import numpy as np
import os
import nltk
nltk.download('stopwords')
from nltk.corpus import stopwords
import glob

#Exploracion de datos
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_selection import chi2

#Entrenamiento del modelo
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import cross_val_score

#Interpretación del modelo
from sklearn.model_selection import train_test_split

#Introduccion de la información y pre-procesamiento
ruta = ['WebScrapers/resultado/20minutos.json']

txt=list(map(lambda x:glob.glob(x), ruta))

txt=[item for i in txt for item in i]

titulo = []
lugar = []
tags = []
noticia = []
population = []
density = []
image = []
url = []
categorias = []

#Revisar esta parte
for i in txt:
  if i.startswith(ruta):
    categoria = 'Despoblacion'
  else:
    categoria = 'No Despoblacion'
  categorias.append(categoria)

  texto = open(i,"r", encoding='latin-1').read()
  for j in texto.split('\n\n'):
    textoFinal = j.split('\n####\n')
    if textoFinal[0] == 'title':
      titulo.append(textoFinal[1])
    elif textoFinal[0] == 'Lugar':
      lugar.append(textoFinal[1])
    elif textoFinal[0] == 'tags':
      tags.append(textoFinal[1])
    elif textoFinal[0] == 'noticia':
      noticia.append(textoFinal[1])

df = pd.DataFrame({
    'title': titulo,
    'Lugar': lugar,
    'tags': tags,
    'noticia': noticia,
    'Categoria': categoria
    })

print(df)

df.to_json('WebScrapers/resultado/clasificacion.json')
df = pd.read_json('WebScrapers/resultado/clasificacion.json')

print(df)
df['category_id'] = df['Categoria'].factorize()[0]

category_id_df = df[['Categoria', 'category_id']].drop_duplicates().sort_values('category_id')
category_to_id = dict(category_id_df.values)
id_to_category = dict(category_id_df[['category_id', 'Categoria']].values)

#Exploracion de datos
tfidf = TfidfVectorizer(sublinear_tf=True, min_df=5, norm='l2', encoding='UTF-8', ngram_range=(1, 2), stop_words=stopwords.words('spanish'))

features = tfidf.fit_transform(df.Cuerpo)
labels = df.category_id
features.shape

N = 3
for category, category_id in sorted(category_to_id.items()):
  features_chi2 = chi2(features, labels == category_id)
  indices = np.argsort(features_chi2[0])
  feature_names = np.array(tfidf.get_feature_names())[indices]
  unigrams = [v for v in feature_names if len(v.split(' ')) == 1]
  bigrams = [v for v in feature_names if len(v.split(' ')) == 2]
  print("# '{}':".format(category))
  print("  . Most correlated unigrams:\n       . {}".format('\n       . '.join(unigrams[-N:])))
  print("  . Most correlated bigrams:\n       . {}".format('\n       . '.join(bigrams[-N:])))

  df[df.Titulo.str.contains('España')]


#Entrenamiento del modelo
models = [
    RandomForestClassifier(n_estimators=200, max_depth=3, random_state=0),
    MultinomialNB(),
    LogisticRegression(random_state=0),
]
CV = 5
cv_df = pd.DataFrame(index=range(CV * len(models)))
entries = []
for model in models:
  model_name = model.__class__.__name__
  accuracies = cross_val_score(model, features, labels, scoring='accuracy', cv=CV)
  for fold_idx, accuracy in enumerate(accuracies):
    entries.append((model_name, fold_idx, accuracy))
cv_df = pd.DataFrame(entries, columns=['model_name', 'fold_idx', 'accuracy'])

cv_df.groupby('model_name').accuracy.mean()

#Interpretación del modelo
model = LogisticRegression(random_state=0)

X_train, X_test, y_train, y_test, indices_train, indices_test = train_test_split(features, labels, df.index, test_size=0.33, random_state=0)
model.fit(X_train, y_train)
y_pred_proba = model.predict_proba(X_test)
y_pred = model.predict(X_test)

model.fit(features, labels)

# from bs4 import *
# import requests
# import mariadb
# import sys

# # Connect to MariaDB Platform
# try:
#     conn = mariadb.connect(
#         user="pr_grupob",
#         password="PC2-2021",
#         host="2.139.176.212",
#         port=3306,
#         database="prgrupob"

#     )

# except mariadb.Error as e:
#     print(f"Error connecting to MariaDB Platform: {e}")
#     sys.exit(1)

# cur = conn.cursor()
# query = 'SELECT NAME,population,emptied FROM towns WHERE population < 5000'
# cur.execute(query)

# rows = cur.fetchall()

# for row in rows :
#     query2 = "UPDATE towns (emptied) VALUES (TRUE)"
#     cur.execute(query2)
#     conn.commit()

#     print(row)

# query3 = 'SELECT NAME,population,emptied FROM towns WHERE population > 5000'
# cur.execute(query3)

# rows = cur.fetchall()

# for row in rows :
#     query4 = "UPDATE towns (emptied) VALUES (FALSE)"
#     cur.execute(query4)
#     conn.commit()
    
#     print(row)

# conn.close()