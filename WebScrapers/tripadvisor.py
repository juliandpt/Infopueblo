import requests
import json
from bs4 import BeautifulSoup as soup
from random import randint
from time import sleep 

#Opiniones de hoteles
html = requests.get('https://www.tripadvisor.es/Tourism-g187427-Spain-Vacations.html')
bsobj = soup(html.content,'lxml')

linksHotel = []

for review in bsobj.findAll('a',{'class':'_7c6GgQ6n _37QDe3gr'}):
  a = review['href']
  a = 'https://www.tripadvisor.es'+ a
  a = a[:(a.find('Reviews')+7)] + '-or{}' + a[(a.find('Reviews')+7):]
  # print(a)
  linksHotel.append(a)
print(linksHotel)

reviewsHotel = []

for link in linksHotel:

  headers = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'}
  html2 = requests.get(link.format(i for i in range(5,1000,5)),headers=headers)
  sleep(2)
  bsobj2 = soup(html2.content,'lxml')
  for r in bsobj2.findAll('span',{'class':'_3jEYFo-z'}):
    reviewsHotel.append(r.q.text.strip())
    print(r.q.text.strip())

#Metemos las opiniones obtenidas en un archivo .json
with open('WebScrapers/resultado/tripAdvisorHoteles.json', 'w', encoding='utf-8') as file:
    json.dump(reviewsHotel, file, ensure_ascii=False, indent=4)  # Guardando salida en formato JSON

# #Opiniones de restaurantes
# html = requests.get('https://www.tripadvisor.es/Restaurants')
# bsobj = soup(html.content,'lxml')

# linksRestaurantes = []

# for review in bsobj.findAll('a',{'class':'item poi_name ui_link'}):
#   a = review['href']
#   a = 'https://www.tripadvisor.in'+ a
#   a = a[:(a.find('Reviews')+7)] + '-or{}' + a[(a.find('Reviews')+7):]
#   # print(a)
#   linksRestaurantes.append(a)
# print(linksRestaurantes)

# reviewsRestaurantes = []

# for link in linksRestaurantes:

#   headers = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'}
#   html2 = requests.get(link.format(i for i in range(5,1000,5)),headers=headers)
#   sleep(2)
#   bsobj2 = soup(html2.content,'lxml')
#   for r in bsobj2.findAll('q'):
#     reviewsRestaurantes.append(r.span.text.strip())
#     print(r.span.text.strip())

# #Metemos las opiniones obtenidas en un archivo .json
# with open('WebScrapers/resultado/tripAdvisorRestaurantes.json', 'w', encoding='utf-8') as file:
#     json.dump(reviewsRestaurantes, file, ensure_ascii=False, indent=4)  # Guardando salida en formato JSON