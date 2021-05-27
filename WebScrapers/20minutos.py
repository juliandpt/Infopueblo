from bs4 import BeautifulSoup
import requests
import sys
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import json

text = sys.argv[1]
#text = input("Introduce un lugar: ")
place = text.replace(" ", "-")

news = []

try:
    url = 'https://www.20minutos.es/busqueda/?q=' + place
    r = requests.get(url)
    soup = BeautifulSoup(r.content.decode("utf-8"), 'html.parser')
    articles = soup.find_all('article')
    for article in articles:
        titleContainer = article.find('div', { 'class': 'media-content' })
        hyperLink = titleContainer.find('a')
        articleLink = hyperLink['href']
        articleTitle = hyperLink.text
        titleClean = articleTitle.strip()
        articlePage = requests.get(articleLink)
        parsedPage = BeautifulSoup(articlePage.text, 'html.parser')

        articleSection = parsedPage.find('article', { 'class': 'article-body' })
        if articleSection is None:
            continue

        articleContent = articleSection.find('div', { 'class': 'article-text' }).text.replace("\n", "").replace("\"", "")
        if articleContent is None:
            continue

        articleTagContainer = parsedPage.find(
            'div', {'class': 'module module-related'}
        )

        if articleTagContainer is None:
            continue

        doc = {}
        doc['title'] = titleClean
        doc['content'] = articleContent

        news.append(doc)
    newsJson = json.dumps(news)
except:
    news = []

print(newsJson)
# with open('./WebScrapers/resultado/20minutos.json', 'w',  encoding='utf-8') as f:
#     json.dump(news, f, ensure_ascii=False, indent=4)
