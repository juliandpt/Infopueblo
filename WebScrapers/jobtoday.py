from bs4 import *
import requests
import sys
import json

#text = sys.argv[1]
text = input("Introduce un lugar: ")
num_offers = 20
place = text.replace(" ", "-")

offers = []
i = 1
while len(offers) < num_offers:
    try:
        url = 'https://jobtoday.com/es/trabajos/' + place + '?page=' + str(i)
        i = i+1
        r = requests.get(url, allow_redirects=False)
        soup = BeautifulSoup(r.text, 'html.parser')
        rows = soup.find_all("div", {"class": "JobCardLarge"})
        for row in rows:
            try:
                hyperLink = row.find('a')
                offerLink = hyperLink['href']
                articlePage = requests.get(offerLink, allow_redirects=False)
                parsedPage = BeautifulSoup(articlePage.text, 'html.parser')
                item = {}
                item["work"] = parsedPage.find("h1", {"class": "JobPage-title"}).text
                item["company"] = parsedPage.find("h3", {"class": "jsx-186166690"}).text
                description = parsedPage.find("span", {"class": "JobPage-description-text"}).text.replace("\n", "")
                item["description"] = description
                offers.append(item)
                if len(offers) == num_offers:
                    break
            except:
                continue
    except:
        break
offersJson = json.dumps(offers)
print(offersJson)
# with open('./WebScrapers/resultado/jobtoday.json', 'w',  encoding='utf-8') as f:
#     json.dump(offers, f, ensure_ascii=False, indent=4)
