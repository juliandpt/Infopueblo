const { Pool, Client } = require('pg')
const express = require('express')
const jwt = require('jsonwebtoken')
const sha = require('sha1')
const spawn = require('child_process').spawn
const d = require('date-and-time')

const app = express();
const client = new Client({
    user: "amvnwrnjzqtkgh",
    host: "ec2-99-80-200-225.eu-west-1.compute.amazonaws.com",
    database: "d20hkpogjrcusn",
    password: "e795f9d0a48704ea436bbd5d8efdbc914c9e146aaad730b0aca9c819ebbff0aa",
    port: "5432",
    connectionString: "postgres://amvnwrnjzqtkgh:e795f9d0a48704ea436bbd5d8efdbc914c9e146aaad730b0aca9c819ebbff0aa@ec2-99-80-200-225.eu-west-1.compute.amazonaws.com:5432/d20hkpogjrcusn",
    ssl: {
        rejectUnauthorized: false
    }
});
const scraperAirbnb = spawn('python',["path/to/script.py", arg1, arg2])

app.use(express.json())
app.set('port', process.env.PORT || 8080)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.post('/login', async (req, res) => {
    console.log(req.body)
    await client.connect()
    const query = {
        text: 'SELECT * FROM users WHERE users.email = ? and users.password = ?',
        values: [req.body.email, sha(req.body.password)],
        rowMode: 'array'
    }
    const result = await client.query(query)
    client.end(err => {
        console.log('client has disconnected')
        if (err) {
          console.log('error during disconnection', err.stack)
        }
    })
    console.log(result.rows)

    if (result.rowCount == 0) {
        return res.status(400).json({
            message: 'ko'
        })
    }

    var userid = result.rows[0][0];
    console.log(userid)
    var password = result.rows[0][2];
    console.log(password)

    try{
        if (sha(req.body.password) == password) {
            var claims = {
                userid: userid,
                exp: Date.now(),
                iat: Date.now() //Fecha de creación
            }
        
            const accessToken = jwt.sign(claims, '3ea3967ae8328f89eda5be264d5af88b83d490afc9218d02e5628e07bf89850e828eef80c4085c20e4a394f5a7792773347e7a6492b0e05e54f321a34b7ed20b')
            console.log(accessToken)

            await client.connect()
            const query = {
                text: 'UPDATE USERS SET token = ? where id_user = ?',
                values: [token, userid],
                rowMode: 'array'
            }
            await client.query(query)
            client.end(err => {
                console.log('client has disconnected')
                if (err) {
                console.log('error during disconnection', err.stack)
                }
            })

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
        return res.json({
            message: 'este'
        })
    }
})

app.post('/register', (req, res) => {
    try {
        console.log(req.body);

        const now = new Date();
        today = date.format(now, 'YYYY-MM-DD')

        client.connect().then(() => console.log("Connected to db"));
        var query = {            
            text: "INSERT INTO users (email,password,name,surnames,phone,entry_date,leaving_date,admin,token) VALUES (?,?,?,?,?,?,NULL,false,NULL);",
            values: [req.body.email, sha(req.body.password), req.body.name, req.body.surnames, req.body.phone, today],
            rowMode: 'array'
        }
        var result = client.query(query)
        client.end();

        return res.json({
            message: 'ok'
        });
    } catch {
        return res.json({
            message: 'ko'
        });
    }   
})

app.get('/towns', (req, res)=> {
    
})

//Middlewares

async function authenticateToken(token) {
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
        return false
    }
}

app.listen(8080, () => console.log(`Server initialized on port ${app.get('port')}`));