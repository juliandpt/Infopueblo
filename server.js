const { Pool } = require('pg')
const { PythonShell } = require('python-shell')
const fs = require('fs')
const express = require('express')
const jwt = require('jsonwebtoken')
const sha = require('sha1')
const spawn = require('child_process').spawn
const date = require('date-and-time')

const sendGridMail = require('@sendgrid/mail');

const app = express();
const pool = new Pool({
    connectionString: "postgres://amvnwrnjzqtkgh:e795f9d0a48704ea436bbd5d8efdbc914c9e146aaad730b0aca9c819ebbff0aa@ec2-99-80-200-225.eu-west-1.compute.amazonaws.com:5432/d20hkpogjrcusn",
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

app.post('/login', async (req, res) => {
    console.log(req.body)
    // const query = {
    //     text: 'SELECT * FROM users WHERE users.email = ? and users.password = ?',
    //     values: [req.body.email, sha(req.body.password)],
    //     rowMode: 'array'
    // }
    const query = "SELECT * FROM users WHERE users.email ='" + req.body.email +  "' and users.password = '" + sha(req.body.password) + "';"
    console.log(query)
    const result = await pool.query(query)
    console.log(result)

    if (result.rowCount == 0) {
        return res.json({
            message: 'ko'
        })
    }

    var userid = result.rows[0].id_user;
    console.log(userid)
    var password = result.rows[0].password;
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

            // const query = {
            //     text: 'UPDATE users SET token = ? where id_user = ?',
            //     values: [accesToken, userid],
            //     rowMode: 'array'
            // }
            const query = "UPDATE users SET token = '" + accessToken +  "' where id_user = '" + userid + "';"
            const result2 = await pool.query(query)
            console.log(result2)

            return res.json({
                message: 'ok',
                token: accessToken
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
app.get('/validate', async (req, res) => {
    console.log(req.query)
    // const query = {
    //     text: 'SELECT * FROM users WHERE users.email = ? and users.password = ?',
    //     values: [req.body.email, sha(req.body.password)],
    //     rowMode: 'array'
    // }
    const query = "UPDATE users SET validate=true where email = '" + req.query.email + "' and token='" + req.query.token + "';"
    console.log(query)
    const result = await pool.query(query)
    console.log(result)

    if (result.rowCount == 0) {
        return res.json({
            message: 'ko'
        })
    }
    else return res.json({
        message: 'cuenta validada'
    })
})

app.post('/register', async(req, res) => {
    try {
        console.log(req.body);
        email = req.body.email
        const now = new Date();
        today = date.format(now, 'YYYY-MM-DD')
        var claims = {
            userid: req.body.name,
            exp: Date.now(),
            iat: Date.now() //Fecha de creación
        }
    
        const accessToken = jwt.sign(claims, '3ea3967ae8328f89eda5be264d5af88b83d490afc9218d02e5628e07bf89850e828eef80c4085c20e4a394f5a7792773347e7a6492b0e05e54f321a34b7ed20b')

        var query = {            
            text: "INSERT INTO users (email,password,name,surnames,phone,entry_date,leaving_date,admin,token,validate) VALUES ($1,$2,$3,$4,$5,$6,NULL,false,$7,false);",
            values: [email, sha(req.body.password), req.body.name, req.body.surnames, req.body.phone, today, accessToken],
            rowMode: 'array'
        }
        var result = pool.query(query)
        sendGridMail.setApiKey('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');
        url = 'http://127.0.0.1:8080/validate?email='+ email + '&token=' + accessToken
        function getMessage() {
        const body = 'Haz click en el siguiente link para validar tu cuenta: ' + url;
        return {
            to: email,
            from: 'correoguapisimo@outlook.com',
            subject: 'Valida tu cuenta!',
            text: body,
            html: `<strong>${body}</strong>`,
        };
        }

        async function sendEmail() {
        try {
            await sendGridMail.send(getMessage());
            console.log('Test email sent successfully');
        } catch (error) {
            console.error('Error sending test email');
            console.error(error);
            if (error.response) {
            console.error(error.response.body)
            }
        }
        }

        (async () => {
        console.log('Sending test email');
        await sendEmail();
        })();
        return res.json({
            message: 'ok'
        });
    } catch {
        return res.json({
            message: 'ko'
        });
    }   
})

app.post('/search', (req, res)=> {
    console.log(req.body)
    const child = spawn('python', ['./WebScrapers/20minutos.py', req.body.text]);
    child.on("close", () => {
        var contents = fs.readFileSync("./WebScrapers/resultado/20minutos.json");
        
        var jsonContent = JSON.parse(contents)

        res.send(jsonContent)
    })
})

app.post('/search2', (req, res)=> {
    console.log(req.body)
    const child = spawn('python', ['./WebScrapers/20minutos.py', req.body.text]);
    child.stdout.on('data', (data) => {
        var jsonContent = JSON.parse(data.toString());
        console.log(jsonContent[1].title);
      });
    // child.on("close", () => {
    //     var contents = fs.readFileSync("./WebScrapers/resultado/20minutos.json");
        
    //     var jsonContent = JSON.parse(contents)

    //     console.log(jsonContent[1].title)
    // })
})

//Middlewares

async function authenticateToken(token) {
    try {
        decodedToken = jwt.decode(token)
        var userid = decodedToken.userid

        // await pool.connect()
        const query = {
            text: 'SELECT token FROM users WHERE users.id_user = ?',
            values: [userid],
            rowMode: 'array'
        }
        const result = await pool.query(query)
        pool.end()

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