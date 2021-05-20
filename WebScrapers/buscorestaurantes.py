from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from bs4 import BeautifulSoup
import statistics
import requests
import sys
import json

text = sys.argv[1]
#text = input("Introduce un lugar: ")
num_restaurants = 20
place = text.replace(" ", "+")

restaurants = []
page = 1
while len(restaurants) < num_restaurants:
    try:
        url = 'http://www.buscorestaurantes.com/search_results.php?keywords=' + place + '&submit_button=buscar&from_pmd=3d41e18c675bad9973fede37acc68644&bot_check=&page=' + str(page)
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
                name = parsedPage.find("h1").text.replace("Restaurante:", "").replace("\n", "").replace("\t", "")
                item['name'] = name
                item['location'] = parsedPage.find('div', {'class': 'block-map-header-address'}).text.replace("\n", "").replace("\t", "")
                sentiments = []
                comments = parsedPage.find_all("p", {"class": "excerpt"})
                for comment in comments:
                    c = comment.text.replace("\n", "").replace("\t", "")
                    s = SentimentIntensityAnalyzer().polarity_scores(c)['compound']
                    sentiments.append(s)
                item['sentiment'] = statistics.median(sentiments)
                restaurants.append(item)
                if len(restaurants) == num_restaurants:
                    break
            except:
                continue
    except:
        j = {}
        j['m'] = 'nada'
        restaurants.append(j)
        break
restaurantsJson = json.dumps(restaurants)
print(restaurantsJson)
# with open('./WebScrapers/resultado/buscorestaurantes.json', 'w',  encoding='utf-8') as f:
#     json.dump(restaurants, f, ensure_ascii=False, indent=4)
