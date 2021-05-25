import pandas as pd
import numpy as np
import os
import nltk
nltk.download('stopwords')
from nltk.corpus import stopwords
from bs4 import *
import glob

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
    'Categoria': categorias
    })
print(df)

df.to_json('sample_data/clasificacion.json')
print(df)
df['category_id'] = df['Categoria'].factorize()[0]

category_id_df = df[['Categoria', 'category_id']].drop_duplicates().sort_values('category_id')
category_to_id = dict(category_id_df.values)
id_to_category = dict(category_id_df[['category_id', 'Categoria']].values)

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