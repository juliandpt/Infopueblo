from bs4 import *
import pandas as pd
import requests
import sys
import time
import json

#text = sys.argv[1]
text = input("Introduce un lugar: ")
num_offers = 2
place = text.replace(" ", "-")
r = requests.get(f'https://jobtoday.com/es/trabajos/' + place + '?page=1')
content = r.text
soup = BeautifulSoup(content, 'html.parser')

offers = []
i = 1
while len(offers) < num_offers:
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
                item['work'] = row.find("h3", {"class": "JobCardLarge-role"}).text
                item['company'] = parsedPage.find("h3", {"class": "jsx-2275211273"}).text
                item['description'] = parsedPage.find("div", {"class": "JobPage-description"}).text
                offers.append(item)
                if len(offers) == num_offers:
                    break
            except:
                continue
    except:
        break
print(len(offers))
with open('./WebScrapers/resultado/jobtoday.json', 'w',  encoding='utf-8') as f:
    json.dump(offers, f, ensure_ascii=False, indent=4)
