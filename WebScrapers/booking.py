from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import sys
import requests
import time
import json

driver = webdriver.Chrome('./WebDriver/chromedriver')
driver.get('https://www.booking.com/')
time.sleep(1)

cookies = driver.find_element_by_xpath('//*[@id="onetrust-accept-btn-handler"]')
cookies.click()
time.sleep(1)

search = driver.find_element_by_xpath('//*[@id="ss"]')
place = sys.argv[1]
#place = input("Introduce un lugar: ")
numberHotels = int(input("¿Cuántos hoteles quieres ver? "))
search.send_keys(place)
time.sleep(1)
search.send_keys(Keys.ENTER)
time.sleep(1)

URL = driver.current_url
content = requests.get(URL)
soup = BeautifulSoup(content.text, 'html.parser')

reviewsList = []
reviews = soup.find_all("div", {"class": "sr_item"})
# print(reviews)
time.sleep(5)

for review in reviews:
    item = {}
    item['Nombre hotel'] = review.find("span", {"class": "sr-hotel__name"}).text
    item['Descripción'] = review.find("div", {"class": "hotel_desc"}).text
    item['Puntuación'] = review.find("div", {"class": "bui-review-score__badge"}).text
    reviewsList.append(item)

    if len(reviewsList) == numberHotels:
        break

while len(reviewsList) < numberHotels:
    try:
        next = driver.find_element_by_xpath('//*[@id="search_results_table"]/div[4]/nav/ul/li[3]/a')
        next.click()
        time.sleep(5)
        # time.sleep(1)
        for review in reviews:
            item = {}
            item['Nombre hotel'] = review.find("span", {"class": "sr-hotel__name"}).text
            item['Descripción'] = review.find("div", {"class": "hotel_desc"}).text
            item['Puntuación'] = review.find("div", {"class": "bui-review-score__badge"}).text
            reviewsList.append(item)
            
            if len(reviewsList) == numberHotels:
                break
    except:
        break

print(reviewsList)
print('-------------------------------------------------------')
print('Hay un total de', len(reviewsList), "hoteles en", place)

with open ('./resultado/booking.json', 'w', encoding='utf-8') as file:
    json.dump(reviewsList, file, ensure_ascii=False, indent=4)

driver.quit()
