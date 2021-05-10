from bs4 import *
import pandas as pd
import requests
import sys
import time
import json

r = requests.get(f'https://15mpedia.org/w/index.php?title=Especial:Ask&offset=0&limit=8134&q=%5B%5BPage+has+default+form%3A%3AMunicipio%5D%5D+%5B%5Bpa%C3%ADs%3A%3AEspa%C3%B1a%5D%5D&p=format%3Dtable%2Fmainlabel%3DMunicipio&po=%3F%3DMunicipio%23%0A%3FComarca%23-%0A%3FProvincia%0A%3FComunidad+aut%C3%B3noma%3DCC.AA.%0A%3FAltitud%3DAltitud+%28m.s.n.m.%29%0A%3FSuperficie%3DSuperficie+%28km%C2%B2%29%0A%3FPoblaci%C3%B3n+en+2019%3DPoblaci%C3%B3n+%282019%29%0A%3FDensidad+de+poblaci%C3%B3n%3DDensidad+%28hab.%2Fkm%C2%B2%29%0A&sort=nombre&order=asc')

content = r.text
soup = BeautifulSoup(content, 'html.parser')
table = soup.find('tbody')
rows = table.find_all('tr')

for row in rows:
  municipio = {}
  municipio['Municipio'] = row.find('td', {"class": "Municipio"}).text
  municipio['Comarca'] = row.find('td', {"class": "Comarca"}).text
  municipio['Provincia'] = row.find('td', {"class": "Provincia"}).text
  municipio['CC.AA'] = row.find('td', {"class": "CC.AA."}).text
  municipio['Poblacion'] = row.find('td', {"class": "Población-(2019)"}).text
  municipio['Densidad(hab/km)'] = row.find('td', {"class": "Densidad-(hab./km²)"}).text
  print(municipio)
  break
