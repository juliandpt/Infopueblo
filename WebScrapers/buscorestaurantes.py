from bs4 import *
import pandas as pd
import requests
import sys
import time
import json

#text = sys.argv[1]
text = input("Introduce un lugar: ")
num_restaurants = 2
place = text.replace(" ", "+")

restaurants = []
page = 1
i = 1
while len(restaurants) < num_restaurants:
    try:
        url = 'http://www.buscorestaurantes.com/search_results.php?keywords=' + place + '&submit_button=buscar&from_pmd=3d41e18c675bad9973fede37acc68644&bot_check=&page=' + str(i)
        page = page+1
        r = requests.get(url, allow_redirects=False)
        soup = BeautifulSoup(r.text, 'html.parser')
        rows = soup.find_all("div", {"class": "listing-item-title"})
        for row in rows:
            hyperLink = row.find('a')
            try:
                restaurantLink = hyperLink['href']
                restaurantPage = requests.get(restaurantLink, allow_redirects=False)
                parsedPage = BeautifulSoup(restaurantPage.text, 'html.parser')
                item = {}
                item['id'] = i
                name = parsedPage.find("h1").text.replace("\n", "").replace("\t", "")
                item['name'] = name
                item['comments'] = []
                comments = parsedPage.find_all("p", {"class": "excerpt"})
                for comment in comments:
                    text = comment.text.replace("\n", "").replace("\t", "")
                    item['comments'].append(text)
                restaurants.append(item)
                i = i+1
                if len(restaurants) == num_restaurants:
                    break
            except:
                continue
    except:
        break
print(restaurants)
with open('./WebScrapers/resultado/buscorestaurantes.json', 'w',  encoding='utf-8') as f:
    json.dump(restaurants, f, ensure_ascii=False, indent=4)
