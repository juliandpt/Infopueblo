# WebScrapping

Este directorio almacena todos los archivos encargados de recoger la información de las distintas paginas webs utilizadas.

Para obtener esta información, se hace uso de la técnica de web scraping.

Los archivos que se encuentran en este directorio son:

| Archivo | Link | Propósito |
| ------ | ------ | ------ |
| 15mpedia.py | [15mpedia](https://15mpedia.org/w/index.php?title=Especial:Ask&offset=0&limit=8134&q=%5B%5BPage+has+default+form%3A%3AMunicipio%5D%5D+%5B%5Bpa%C3%ADs%3A%3AEspa%C3%B1a%5D%5D&p=format%3Dtable%2Fmainlabel%3DMunicipio&po=%3F%3DMunicipio%23%0A%3FComarca%23-%0A%3FProvincia%0A%3FComunidad+aut%C3%B3noma%3DCC.AA.%0A%3FAltitud%3DAltitud+%28m.s.n.m.%29%0A%3FSuperficie%3DSuperficie+%28km%C2%B2%29%0A%3FPoblaci%C3%B3n+en+2019%3DPoblaci%C3%B3n+%282019%29%0A%3FDensidad+de+poblaci%C3%B3n%3DDensidad+%28hab.%2Fkm%C2%B2%29%0A&sort=nombre&order=asc) | Recoger los 8.134 municipios españoles, junto con la respectiva información de cada uno. |
| 20minutos.py | [20minutos](https://www.20minutos.es/) | Recoger las noticias de un determinado municipio para clasificar al mismo como despoblación o no despoblación. |
| buscorestaurnates.py | [buscorestaurnates](http://www.buscorestaurantes.com/) | Recoger los restaurantes de un determinado municipio. |
| cornerjob.py | [cornerjob](https://www.cornerjob.com/es) | Recoger las ofertas de trabajo de un determinado municipio. |

## Herramientas utilizadas

- **BeautifulSoup**: permite identificar elementos del código html de una pagina web. IMPORTANTE que la página no haga uso de javascript.
- **Requests**: permite almacenar todo el código html de una página web.
- **Mariadb**: permite la conexión con la base de datos.
- **Json**: permite formatear un diccionario en el correcto formato json.
- **Dotenv**: permite acceder a las variables de entorno del archivo .env.
- **Vader Sentiment**: permite realizar el análisis del sentimiento de un texto.
- **Statistics**: proporciona funciones para calcular estadísticas matemáticas de datos numéricos (valores reales).
- **Geopy**: permite obtener la latitud y longitud de un municipio en base a su nombre.

## Comandos de instalación

BeautifulSoup:

```sh
pip install bs4
pip install beautifulsoup4
```

Requests:

```sh
pip install requests
```

Mariadb:

```sh
pip install mariadb
```

Json:

```sh
pip install jsonlib
```

Dotenv:

```sh
pip install dotenv
```

Vader Sentiment:

```sh
pip install vaderSentiment
```

Statistics:

```sh
pip install statistics
```

Geopy:

```sh
pip install geopy
```