const { Pool } = require('pg')
const { PythonShell } = require('python-shell')
const fs = require('fs')
const express = require('express')
const jwt = require('jsonwebtoken')
const sha = require('sha1')
const { StringDecoder } = require('string_decoder');
const utf8 = require('utf8');
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
            templateId: 'd-8170e316f5b542dda528d66c79116be8',
            dynamicTemplateData: {
                subject: 'Valida tu cuenta!',
                user: req.body.name,
                url: url,
              },
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

app.post('/user', (req, res) => {
    if (authenticateToken(req.body.token) == false) {
        res.json({
            message: "ko"
        })
    } else {
        try {
            decodedToken = jwt.decode(token)
            var userid = decodedToken.userid

            const query = "SELECT * FROM users WHERE users.Id_user ='" + userid +  "';"
            const result = pool.query(query)

            var name = result.rows[0].name;
            var surnames = result.rows[0].surnames;

            return res.json({
                message: "ok",
                name: name,
                surnames: surnames
            })
        } catch {
            return res.json({
                message: "ko info",
            })
        }
    }
})

app.post('/user/delete', (req, res) => {
    if (authenticateToken(req.body.token) == false) {
        res.json({
            message: "ko"
        })
    } else {
        try {
            decodedToken = jwt.decode(req.body.token)
            var userid = decodedToken.userid

            const query = "DELETE FROM users WHERE users.Id_user ='" + userid +  "';"
            const result = pool.query(query)

            if (result.rowCount == 0) {
                return res.json({
                    message: 'ko'
                })
            }

            return res.json({
                message: "ok"
            })
        } catch {
            return res.json({
                message: "ko"
            })
        }
    }
})

app.get('/getTowns', async (req, res) => {
    try {
        var query = "SELECT * FROM towns;"
        var result = await pool.query(query)

        if (result.rowCount == 0) {
            return res.json({
                message: 'ko'
            })
        } else {
            var towns = []
            for (let i = 0; i < result.rows.length; i++) {
                town = {}
                town['id'] = result.rows[i].id_town
                town['name'] = result.rows[i].name
                towns.push(town)
            }

            return res.send(towns)
        }
    } catch (error){
        console.log(error)
        res.json({
            message: "error",
            error
        })
    }
})

app.get('/getTown/:id', async (req, res) => {
    var query = "SELECT * FROM towns WHERE towns.id_town = '" + req.params.id + "';"

    console.log('before promises')
    var townData = await pool.query(query)
    console.log(townData.rows)
    
    let promiseRestaurants = async () => new Promise((resolve, reject) => {
        const child = spawn('python', ['./WebScrapers/buscorestaurantes.py', townData.rows[0].name]);
        child.on("close", () => {
            var contents = fs.readFileSync("./WebScrapers/resultado/buscorestaurantes.json");
            var jsonContent = JSON.parse(contents)
            resolve(jsonContent)
        })
        child.on("error", (error) => {
            reject(error)
        })
    })
    let promiseJobs = async () => new Promise((resolve, reject) => {
        const child = spawn('python', ['./WebScrapers/jobtoday.py', townData.rows[0].name]);
        child.on("close", () => {
            var contents = fs.readFileSync("./WebScrapers/resultado/jobtoday.json");
            var jsonContent = JSON.parse(contents)
            resolve(jsonContent)
        })
        child.on("error", (error) => {
            reject(error)
        })
    })
    let promiseNews = async () => new Promise((resolve, reject) => {
        const child = spawn('python', ['./WebScrapers/20minutos.py', townData.rows[0].name]);
        child.on("close", () => {
            var contents = fs.readFileSync("./WebScrapers/resultado/20minutos.json");
            var jsonContent = JSON.parse(contents)
            resolve(jsonContent)
        })
        child.on("error", (error) => {
            reject(error)
        })
    })

    if(townData.rowCount !== 0) {
        console.log('llega')
        var responses = await Promise.all([promiseRestaurants(), promiseJobs(), promiseNews()]).then(values => {
            console.log(values)
        }).catch(reason => {
            console.log(reason)
        });
    
        town = {}
        town['name'] = townData.rows[0].name
        console.log(town['name'])
        town['region'] = townData.rows[0].region
        console.log(town['region'])
        town['province'] = townData.rows[0].province
        console.log(town['province'])
        town['aacc'] = townData.rows[0].aacc
        console.log(town['aacc'])
        town['density_pob'] = townData.rows[0].density_pob
        console.log(town['density_pob'])
        town['population'] = townData.rows[0].population
        console.log(town['population'])
        town['emptied'] = townData.rows[0].emptied
        console.log(town['emptied'])
        town['restaurants'] = responses[0]
        town['jobs'] = responses[1]
        town['news'] = responses[2]
        
        return res.send(town)
    } else {
        res.status(404)
        res.send({
            status: `No town with ${req.params.id} id found`
        })
    }
})

app.get('/search/jobs', async(req, res)=> {
    console.log(req.body)
    const child = spawn('python', ['./WebScrapers/jobtoday.py', req.body.text]);
    child.on("close", () => {
        var contents = fs.readFileSync("./WebScrapers/resultado/jobtoday.json");
        
        var jsonContent = JSON.parse(contents)

        res.send(jsonContent)
    })
})

app.get('/search/news', async(req, res)=> {
    console.log(req.body)
    const child = spawn('python', ['./WebScrapers/20minutos.py', req.body.text]);
    child.on("close", () => {
        var contents = fs.readFileSync("./WebScrapers/resultado/20minutos.json");
        
        var jsonContent = JSON.parse(contents)

        res.send(jsonContent)
    })
    child.on("error", (error) => {
        console.log(error)
    })
})

app.get('/search/restaurants', async(req, res)=> {
    console.log(req.body)
    const child = spawn('python', ['./WebScrapers/buscorestaurantes.py', req.body.text]);
    child.on("close", () => {
        var contents = fs.readFileSync("./WebScrapers/resultado/buscorestaurantes.json");
        
        var jsonContent = JSON.parse(contents)

        res.send(jsonContent)
    })
    child.on("error", (error) => {
        console.log(error)
    })
})

app.get('/search/municipios', async(req, res)=> {
    console.log(req.body)
    const child = spawn('python', ['./WebScrapers/15mpedia.py', req.body.text]);
    child.on("close", () => {
        var contents = fs.readFileSync("./WebScrapers/resultado/15mpedia.json");
        
        var jsonContent = JSON.parse(contents)

        res.send(jsonContent)
    })
    child.on("error", (error) => {
        console.log(error)
    })
})

app.get('/search2', (req, res)=> {
    console.log(req.body.text)
    const child = spawn('python', ['./WebScrapers/jobtoday.py', req.body.text]);
    child.stdout.on('data', (data) => {
        //console.log(utf8.decode(data))
        //console.log(decoder.write(data))
        //console.log(data)
        
        var jsonContent = JSON.parse(data.toString('utf8'));
        res.send(jsonContent);
    });
    child.on("error", (error) => {
        console.log(error)
    })
})

//Middlewares

async function authenticateToken(token) {
    try {
        decodedToken = jwt.decode(token)
        var userid = decodedToken.userid

        const query = {
            text: 'SELECT token FROM users WHERE users.id_user = ?',
            values: [userid],
            rowMode: 'array'
        }
        const result = await pool.query(query)

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