const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.set('port', process.env.PORT || 8080)

app.get('/api', (req, res) => {
    res.json({
        message: 'Hello, World'
    });
});

app.get('/login', (req, res) => {

})

app.get('/register', (req, res) => {
    
})

app.listen(8080, () => console.log(`Server initialized on port ${app.get('port')}`));