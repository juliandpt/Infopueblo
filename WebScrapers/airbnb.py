from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import requests
import time
import json

apartments= {}
id = 1
destiny = input("Introduzca el destino: ")

url = f'https://www.airbnb.es/s/' +  destiny + '/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_dates%5B%5D=june&flexible_trip_dates%5B%5D=may&flexible_trip_lengths%5B%5D=weekend_trip&date_picker_type=calendar&source=structured_search_input_header&search_type=search_query'
html = requests.get(url)
soup = BeautifulSoup(html.text, 'html.parser')

cards = soup.find_all("div", {"class": "_8s3ctt"})

for card in cards:
    item = {}

    item['id'] = id
    id = id + 1

    item['Nombre Apartamento'] = card.find("span", {"class": "_bzh5lkq"}).text
    # print(item['Nombre Apartamento'])

    a = card.find('a', href=True)
    link = 'https://www.airbnb.es' + a['href']
    print('url: ' + link)

    time.sleep(3)
    chrome_options = Options()
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--headless")
    driver = webdriver.Chrome(executable_path='./WebScrapers/WebDriver/chromedriver.exe', options=chrome_options)
    driver.get(link)
    # r = requests.get(link, allow_redirects=False)
    # newSoup = BeautifulSoup(r.text, 'html.parser')
    hotel = driver.find_element_by_class_name('_14i3z6h')
    print(hotel)
    # hotel = newSoup.find("h1", {"class": "_14i3z6h"}).text
    # item['Nombre Apartamento'] = hotel
    # print(item['Nombre Apartamento'])

    # item['Comentarios'] = []
    # divs = newSoup.find_all("div", {"class": "_162hp8xh"})
    # for div in divs:
    #     if (div.find("div", {"class": "_1ojpw5l"})):
    #         aux = div.find("div", {"class": "_1ojpw5l"})
    #         item['Comentarios'].append(aux.find("span").text)
    #     else:
    #         aux = div.find("div", {"class": "_1d784e5"})
    #         item['Comentarios'].append(aux.find("span").text)

    # apartments.append(item)

with open ('./resultado/airbnb.json', 'w', encoding='utf-8') as file:
    json.dump(apartments, file, ensure_ascii=False, indent=4)