# Infopueblo

*Infopueblo is a web service responsible for collecting relevant information from the towns belonging to the emptied Spain, such as hotels or restaurants, thereby enhancing their visibility.*

## Frontend

*Front-end guide for Infopueblo project.*
### Requirements 📋

*Angular installation:*

```sh
npm install -g @angular/cli
```

*Bootstrap v5 installation:*

```sh
npm install bootstrap@next
```

*Bootstrap icons installation:*

```sh
npm install bootstrap-icons
```

*Carousel for Angular installation:*

```sh
npm install angular-responsive-carousel
```

*Angular Material installation:*

```sh
ng add @angular/material
```

*Angular Highcharts installation:*

```sh
npm install highcharts-angular
```

*Angular Full Page installation:*

```sh
npm install @fullpage/angular-fullpage
```

*Google Maps installation:*

```sh
npm install @types/googlemaps
```

*Skeleton installation:*

```sh
npm install ngx-skeleton-loader
```

### Environment configuration ⚙️

*Project creation:*

```sh
ng new project-name
```

*Once the project is created, before executing any of the following commands, you will have to navigate to the folder where the project is located with `cd project-name`.*

*Execute project in development mode:*

```bash
ng serve -o
```

*Create component:*

```sh
ng generate component component-name
```

### Deployment 📦

*Build the project (use the `--prod` tag for a production build):*

```sh
ng build
```

*For more help, visit the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.*

### Built with 🛠️

- [Angular](https://angular.io/docs) - The web framework used
- [Bootstrap](https://getbootstrap.com/docs/5.1/getting-started/introduction/) - Web style library
- [Bootstrap icons](https://icons.getbootstrap.com/) - Bootstrap Library Icon Pack
- [Carousel for Angular](https://www.npmjs.com/package/angular-responsive-carousel) - Carousel optimized for Angular
- [Angular Material](https://material.angular.io/) - Material Design package optimized for Angular
- [Angular Highcharts](https://www.npmjs.com/package/highcharts-angular) - HighCharts chart package optimized for Angular
- [Angular Full Page](https://www.npmjs.com/package/@fullpage/angular-fullpage) - Package to adapt to full screen optimized for Angular
- [Google Maps](https://www.npmjs.com/package/@types/googlemaps) - Package to include a Google Maps map
- [Skeleton](https://www.npmjs.com/package/ngx-skeleton-loader) - Package to use a modern results loading method

## Backend

*Back-end guide for Infopueblo project.*

### Requirements 📋

*Express:*

```sh
npm install express
```

*Mariadb:*

```sh
npm install mariadb
```

*Cors:*

```sh
npm install cors
```

*Dotenv:*
```sh
npm install dotenv
```

*Jsonwebtoken:*

```sh
npm install jsonwebtoken
```

*Sha1:*

```sh
npm install sha1
```

*Spawn:*

```sh
npm install sha1
```

*Sengrid mail:*

```sh
npm install sha1
```

*Nodemon:*

```sh
npm install nodemon
```

*Moment:*
```sh
npm install moment
```

*Colors:*

```sh
npm install colors
```

### Environment configuration ⚙️

*1. Server creation:*
```sh
npm init --yes
```
*2. Create the different files and directories of the project*

*3. Create `.env` file and add the following environment variables:*

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

*4. Add the next line on package.json file:*
```tree
└─ server
    └─ package.json
        └─ "scripts"
            └─ *"dev": "nodemon server.js"*
```

### Deployment 📦

*Activate server:*
```sh
npm run dev
```

### Built with 🛠️

- [node.js](https://nodejs.org/en/) - server of the project.
- [python](https://www.python.org/downloads/) - used for data collection and implementation of machine learning models
- [Express](https://www.npmjs.com/package/express) - provides a set of features for web and mobile applications
- [Mariadb](https://www.npmjs.com/package/mariadb) - allows to establish the connection to the database
- [Cors](https://www.npmjs.com/package/cors) - provides Connect/Express middleware that can be used to enable CORS with various options.
- [Dotenv](https://www.npmjs.com/package/dotenv) - allows to access the environment variables of the .env file
- [Jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - provides the tools to create user tokens
- [Sha1](https://www.npmjs.com/package/sha1) - provides the text encryption algorithm
- [Spawn](https://www.npmjs.com/package/sha1) - allows to get the resulting information from a python file
- [SengridMail](https://www.npmjs.com/package/@sendgrid/mail) - allows you to send emails to a user
- [Moment](https://www.npmjs.com/package/moment) - allows to analyze, validate, manipulate and format dates
- [Nodemon](https://www.npmjs.com/package/nodemon/v/1.18.10) - automatically restarts the node application when file changes are detected in the directory
- [Colors](https://www.npmjs.com/package/colors) - allows you to set a console output with the desired color.

## Authors ✒️

- Alfonso Vega - [@alfonsovega97](https://github.com/alfonsovega97)
- Juan Lasso de la Vega - [@lassete6898](https://github.com/lassete6898)
- Julián de Pablo - [@juliandpt](https://www.github.com/juliandpt)