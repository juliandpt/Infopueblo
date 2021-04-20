from bs4 import *
import pandas as pd
import requests
import time
import json

text = input("Introduce un lugar: ")
num_offers = int(input("Introduce el numero de ofertas: "))
place = text.replace(" ", "-")
r = requests.get(f'https://jobtoday.com/es/trabajos/' + place + '?page=1')
contenido = r.text
soup = BeautifulSoup(contenido, 'html.parser')

print("Estos son todos los trabajos que hay en", place)
ofertas = []
i = 1
while len(ofertas) < num_offers:
    try:
        url = 'https://jobtoday.com/es/trabajos/' + place + '?page=' + str(i)
        i = i+1
        r = requests.get(url, allow_redirects=False)
        soup = BeautifulSoup(r.text, 'html.parser')
        rows = soup.find_all("div", {"class": "Grid-item"})
        for row in rows:
            hyperLink = row.find('a')
            try:
                offerLink = hyperLink['href']
                articlePage = requests.get(offerLink, allow_redirects=False)
                parsedPage = BeautifulSoup(articlePage.text, 'html.parser')
                item = {}
                item['Trabajo'] = row.find("h3", {"class": "JobCardLarge-role"}).text
                item['Empresa'] = parsedPage.find("h3", {"class": "jsx-2275211273"}).text
                item['Descripcion'] = parsedPage.find("div", {"class": "JobPage-description"}).text
                print(item['Descripcion'])
                ofertas.append(item)
                if len(ofertas) == num_offers:
                    break
            except:
                continue
    except:
        break
print(len(ofertas))
with open('./resultado/jobtoday.json', 'w',  encoding='utf-8') as f:
    json.dump(ofertas, f, ensure_ascii=False, indent=4)
