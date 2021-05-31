import pandas as pd
import numpy as np
import nltk
nltk.download('stopwords')
from nltk.corpus import stopwords
import mariadb
from sklearn.feature_selection import chi2
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer

cat = ['Despoblacion','No Despoblacion']

# Commented out IPython magic to ensure Python compatibility.
# %ls
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
cur.execute('select emptied, title, content from news')

news = []

for content in cur:
    noticias = {}
    noticias['titulo'] = content[1]
    noticias['contenido'] = content[2]
    if content[0] == 1:
      noticias['categoria'] = 'Despoblacion'
    else:
      noticias['categoria'] = 'No Despoblacion'
    news.append(noticias)

df = pd.DataFrame({
    'Titulo': news[0],
    'Contenido': news[1],
    'Categoria': news[2]
    })
print(df.Contenido)

df.to_csv('resultado.csv')

df = pd.read_csv('resultado.csv')
print(df)
df['category_id'] = df['Categoria'].factorize()[0]

category_id_df = df[['Categoria', 'category_id']].drop_duplicates().sort_values('category_id')
category_to_id = dict(category_id_df.values)
id_to_category = dict(category_id_df[['category_id', 'Categoria']].values)

tfidf = TfidfVectorizer(sublinear_tf=True, min_df=2, norm='l2', encoding='UTF-8', ngram_range=(1, 2), stop_words=stopwords.words('spanish'))
features = tfidf.fit_transform(df.Contenido)
file_name = "D:\Documentos\Descargas\codigo\dictionary.gay"
f = open(file_name, 'wb')
pickle.dump(tfidf,f)
f.close()
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

model = LogisticRegression(random_state=0)

X_train, X_test, y_train, y_test, indices_train, indices_test = train_test_split(features, labels, df.index, test_size=0.33, random_state=0)
entrenado = model.fit(X_train, y_train)
print(entrenado)
file_name = "D:\Documentos\Descargas\codigo\model.gay"
f = open(file_name, 'wb')
pickle.dump(entrenado,f)
f.close()
