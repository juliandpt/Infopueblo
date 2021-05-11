import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from bs4 import *
import requests

con = psycopg2.connect(dbname='d20hkpogjrcusn',
                       user='amvnwrnjzqtkgh', host='ec2-99-80-200-225.eu-west-1.compute.amazonaws.com',
                       password='e795f9d0a48704ea436bbd5d8efdbc914c9e146aaad730b0aca9c819ebbff0aa', port='5432')

r = requests.get(f'https://15mpedia.org/w/index.php?title=Especial:Ask&offset=0&limit=8134&q=%5B%5BPage+has+default+form%3A%3AMunicipio%5D%5D+%5B%5Bpa%C3%ADs%3A%3AEspa%C3%B1a%5D%5D&p=format%3Dtable%2Fmainlabel%3DMunicipio&po=%3F%3DMunicipio%23%0A%3FComarca%23-%0A%3FProvincia%0A%3FComunidad+aut%C3%B3noma%3DCC.AA.%0A%3FAltitud%3DAltitud+%28m.s.n.m.%29%0A%3FSuperficie%3DSuperficie+%28km%C2%B2%29%0A%3FPoblaci%C3%B3n+en+2019%3DPoblaci%C3%B3n+%282019%29%0A%3FDensidad+de+poblaci%C3%B3n%3DDensidad+%28hab.%2Fkm%C2%B2%29%0A&sort=nombre&order=asc')

content = r.text
soup = BeautifulSoup(content, 'html.parser')
table = soup.find('tbody')
rows = table.find_all('tr')
con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = con.cursor()
i = 0

for row in rows:
  municipio = {}
  i = i +1
  municipio['name'] = row.find('td', {"class": "Municipio"}).text.replace("'"," ")
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

  cur.execute("insert into towns (aacc,density_pob,emptied,name,population,province,region) values ('" +
                    municipio['aacc'] + "'," + municipio['density'] + ",NULL,'" + municipio['name'] + "'," + municipio['population'] + ",'" + municipio['province'] + "','" + municipio['region'] + "');")
  print('municipio ' + str(i) + ' insertado correctamente')
  print(municipio)
cur.close()
