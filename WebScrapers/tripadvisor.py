import time
import json
import requests
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from bs4 import BeautifulSoup


driver = webdriver.Chrome('.\WebDriver\chromedriver.exe')
driver.get("https://www.tripadvisor.es/Hotels")

#TryCatch en caso de que el sitio web pida cookies
try:
    time.sleep(1)
    cookies = driver.find_element_by_xpath('//*[@id="_evidon-accept-button"]')
    cookies.click()
except:
    print("No hay cookies")

#Le pide al usuario introducir un hotel para hacer la busqueda
buscador = driver.find_element_by_xpath('//*[@id="typeahead_widget_component_component_10"]/div/div/form/input[1]')
hotel = input("Elige un hotel: ")
buscador.click() #Hace click en la barra de busqueda para realizarla en base a lo introducido
buscador.send_keys(hotel)
time.sleep(1)
buscador.send_keys(Keys.ENTER)
time.sleep(1)

#Le pide al usuario que especifique el pais
ubicacion = driver.find_element_by_xpath('//*[@id="GEO_SCOPE_CONTAINER"]/div')
ubicacion.click()
clearText = driver.find_element_by_xpath('//*[@id="CLEAR_WHERE"]')
clearText.click()
setPais = driver.find_element_by_xpath('//*[@id="GEO_SCOPED_SEARCH_INPUT"]')
pais = input("Elige un pais: ")
setPais.click()
setPais.send_keys(pais)
time.sleep(1)
setPais.send_keys(Keys.ENTER)

#Busca el hotel introducido y hace click en el primer resultado
time.sleep(2)
hoteles = driver.find_element_by_xpath('//*[@id="BODY_BLOCK_JQUERY_REFLOW"]/div[3]/div/div[2]/div/div/div/div/div[1]/div/div[1]/div/div[3]/div/div[1]/div/div[2]/div/div/div[1]/div/div/div/div[2]/div[1]/div[1]')
hoteles.click()
time.sleep(1)

#Para que se enfoque en la nueva pestaña que se abra
driver.switch_to.window(driver.window_handles[-1])
time.sleep(5)

#Va hasta el link de las opiniones y se mete en ellas
numOpiniones = int(input("¿Cuantas opiniones como minimo quieres ver? "))
opiniones = driver.find_element_by_xpath('//*[@id="ABOUT_TAB"]/div[2]/div[1]/div[1]/a/span[2]')
opiniones.click()
time.sleep(1)

#Hacemos uso de la libreria bs4 para procesar los datos de la web
htmlText = driver.page_source
soup = BeautifulSoup(htmlText, 'html.parser')

#Cogemos el nombre del hotel
nombreHotel = driver.find_element_by_class_name("_1mTlpMC3").text.replace("Hotel ", "")
print("Estas son las opiniones para el Hotel", nombreHotel)

#Creamos el array para almacenar las opiniones contenidas en la etiqueta <q>
listaOpiniones = []
opinionHotel = soup.find_all('q', class_="IRsGHoPm")
time.sleep(5)

for opinion in opinionHotel:
    comentario = opinion.find('span').get_text()            
    formato = {}
    formato['Nombre del hotel'] = nombreHotel
    formato['Opinion'] = comentario
    listaOpiniones.append(formato)
    
    if len(listaOpiniones) == numOpiniones:
        break

#Recorremos cada opinion hasta llegar al número de opiniones deseadas
while len(listaOpiniones) < numOpiniones:

    #Paginación que permite moverse entre páginas de opiniones
    try:
        next = driver.find_element_by_xpath('//*[@id="component_16"]/div/div[3]/div[8]/div/a')
        next.click()
        time.sleep(5)
        filas = soup.find_all('span', class_="IRsGHoPm")
        time.sleep(1)
        for fila in filas:
            # comentario = fila.get_text()
            formato = {}
            formato['Nombre del hotel'] = nombreHotel
            formato['Opinion'] = comentario
            listaOpiniones.append(formato)
            
            if len(listaOpiniones) == numOpiniones:
                break
    except:
        break

#Imprimimos el array con las opiniones
print(listaOpiniones)
print("---------------------------------------------------------------------------")
print(len(listaOpiniones), " opiniones para ", nombreHotel)
print("---------------------------------------------------------------------------")
time.sleep(1)

#Metemos las opiniones obtenidas en un archivo .json
with open ('./resultado/tripAdvisor.json', 'w', encoding='utf-8') as file:
    json.dump(listaOpiniones, file, ensure_ascii=False, indent=4)  # Guardando salida en formato JSON

# driver.quit()