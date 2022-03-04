# Infopueblo-Frontend

Desarrollo de código de la parte backend del Proyecto de Infopueblo.

Para ello, se ha hecho uso de [Angular](https://angular.io/), un framework que facilitar la creación y programación de aplicaciones web de una sola página.

## Configurar entorno

Este proyecto se ha generado con [Angular CLI](https://github.com/angular/angular-cli) versión 11.1.4.

Instalación de Angular:

```sh
npm install -g @angular/cli
```

Creación del proyecto:

```sh
ng new nombre-del-proyecto
```

Una vez creado el proyecto, Previamente a ejecutar cualquiera de los siguientes comandos, habrá que navegar a la carpeta en la que se encuentra el proyecto con `cd nombre-del-proyecto`.

Ejecutar el proyecto:

```sh
ng serve -o
```

Crear componente:

```sh
ng generate component nombre-del-componente
```

Compilar el proyecto (usar la etiqueta `--prod` para una compilación en producción):

```sh
ng build
```

Para más ayuda, visitar la página [Angular CLI Overview and Command Reference](https://angular.io/cli).

## Herramientas utlizadas

- **Bootstrap**: Librería de estilos web.
- **Bootstrap icons**: Paquete de iconos de la librería Bootstrap.
- **Carousel for Angular**: Paquete que incluye un carousel optimizado para Angular.
- **Angular Material**: Paquete de Material Design optimizado para Angular.
- **Angular Highcharts**: Paquete de gráficas HighCharts optimizado para Angular.
- **Angular Full Page**: Paquete para adaptar a la pantalla completa optimizado para Angular.
- **Google Maps**: Paquete para incluir un mapa de Google Maps.
- **Skeleton**: Paquete para usar un método de carga de resultados moderno.


## Comandos de instalación

Bootstrap v5:

```sh
npm install bootstrap@next
```

Bootstrap icons:

```sh
npm install bootstrap-icons
```

Carousel for Angular:

```sh
npm i angular-responsive-carousel
```

Angular Material:

```sh
ng add @angular/material
```

Angular Highcharts:

```sh
npm install highcharts-angular --save
```

Angular Full Page:

```sh
npm install @fullpage/angular-fullpage
```

Google Maps:

```sh
npm install --save @types/googlemaps
```

Skeleton:

```sh
npm install ngx-skeleton-loader
```

# Infopueblo-Backend

Desarrollo de código de la parte backend del Proyecto de Infopueblo.

Para ello, se ha hecho uso de:
- [node.js](https://nodejs.org/en/) para la parte del servidor - API.
- [python](https://www.python.org/downloads/) para la recopilacion de información e implementación de modelos de machine learning.

## Configurar entorno

Node:
- Crear del entorno: npm init --yes
- Crear los diferentes archivos y directorios del proyecto
- Adicionalmente, crear el siguiente fichero `.env` con los siguientes datos

```.env
PORT=8080
DB_HOST=2.139.176.212
DB_USER=pr_grupob
DB_PASS=PC2-2021
DB_NAME=prgrupob
DB_PORT=3306
SECRET_TOKEN=3ea3967ae8328f89eda5be264d5af88b83d490afc9218d02e5628e07bf89850e828eef80c4085c20e4a394f5a7792773347e7a6492b0e05e54f321a34b7ed20b
SENGRID_API_KEY=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
```

Nodemom:
- Instalación de nodemon
- Introducir la ruta: package.json -> scripts -> "dev": "nodemon server.js"

Activar servidor:
```sh
npm run dev
```

## Herramientas utilizadas

- **Express**: proporciona un conjunto de características para las aplicaciones web y móviles.
- **Mariadb**: permite establecer la conexión con la base de datos.
- **Cors**: proporciona un middleware Connect/Express que se puede utilizar para habilitar CORS con varias opciones.
- **Dotenv**: permite acceder a las variables de entorno del archivo .env.
- **Jsonwebtoken**: proporciona las herramientas para crear tokens de usuario.
- **Sha1**: proprciona el algoritmo de encriptamientop de texto.
- **Spawn**: permite obtener la información resultante de un archivo python.
- **Sengrid mail**: permite enviar emails a un usuario.
- **Moment**: permite analizar, validar, manipular y formatear fechas.
- **Nodemon**: reinicia automáticamente la aplicación de nodo cuando se detectan cambios de archivo en el directorio.
- **Colors**: permite establecer una salida en consola con el color deseado.

## Comandos de instalación

Express:

```sh
npm install express --save
```

Mariadb:

```sh
npm install mariadb
```

Cors:

```sh
npm install cors
```

Jsonwebtoken:

```sh
npm install jsonwebtoken
```

Sha1:

```sh
npm install sha1
```

Spawn:

```sh
npm install sha1
```

Sengrid mail:

```sh
npm install sha1
```

Nodemon:

```sh
npm install -g nodemon
```

Colors:

```sh
npm install colors
```