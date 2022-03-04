import sys, os, pickle, mariadb, pandas, numpy, nltk
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.feature_selection import chi2
from nltk.corpus import stopwords
nltk.download('stopwords')
load_dotenv()

cat = ['Despoblacion', 'No Despoblacion']

try:
    conn = mariadb.connect(
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME")
    )
except mariadb.Error as e:
    print(f"Error connecting to MariaDB Platform: {e}")
    sys.exit(1)

cur = conn.cursor()
cur.execute('SELECT emptied, title, content FROM news')

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

df = pandas.DataFrame({
    'Titulo': news[0],
    'Contenido': news[1],
    'Categoria': news[2]
})

df.to_csv('./MLModel/responses/resultado.csv')

df = pandas.read_csv('./MLModel/responses/resultado.csv')
df['category_id'] = df['Categoria'].factorize()[0]

category_id_df = df[['Categoria', 'category_id']].drop_duplicates().sort_values('category_id')
category_to_id = dict(category_id_df.values)
id_to_category = dict(category_id_df[['category_id', 'Categoria']].values)

tfidf = TfidfVectorizer(sublinear_tf=True, min_df=2, norm='l2', encoding='UTF-8', ngram_range=(1, 2), stop_words=stopwords.words('spanish'))
features = tfidf.fit_transform(df.Contenido)

file_name = "./MLModel/responses/dictionary.pkl"
f = open(file_name, 'wb')
pickle.dump(tfidf, f)
f.close()

labels = df.category_id
features.shape

N = 3
for category, category_id in sorted(category_to_id.items()):
    features_chi2 = chi2(features, labels == category_id)
    indices = numpy.argsort(features_chi2[0])
    feature_names = numpy.array(tfidf.get_feature_names())[indices]
    unigrams = [v for v in feature_names if len(v.split(' ')) == 1]
    bigrams = [v for v in feature_names if len(v.split(' ')) == 2]

model = LogisticRegression(random_state=0)

X_train, X_test, y_train, y_test, indices_train, indices_test = train_test_split(
    features, labels, df.index, test_size=0.33, random_state=0)
entrenado = model.fit(X_train, y_train)

file_name = "./MLModel/responses/model.pkl"
f = open(file_name, 'wb')
pickle.dump(entrenado, f)
f.close()
