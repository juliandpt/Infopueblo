const express = require('express')
require('dotenv').config()

const app = express();
const port = process.env.PORT || 8080
const town = require('./models/town')
const user = require('./models/user')

app.use(express.json())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
app.use('/town', town)
app.use('/user', user)

app.listen(port, () => console.log(`Server listening on port ${port}`));