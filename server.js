const { Pool, Client } = require('pg')
const express = require('express')
const jwt = require('jsonwebtoken')
const sha = require('sha1')

const app = express();
const client = new Client({
    // poner variable virtualenv
    connectionString: 'postgres://amvnwrnjzqtkgh:e795f9d0a48704ea436bbd5d8efdbc914c9e146aaad730b0aca9c819ebbff0aa@ec2-99-80-200-225.eu-west-1.compute.amazonaws.com:5432/d20hkpogjrcusn',
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(express.json())
app.set('port', process.env.PORT || 8080)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.get('/helloworld', (req, res) => {
    res.json({
        message: 'Hello, World'
    });
});

app.post('/login', async (req, res) => {
    console.log(req)
    await client.connect()
    const query = {
        text: 'SELECT * FROM users WHERE users.email = $1 and users.password = $2',
        values: [req.body.email, sha(req.body.password)],
        rowMode: 'array'
    }
    const result = await client.query(query)
    client.end()

    if (result.rowCount == 0) {
        return res.status(400).json({
            message: 'ko'
        })
    }

    var userid = result.rows[0][0];
    var password = result.rows[0][2];

    try{
        if (sha(req.body.password) == password) {
            var claims = {
                'userid': userid,
                'exp': Date.now() + 24,
                'iat': Date.now() //Fecha de creación
            }
            console.log(claims.exp)
            console.log(claims.iat)
        
            const accessToken = jwt.sign(claims, '3ea3967ae8328f89eda5be264d5af88b83d490afc9218d02e5628e07bf89850e828eef80c4085c20e4a394f5a7792773347e7a6492b0e05e54f321a34b7ed20b')
            console.log(accessToken)

            return res.json({
                message: 'ok',
                token: accesToken
            }); //mirar http valor
        } else {
            return res.json({
                message: 'ko'
            }); //mirar http valor
        }
    } catch {
        return res.status(500).send()
    }

    // cambiar datetime
})

app.post('/register', async (req, res) => {
    console.log(req)
    // capturar excepcion del select
    try {
        await client.connect()
        const query = {
            text: 'insert into users (email,password,name,surnames,phone,entry_date,leaving_date,admin,token) values ($1,$2,$3,$4,$5,$6,NULL,false,NULL);',
            values: [req.body.email, sha(req.body.password), req.body.name, req.body.surnames, req.body.phone, date.getMonth()+1 +'-'+date.getDate()+'-'+date.getFullYear()],
            rowMode: 'array'
        }
        const result = await client.query(query)
        client.end()

        console.log(result)

        return res.json({
            message: 'ok'
        });
    } catch {
        return res.json({
            message: 'ko'
        });
    }   
})

app.get('/', (req, res) => {
    client.query(`SELECT * FROM users;`)
    .then((table) => res.json({ data: table.rows }))
    .catch((err) => res.json(err));
});

//Middlewares

function authenticateToken(token) {
    try {
        decodedToken = jwt.decode(token)
        var userid = decodedToken.userid

        await client.connect()
        const query = {
            text: 'SELECT token FROM users WHERE users.id_user = $1',
            values: [userid],
            rowMode: 'array'
        }
        const result = await client.query(query)
        client.end()

        if(result.body.token != 'NULL') {
            return true
        } else {
            return false
        }
    } catch {
        r
    }
}

function authenticateToken2(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
}

app.listen(8080, () => console.log(`Server initialized on port ${app.get('port')}`));