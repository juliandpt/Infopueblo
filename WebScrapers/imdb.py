from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import requests
import time
import json

try:
    driver = webdriver.Chrome('./WebDriver/chromedriver')
    driver.get('https://www.imdb.com/?ref_=nv_home')
    time.sleep(1)

    search = driver.find_element_by_xpath('//*[@id="suggestion-search"]')
    place = input("Película: ")
    # numberPages = int(input("¿Cuántos páginas? "))
    numberReviews = int(input("¿Cuántos comentarios? "))
    search.send_keys(place)
    time.sleep(3)
    search.send_keys(Keys.ENTER)
    time.sleep(1)

    movieOption = driver.find_element_by_xpath('//*[@id="sidebar"]/div[3]/ul/ul/li[1]/a')
    movieOption.click()
    time.sleep(1)

    movieSelect = driver.find_element_by_xpath('//*[@id="main"]/div/div[2]/table/tbody/tr[1]/td[2]/a')
    movieSelect.click()
    time.sleep(3)

    movieTitle = driver.find_element_by_tag_name('h1').text

    allReviews = driver.find_element_by_xpath('//*[@id="titleUserReviewsTeaser"]/div/a[2]')
    allReviews.click()
    time.sleep(1)

    URL = driver.current_url
    content = requests.get(URL)
    soup = BeautifulSoup(content.text, 'html.parser')

    for i in range(5):
        try:
            next = driver.find_element_by_id('load-more-trigger')
            next.click()
            time.sleep(3)
        except:
            break

    reviewsList = []
    reviews = soup.find_all("div", {"class": "lister-item-content"})
    # print(reviews)
    time.sleep(3)

    for review in reviews:
        item = {}
        item['Título'] = movieTitle
        item['Autor'] = review.find("span", {"class": "display-name-link"}).text
        item['Fecha'] = review.find("span", {"class": "review-date"}).text
        item['Comentario'] = review.find("div", {"class": "text show-more__control"}).text
        item['Analisis de Sentimiento'] = SentimentIntensityAnalyzer().polarity_scores(item['Comentario'])
        reviewsList.append(item)

        if len(reviewsList) == numberReviews:
            break

    print("--------------------------------------------------------------------------------------")
    print(len(reviewsList), "comentarios para", movieTitle)
    print("--------------------------------------------------------------------------------------")
    # print(reviewsList)

    with open ('./resultado/imdb.json', 'w', encoding='utf-8') as file:
        json.dump(reviewsList, file, ensure_ascii=False, indent=4)

    driver.quit()

except:
    print("¡ERROR!")
    driver.quit()
