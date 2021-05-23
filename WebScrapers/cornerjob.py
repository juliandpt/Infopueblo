from bs4 import *
import requests
import sys
import json

text = sys.argv[1]
#text = input("Introduce un lugar: ")
place = text.replace(" ", "%20")

offers = []

try:
    url = 'https://www.cornerjob.com/es/trabajo?q=' + place
    r = requests.get(url, allow_redirects=False)
    soup = BeautifulSoup(r.text, 'html.parser')
    rows = soup.find_all("div", {"class": "offer-card-container"})
    for row in rows:
        try:
            hyperLink = row.find('a')
            offerLink = 'https://www.cornerjob.com' + hyperLink['href']
            articlePage = requests.get(offerLink, allow_redirects=False)
            parsedPage = BeautifulSoup(articlePage.text, 'html.parser')
            item = {}
            title = parsedPage.find("h1", {"class": "offer-title"}).text
            item["title"] = title.strip()
            item["work"] = parsedPage.find("p", {"class": "collapse-onload"}).text
            description = parsedPage.find("p", {"class": "offer-description"}).text.replace("\n", "")
            item["description"] = description.strip()

            offers.append(item)
        except:
            continue
except:
    item = {}
    item['error'] = "No data"
    offers.append(item)

offersJson = json.dumps(offers)
print(offersJson)
# with open('./WebScrapers/resultado/jobtoday.json', 'w',  encoding='utf-8') as f:
#     json.dump(offers, f, ensure_ascii=False, indent=4)