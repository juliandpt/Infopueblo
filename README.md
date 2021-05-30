# ProyectoDeComputacion-Backend

Desarrollo de código de la parte backend del Proyecto de Computación I, II y III

## Herramientas utilizadas

- Mariadb
- jsonwebtoken
- sha1
- spawn
- sengrid mail
- Node.js
- Express
- Npm

## Configurar entorno
En el directorio raíz del proyecto hay que crear el siguiente fichero `.env`

```.env
DB_HOST=2.139.176.212
DB_USER=pr_grupob
DB_PASS=PC2-2021
DB_NAME=prgrupob
```

## Comandos de instalación

Mariadb(conexión con base de datos):

```sh
npm install mariadb
```

Express:

```sh
npm install express --save
```

Jsonwebtoken:
```sh
npm install jsonwebtoken
```

Sha1:
```sh
npm install sha1
```

Nodemon:
```sh
npm install -g nodemon
```

## Uso de herramientas

Node:
- creacion del entorno: npm init --yes
- crear arhivo server.js

Nodemom:
- instalacion de nodemon
- introducir la ruta: package.json -> scripts -> "comando": "nodemon server.js"

Activar servidor:
- npm run 'comando'