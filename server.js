const mariadb = require('mariadb')
const express = require('express')
const jwt = require('jsonwebtoken')
const sha = require('sha1')
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

app.post('/user/login', async (req, res) => {
    var result = await pool.query("SELECT * FROM users WHERE users.email = ? and users.password = ?;", [req.body.email, sha(req.body.password)])

    if (result === 0) {
        return res.status(401).send({
            status: 'ko'
        })
    }

    var userid = result[0].id_user;
    var password = result[0].password;

    try{
        if (sha(req.body.password) == password) {
            var claims = {
                userid: userid,
                exp: tomorrow,
                iat: today
            }
        
            const accessToken = jwt.sign(claims, '3ea3967ae8328f89eda5be264d5af88b83d490afc9218d02e5628e07bf89850e828eef80c4085c20e4a394f5a7792773347e7a6492b0e05e54f321a34b7ed20b')
            
            await pool.query("UPDATE users SET token = ? WHERE id_user = ?;", [accessToken, userid])

            return res.status(200).send({
                status: 'ok',
                token: accessToken
            });
        } else {
            return res.status(401).send({
                status: 'ko'
            });
        }
    } catch {
        return res.status(500).send({
            status: 'ko'
        })
    }
})

app.get('/validate', async (req, res) => {
    var result = await pool.query("UPDATE users SET validate=true where email = ? and token = ?;", [req.query.email, req.query.token])

    if (result === 0) {
        return res.status(401).send({
            status: 'ko'
        })
    } else {
        return res.status(200).send({
            status: 'ok'
        })
    } 
})

app.post('/user/register', async(req, res) => {
    try {
        console.log(req.body);
        var claims = {
            userid: req.body.email,
            exp: tomorrow,
            iat: today
        }
        console.log(claims);
        
        const accessToken = jwt.sign(claims, '3ea3967ae8328f89eda5be264d5af88b83d490afc9218d02e5628e07bf89850e828eef80c4085c20e4a394f5a7792773347e7a6492b0e05e54f321a34b7ed20b')
        console.log(accessToken)

        var result = await pool.query("INSERT INTO users (email,password,name,surnames,admin,verificationToken) VALUES (?,?,?,?,0,?);", [req.body.email, sha(req.body.password), req.body.name, req.body.surnames, accessToken])
        
        sendGridMail.setApiKey('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');
        url = 'http://localhost:4200/confirmation?email='+ email + '&token=' + accessToken
        
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
        return res.status(200).send({
            status: "ok"
        });
    } catch {
        return res.status(400).send({
            status: "ko"
        });
    }   
})

app.post('/user/get', (req, res) => {
    if (authenticateToken(req.body.token) == false) {
        return res.status(401).send({
            status: "ko"
        })
    } else {
        try {
            decodedToken = jwt.decode(req.body.token)
            var userid = decodedToken.userid

            var result = pool.query("SELECT * FROM users WHERE users.id_user = ?;", [userid])

            var name = result[0].name;
            var surnames = result[0].surnames;

            return res.status(200).json({
                status: "ok",
                name: name,
                surnames: surnames
            })
        } catch {
            return res.status(401).json({
                status: "ko",
            })
        }
    }
})

app.get('/user/getUsers', async (req, res) => {
    try {
        var result = await pool.query("SELECT id_user, name, surnames, email FROM users;")

        if (result.length === 0) {
            return res.status(400).send({
                status: "ko"
            })
        } else {
            var users = []
            for (let i = 0; i < result.length; i++) {
                user = {}
                user["id"] = result[i].id_user
                user["name"] = result[i].name
                user["surnames"] = result[i].surnames
                user["email"] = result[i].email
                users.push(user)
            }

            return res.status(200).send(users)
        }
    } catch (error){
        console.log(error)
        return res.status(500).send({
            status: "ko"
        })
    }
})

app.post('/user/delete', (req, res) => {
    if (authenticateToken(req.body.token) == false) {
        res.status(401).send({
            status: "ko"
        })
    } else {
        try {
            decodedToken = jwt.decode(req.body.token)
            var userid = decodedToken.userid

            const result = pool.query("DELETE FROM users WHERE users.Id_user = ?;", [userid])

            if (result == 0) {
                return res.status(400).json({
                    status: 'ko'
                })
            }

            return res.status(200).json({
                status: "ok"
            })
        } catch {
            return res.status(500).json({
                status: "ko"
            })
        }
    }
})

// -------------------------------------------------------------------------------------
// Obtencion de datos de pueblos
// -------------------------------------------------------------------------------------

app.get('/town/getTowns', async (req, res) => {
    try {
        var result = await pool.query("SELECT id_town, name FROM towns;")

        if (result === 0) {
            return res.status(400).send({
                status: "ko"
            })
        } else {
            var towns = []
            for (let i = 0; i < result.length; i++) {
                town = {}
                town["id"] = result[i].id_town
                town["name"] = result[i].name
                towns.push(town)
            }

            return res.status(200).send(towns)
        }
    } catch (error){
        console.log(error)
        return res.status(500).send({
            status: "ko"
        })
    }
})

app.get('/town/getTopTowns', async (req, res) => {
    try {
        var result = await pool.query("SELECT * FROM searches GROUP BY id_town ORDER BY COUNT(*) DESC LIMIT 10;")

        if (result == 0) {
            res.status(404).send({
                status: "No data"
            })
        } else {
            var towns = []
            for (let i = 0; i < result.length; i++) {
                var query = await pool.query("SELECT id_town, name, image_url FROM towns WHERE towns.id_town = ?;", [result[i].id_town])

                town = {}
                town["id_town"] = query[0].id_town
                town["name"] = query[0].name
                town["image_url"] = query[0].image_url
                towns.push(town)
            }

            res.status(200).send(towns)
        }
    } catch (error){
        console.log(error)
        res.status(404).send({
            status: error
        })
    }
})

app.post('/town/like/:id', async (req, res) => {
    var result = await pool.query("UPDATE towns SET likes = likes+1 WHERE towns.id_town = ?;", [req.params.id])

    if (result.affectedRows !== 0) {
        res.status(200).send({
            status: 'ok'
        })
    } else  {
        res.status(400).send({
            status: 'ko'
        })
    }
})

app.get('/town/getLikedTowns', async (req, res) => {
    try {
        var result = await pool.query("SELECT id_town, name, image_url, likes FROM towns ORDER BY towns.likes DESC LIMIT 10;")

        if (result == 0) {
            res.status(200).send(result)
        } else {
            res.status(200).send(result)
        }
    } catch {
        return res.status(404).send({
            status: "No data"
        })
    }
})

app.get('/town/getTown/:id', async (req, res) => {
    var resultSearch = await pool.query("SELECT id_town FROM searches WHERE searches.id_town = ? AND searches.date >= ?;", [req.params.id, past])

    if (resultSearch == 0) {
        await pool.query("INSERT INTO searches (id_town, date) VALUES (?,?);", [req.params.id, today])
        var resultTown = await pool.query("SELECT * FROM towns WHERE towns.id_town = ?;", [req.params.id])

        if (resultTown != 0) {
            try {
                let promiseRestaurants = new Promise((resolve, reject) => {
                    const child = spawn('python', ['./WebScrapers/buscorestaurantes.py', resultTown[0].name]);
                    child.stdout.on('data', (data) => {
                        var jsonContent = JSON.parse(data);
                        resolve(jsonContent);
                    });
                    child.on("error", (error) => {
                        reject(error)
                    })
                })
                let promiseJobs = new Promise((resolve, reject) => {
                    const child = spawn('python', ['./WebScrapers/cornerjob.py', resultTown[0].name]);
                    child.stdout.on('data', (data) => {
                        var jsonContent = JSON.parse(data);
                        resolve(jsonContent);
                    });
                    child.on("error", (error) => {
                        reject(error)
                    })
                })
                let promiseNews = new Promise((resolve, reject) => {
                    const child = spawn('python', ['./WebScrapers/20minutos.py', resultTown[0].name]);
                    child.stdout.on('data', (data) => {
                        var jsonContent = JSON.parse(data);
                        resolve(jsonContent);
                    });
                    child.on("error", (error) => {
                        reject(error)
                    })
                })

                var responses = await Promise.all([promiseRestaurants, promiseJobs, promiseNews])

                town = {}
                town['name'] = resultTown[0].name
                town['region'] = resultTown[0].region
                town['province'] = resultTown[0].province
                town['aacc'] = resultTown[0].aacc
                town['density'] = resultTown[0].density
                town['population'] = resultTown[0].population
                town['emptied'] = resultTown[0].emptied

                if (responses[0] !== 0) {
                    for (let i = 0; i < responses[0].length; i++) {
                        var townid = req.params.id
                        var name = responses[0][i].name
                        var location = responses[0][i].location
                        var sentiment = responses[0][i].sentiment
    
                        await pool.query("INSERT INTO restaurants (id_town,name,location,sentiment,date) VALUES (?,?,?,?,?);", [townid, name, location, sentiment, today])
                        console.log('inserted restaurant')
                    }

                    town['restaurants'] = responses[0]
                } else {
                    town['restaurants'] = "No data"
                }
                
                if (responses[1] !== 0){
                    for (let i = 0; i < responses[1].length; i++) {
                        var townid = req.params.id
                        var work = responses[1][i].work
                        var title = responses[1][i].title
                        var description = responses[1][i].description
    
                        await pool.query("INSERT INTO jobs (id_town,work,title,description,date) VALUES (?,?,?,?,?);", [townid, work, title, description, today])
                        console.log('inserted job')
                    }

                    town['jobs'] = responses[1]
                } else {
                    town['jobs'] = "No data"
                }
                
                if (responses[2] !== 0){
                    for (let i = 0; i < responses[2].length; i++) {
                        var townid = req.params.id
                        var title = responses[2][i].title
                        var content = responses[2][i].content

                        await pool.query("INSERT INTO news (id_town,date,content,title) VALUES (?,?,?,?);", [townid, today, content, title])
                        console.log('inserted new')
                    }

                    town['news'] = responses[2]
                } else {
                    town['news'] = "No data"
                }
                
                return res.status(200).send(town)
            } catch {
                return res.status(500).send({
                    status: "No data"
                })
            }            
        } else {
            return res.status(404).send({
                status: `No town with ${req.params.id} id found`
            })
        }
    } else {
        await pool.query("INSERT INTO searches (id_town, date) VALUES (?,?);", [req.params.id, today])

        try {
            var resultTown = await pool.query("SELECT * FROM towns WHERE towns.id_town = ?;", [req.params.id])
            var resultRetsaurants = await pool.query("SELECT * FROM restaurants WHERE id_town = ? and date >= ?;", [req.params.id, past])
            var resultJobs = await pool.query("SELECT * FROM jobs WHERE id_town = ? and date >= ?;", [req.params.id, past])
            var resultNews = await pool.query("SELECT * FROM news WHERE id_town = ? and date >= ?;", [req.params.id, past])

            town = {}
            town['name'] = resultTown[0].name
            town['region'] = resultTown[0].region
            town['province'] = resultTown[0].province
            town['aacc'] = resultTown[0].aacc
            town['density'] = resultTown[0].density
            town['population'] = resultTown[0].population
            town['emptied'] = resultTown[0].emptied

            if (resultRetsaurants === 0) {
                town['restaurants'] = "No data"
            } else {
                town['restaurants'] = resultRetsaurants
            }

            if (resultRetsaurants === 0) {
                town['jobs'] = "No data"
            } else {
                town['jobs'] = resultJobs
            }

            if (resultRetsaurants === 0) {
                town['news'] = "No data"
            } else {
                town['news'] = resultNews
            }

            return res.status(200).send(town)
        } catch {
            return res.status(404).send({
                status: "No data"
            })
        }
    }
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