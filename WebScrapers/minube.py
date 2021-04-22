from bs4 import BeautifulSoup
import requests

locations = []
info = []

url = 'https://www.minube.com/viajes/espana'
html = requests.get(url)
soup = BeautifulSoup(html.text, 'html.parser')

pop = soup.find("div", {"class": "riverItems"})

locs = pop.find_all("div", {"class": "baseCard riverCard locationCard gridCard"})
id = 1
for loc in locs:
    item = {}
    item['id'] = int(id)
    id = id + 1
    #No realiza correctamente el get_text()
    item['name'] = loc.find('a').get_text()
    print(item['name'])
    #No localiza correctamente la url, ya que, al igual que antes, coge el contenido dentro de la etiqueta
    item['url'] = loc.find('a', href=True)
    locations.append(item)

userloc = int(input('Introduce posicion (numero): '))

for i in locations:
    if userloc == i['id']:
        #falla en este apartado, ya que no coge bien el valor del diccionario
        #pero el resto del codigo seria la estructura a seguir para recoger la informacion
        link = str(i['url'])

        r = requests.get(link, allow_redirects=False)
        newSoup = BeautifulSoup(r.text, 'html.parser')
        
        div = newSoup.find("div", {"class": "titleList "})
        newlink = div.find('a', href=True)
        r = requests.get(newlink, allow_redirects=False)
        newSoup2 = BeautifulSoup(r.text, 'html.parser')

        divs = newSoup2.find_all("div", {"class": "titleList "})
        for y in divs:
            item = {}
            info = []
            item['title'] = y.find("div", {"class": "title link "}).text
            print(item['title'])
            cards = y.find("div", {"class": "baseCard riverCard tourCard "})
            for c in cards:
                informacion = c.find("div", {"class": "titleItem"})
                print(informacion)
                info.append(informacion)
            item['info'] = info
    else:
        continue

#faltaria poder coger todas las opciones disponibles mediante paginacion,
#para lo cual haria click en 'ver mas', luego se hace una sopa con BeautifulSoup de la nueva pagina
#para cogeria todos los titulos de las tarjetas