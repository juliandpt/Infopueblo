import requests, mariadb, sys, os
from dotenv import load_dotenv
from bs4 import *
load_dotenv() 

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

r = requests.get(f'https://15mpedia.org/w/index.php?title=Especial:Ask&offset=0&limit=8134&q=%5B%5BPage+has+default+form%3A%3AMunicipio%5D%5D+%5B%5Bpa%C3%ADs%3A%3AEspa%C3%B1a%5D%5D&p=format%3Dtable%2Fmainlabel%3DMunicipio&po=%3F%3DMunicipio%23%0A%3FComarca%23-%0A%3FProvincia%0A%3FComunidad+aut%C3%B3noma%3DCC.AA.%0A%3FAltitud%3DAltitud+%28m.s.n.m.%29%0A%3FSuperficie%3DSuperficie+%28km%C2%B2%29%0A%3FPoblaci%C3%B3n+en+2019%3DPoblaci%C3%B3n+%282019%29%0A%3FDensidad+de+poblaci%C3%B3n%3DDensidad+%28hab.%2Fkm%C2%B2%29%0A&sort=nombre&order=asc')

content = r.text
soup = BeautifulSoup(content, 'html.parser')
table = soup.find('tbody')
rows = table.find_all('tr')
cur = conn.cursor()
i = 0

for row in rows:
  municipio = {}
  i = i +1
  municipio['name'] = row.find('td', {"class": "Municipio"}).text.replace("'"," ")
  logo = row.find('td', {"class": "Municipio"})
  link_ = logo.find('a')
  r = requests.get('https://15mpedia.org' + link_['href'])
  content = r.text
  soup = BeautifulSoup(content, 'html.parser')
  if soup.find('a', {"class": "image"}) is None:
    municipio['image'] = 'NULL'
  else:
    image = soup.find('a', {"class": "image"})
    link = requests.get('https://15mpedia.org' + image['href'])
    content = link.text
    soup = BeautifulSoup(content, 'html.parser')
    if soup.find('div', {"class": "fullImageLink"}) is None:
      municipio['image'] = 'NULL'
    else: 
      fullImage = soup.find('div', {"class": "fullImageLink"})
      svgImage = fullImage.find('a')
      municipio['image'] = svgImage['href']
  
  if row.find('td', {"class": "Comarca"}) is None:
    municipio['region'] = ''
  else:
    municipio['region'] = row.find('td', {"class": "Comarca"}).text.replace("'"," ")

  municipio['province'] = row.find('td', {"class": "Provincia"}).text.replace("'"," ")
  municipio['aacc'] = row.find('td', {"class": "CC.AA."}).text.replace("'"," ")
  if row.find('td', {"class": "Población-(2019)"}) is None:
    municipio['population'] = str(0)
  else:
    municipio['population'] = row.find('td', {"class": "Población-(2019)"}).text.replace('.','')
  if row.find('td', {"class": "Densidad-(hab./km²)"}) is None:
    municipio['density'] = str(0)
  else:
    municipio['density'] = row.find('td', {"class": "Densidad-(hab./km²)"}).text.replace( '.','').replace(',','.')

  cur.execute("insert into towns (name,region,province,aacc,population,density,image_url,emptied,likes) values ('" +
                    municipio['name'] + "','" + municipio['region'] + "','" + municipio['province'] + "','" + municipio['aacc'] + "'," + municipio['population'] + "," + municipio['density'] + ",'" + municipio['image'] + "',NULL,0);")
  print('municipio ' + str(i) + ' insertado correctamente')
conn.commit()
cur.close()