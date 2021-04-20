from selenium import webdriver
from bs4 import BeautifulSoup
import requests
import time
import json

apartments= []
id = 1

driver = webdriver.Chrome('./WebDriver/chromedriver.exe')
driver.get('https://www.airbnb.es/')
time.sleep(3)

#Aceptar cookies y buscar

# cookies = driver.find_element_by_xpath('/html/body/div[6]/div/div/div[1]/section/footer/div[2]/button')
cookies = driver.find_element_by_class_name('_1qnlffd6')
cookies.click()
time.sleep(1)

# query = driver.find_element_by_xpath('//*[@id="bigsearch-query-detached-query"]')
query = driver.find_element_by_class_name('_1xq16jy')
destiny = input("Introduzca el destino: ")
query.send_keys(destiny)
time.sleep(1)

# searchButton = driver.find_element_by_xpath('/html/body/div[6]/div/div/div/div[1]/div[1]/div/header/div/div[2]/div[2]/div/div/div/form/div/div/div[5]/div[2]/button')
searchButton = driver.find_element_by_class_name('_1mzhry13')
searchButton.click()
time.sleep(2)

#Buscar entre tarjetas y recoger la informacion

url = driver.current_url
html = requests.get(url)
soup = BeautifulSoup(html.text, 'html.parser')

cards = soup.find_all("div", {"class": "_8s3ctt"})

for card in cards:
    item = {}

    item['id'] = id
    id = id + 1

    item['Nombre Apartamento'] = card.find("span", {"class": "_bzh5lkq"}).text
    print(item['Nombre Apartamento'])

    a = card.find('a', href=True)
    link = 'https://www.airbnb.es' + a['href']
    print('url: ' + link)

    driver.get(link)
    time.sleep(3)
    r = requests.get(link, allow_redirects=False)
    newSoup = BeautifulSoup(r.text, 'html.parser')

    # hotel = newSoup.find("h1", {"class": "_14i3z6h"}).text
    # item['Nombre Apartamento'] = hotel
    # print(item['Nombre Apartamento'])

    # apartment = driver.find_element_by_class_name('_14i3z6h')
    # print('Name: ' + apartment.text)

    # apartment = driver.find_element_by_xpath('//*[@id="site-content"]/div/div/div[1]/div[1]/div/div/div/div/section/div[1]/h1')
    # print('Name: ' + apartment.text)

    item['Comentarios'] = []
    divs = newSoup.find_all("div", {"class": "_162hp8xh"})
    for div in divs:
        if (div.find("div", {"class": "_1ojpw5l"})):
            aux = div.find("div", {"class": "_1ojpw5l"})
            item['Comentarios'].append(aux.find("span").text)
        else:
            aux = div.find("div", {"class": "_1d784e5"})
            item['Comentarios'].append(aux.find("span").text)

    apartments.append(item)

with open ('./resultado/airbnb.json', 'w', encoding='utf-8') as file:
    json.dump(apartments, file, ensure_ascii=False, indent=4)