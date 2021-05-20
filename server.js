const mariadb = require('mariadb')
const fs = require('fs')
const express = require('express')
const jwt = require('jsonwebtoken')
const sha = require('sha1')
//const { StringDecoder } = require('string_decoder');
//const utf8 = require('utf8');
const spawn = require('child_process').spawn
const sendGridMail = require('@sendgrid/mail');

const app = express();
const pool = mariadb.createPool({
    host: '2.139.176.212', 
    user:'pr_grupob', 
    password: 'PC2-2021',
    database: 'prgrupob',
    connectionLimit: 5
});
const d = new Date()
const today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
const tomorrow = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() + 1)
const past = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() - 7)

app.use(express.json())
app.set('port', process.env.PORT || 8080)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// -------------------------------------------------------------------------------------
// Gestion de usuarios
// -------------------------------------------------------------------------------------

app.post('/login', async (req, res) => {
    console.log(req.body)
    // const query = {
    //     text: 'SELECT * FROM users WHERE users.email = ? and users.password = ?',
    //     values: [req.body.email, sha(req.body.password)],
    //     rowMode: 'array'
    // }
    const query = "SELECT * FROM users WHERE users.email = ? and users.password = ?;"
    console.log(query)
    var result = await pool.query(query, [req.body.email, sha(req.body.password)])
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

    var today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
    var date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() + 1)

    try{
        if (sha(req.body.password) == password) {
            var claims = {
                userid: userid,
                exp: Date.now(),
                iat: Date.now() //Fecha de creación
            }
        
            const accessToken = jwt.sign(claims, '3ea3967ae8328f89eda5be264d5af88b83d490afc9218d02e5628e07bf89850e828eef80c4085c20e4a394f5a7792773347e7a6492b0e05e54f321a34b7ed20b')
            console.log(accessToken)

            const query = "UPDATE users SET token = ? where id_user = ?;"
            const result2 = await pool.query(query, [accessToken, userid])
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
    const query = "UPDATE users SET validate=true where email = ? and token = ?;"
    const result = await pool.query(query, [req.query.email, req.query.token])
    console.log(result)

    if (result.rowCount == 0) {
        return res.json({
            message: 'ko'
        })
    } else {
        return res.json({
            message: 'cuenta validada'
        })
    } 
})

app.post('/register', async(req, res) => {
    try {
        console.log(req.body);
        email = req.body.email
        var claims = {
            userid: req.body.name,
            exp: tomorrow,
            iat: today
        }
    
        const accessToken = jwt.sign(claims, '3ea3967ae8328f89eda5be264d5af88b83d490afc9218d02e5628e07bf89850e828eef80c4085c20e4a394f5a7792773347e7a6492b0e05e54f321a34b7ed20b')

        const query = "INSERT INTO users (email,password,name,surnames,admin,token,validate) VALUES (?,?,?,?,?,?,?);"
        var result = await pool.query(query, [email, sha(req.body.password), req.body.name, req.body.surnames, false, accessToken, false])
        
        sendGridMail.setApiKey('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');
        url = 'http://localhost:4200/login?email='+ email + '&token=' + accessToken
        
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

            const query = "SELECT * FROM users WHERE users.Id_user = ?;"
            const result = pool.query(query, [userid])

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

            const query = "DELETE FROM users WHERE users.Id_user = ?;"
            const result = pool.query(query, [userid])

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

// -------------------------------------------------------------------------------------
// Obtencion de datos de pueblos
// -------------------------------------------------------------------------------------

app.get('/getTowns', async (req, res) => {
    try {
        const query = "SELECT * FROM towns;" //coger datos necesarios
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

app.get('/getTopTowns', async (req, res) => {
    try {
        //SELECT * FROM searches WHERE searches.date >= ? ORDER BY searches.num_searches DESC LIMIT 10;
        const query = "SELECT id_town FROM searches GROUP BY id_town ORDER BY COUNT(*) DESC LIMIT 10;"
        var result = await pool.query(query)

        if (result.rowCount == 0) {
            return res.json({
                message: 'ko'
            })
        } else {
            var towns = []
            for (let i = 0; i < result.rows.length; i++) {
                //var townid = result.rows[i].id_town
                var townQuery = "SELECT * FROM towns WHERE towns.id_town = ?;"
                var resultTown = await pool.query(townQuery, [result.rows[i].id_town])

                town = {}
                town['id'] = resultTown.rows[0].id_town
                town['name'] = resultTown.rows[0].name
                town['image'] = resultTown.rows[0].image_url
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

app.post('/town/like/:id', async (req, res) => {
    //var townid = req.params.id
    var query = "UPDATE towns SET likes = likes+1 WHERE towns.id_town = ?;"
    await pool.query(query, [req.params.id])
})

app.get('/getLikedTowns', async (req, res) => {
    try {
        const query = "SELECT * FROM towns ORDER BY towns.likes DESC LIMIT 10;"
        var result = await pool.query(query)

        if (result.rowCount == 0) {
            return res.json({
                message: 'ko'
            })
        } else {
            var towns = []
            for (let i = 0; i < result.rows.length; i++) {
                town = {}
                town['id'] = result.rows[0].id_town
                town['name'] = result.rows[0].name
                town['image'] = result.rows[0].image_url
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
    var townQuery = "SELECT * FROM towns WHERE towns.id_town = ?;"
    var searchQuery = "SELECT id_town FROM searches WHERE searches.id_town = ? AND searches.date >= ?;"
    var insertQuery = "INSERT INTO searches (id_town, date) VALUES (?,?);"

    var resultSearch = await pool.query(searchQuery, [req.params.id])
    var resultTown = await pool.query(townQuery, [req.params.id, past])
    await pool.query(insertQuery, [req.params.id, today])

    let promiseRestaurants = new Promise((resolve, reject) => {
        const child = spawn('python', ['./WebScrapers/buscorestaurantes.py', resultTown.rows[0].name]);
        child.stdout.on('data', (data) => {
            var jsonContent = JSON.parse(data);
            resolve(jsonContent);
        });
        child.on("error", (error) => {
            reject(error)
        })
    })
    let promiseJobs = new Promise((resolve, reject) => {
        const child = spawn('python', ['./WebScrapers/jobtoday.py', resultTown.rows[0].name]);
        child.stdout.on('data', (data) => {
            var jsonContent = JSON.parse(data);
            resolve(jsonContent);
        });
        child.on("error", (error) => {
            reject(error)
        })
    })
    let promiseNews = new Promise((resolve, reject) => {
        const child = spawn('python', ['./WebScrapers/20minutos.py', resultTown.rows[0].name]);
        child.stdout.on('data', (data) => {
            var jsonContent = JSON.parse(data);
            resolve(jsonContent);
        });
        child.on("error", (error) => {
            reject(error)
        })
    })

    if (resultSearch.rowCount === 0) {
        if (townData.rowCount !== 0) {
            // var deleteRestaurants = "DELETE FROM restaurants WHERE id_town = '" + req.params.id + "';" 
            // var deleteJobs = "DELETE FROM jobs WHERE id_town = '" + req.params.id + "';" 
            // var deleteNews = "DELETE FROM news WHERE id_town = '" + req.params.id + "';" 

            // await pool.query(deleteRestaurants, [])
            // await pool.query(deleteJobs)
            // await pool.query(deleteNews)

            var responses = await Promise.all([promiseRestaurants, promiseJobs, promiseNews]).then(values => {
                console.log(values)
            }).catch(reason => {
                console.log(reason)
            });

            for (let i = 0; i < responses[0].length; i++) {
                var townid = req.params.id
                var name = responses[0][i].name
                var location = responses[0][i].location
                var sentiment = responses[0][i].sentiment
                //var image = responses[0][i].image_url

                var insertRestaurantQuery = "INSERT INTO restaurants (id_town,name,location,sentiment) VALUES (?,?,?,?);"
                await pool.query(insertRestaurantQuery, [townid, name, location, sentiment])
            }
        
            town = {}
            town['name'] = townData.rows[0].name
            town['region'] = townData.rows[0].region
            town['province'] = townData.rows[0].province
            town['aacc'] = townData.rows[0].aacc
            town['density'] = townData.rows[0].density
            town['population'] = townData.rows[0].population
            town['emptied'] = townData.rows[0].emptied
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
    } else {
        var restaurantsQuery = "SELECT * FROM restaurants WHERE id_town = ?;"
        var jobsQuery = "SELECT * FROM jobs WHERE id_town = ?;"
        var newsQuery = "SELECT * FROM news WHERE id_town = ?;"

        var resultRetsaurants = await pool.query(restaurantsQuery, [req.params.id])
        var resultJobs = await pool.query(jobsQuery, [req.params.id])
        var resultNews = await pool.query(newsQuery, [req.params.id])

        var restaurants = []
        var jobs = []
        var news = []

        for (let i = 0; i < result.rows.length; i++) {

        }

        town = {}
        town['name'] = townData.rows[0].name
        town['region'] = townData.rows[0].region
        town['province'] = townData.rows[0].province
        town['aacc'] = townData.rows[0].aacc
        town['density'] = townData.rows[0].density
        town['population'] = townData.rows[0].population
        town['emptied'] = townData.rows[0].emptied
        town['restaurants'] = responses[0]
        town['jobs'] = responses[1]
        town['news'] = responses[2]
        
    }
})

app.get('/search/jobs', async(req, res)=> {
    console.log(req.body)
    const child = spawn('python', ['./WebScrapers/jobtoday.py', req.body.text]);
    child.stdout.on('data', (data) => {
        var jsonContent = JSON.parse(data);
        res.send(jsonContent);
    });
    child.on("error", (error) => {
        res.send(error)
    })
})

app.get('/search/news', async(req, res)=> {
    console.log(req.body)
    const child = spawn('python', ['./WebScrapers/20minutos.py', req.body.text]);
    child.stdout.on('data', (data) => {
        var jsonContent = JSON.parse(data);
        res.send(jsonContent);
    });
    child.on("error", (error) => {
        res.send(error)
    })
})

app.get('/search/restaurants', async(req, res)=> {
    console.log(req.body)
    const child = spawn('python', ['./WebScrapers/buscorestaurantes.py', req.body.text]);
    child.stdout.on('data', (data) => {
        var jsonContent = JSON.parse(data);
        res.send(jsonContent);
    });
    child.on("error", (error) => {
        res.send(error)
    })
})

// -------------------------------------------------------------------------------------
// Middlewares
// -------------------------------------------------------------------------------------

async function authenticateToken(token) {
    try {
        decodedToken = jwt.decode(token)
        var userid = decodedToken.userid

        const query = "SELECT token FROM users WHERE users.id_user = ?"
        var result = await pool.query(query, [userid])

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