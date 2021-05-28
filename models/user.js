const express = require('express')
const router = express.Router()
const pool = require('../database')
const middleware = require('../controllers/middleware')
const service = require('../services')
const jwt = require('jsonwebtoken')
const sendGridMail = require('@sendgrid/mail')
require('dotenv').config()

router.post('/login', async (req, res) => {
    var query = await pool.query("SELECT * FROM users WHERE users.email = ? and users.password = ?;", [req.body.email, service.encyptPassword(req.body.password)])

    if (query.length === 0) {
        return res.status(401).send({
            status: "ko"
        })
    }

    try{
        const accessToken = service.createToken(query[0].id_user)
        
        await pool.query("UPDATE users SET token = ? WHERE id_user = ?;", [accessToken, query[0].id_user])

        return res.status(200).send({
            status: "ok",
            token: accessToken
        });
    } catch {
        return res.status(500).send({
            status: "ko"
        })
    }
})

router.get('/prueba', async (req, res) => {
    if (await middleware.authenticateToken(req.body.token) == true) {
        res.send('acseso consedido')
    } else {
        res.send('acseso denegado')
    }
})

router.post('/register', async(req, res) => {
    if(await middleware.existsEmail(req.body.email) == false) {
        try {
            const registerToken = service.createToken(req.body.email)
            
            var result = await pool.query("INSERT INTO users (email,password,name,surnames,admin,verificationToken) VALUES (?,?,?,?,0,?);", [req.body.email, service.encyptPassword(req.body.password), req.body.name, req.body.surnames, registerToken])
            
            sendGridMail.setApiKey('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');
            url = 'http://localhost:4200/confirmation?email='+ req.body.email + '&token=' + registerToken
            
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
            return res.status(500).send({
                status: "ko server"
            });
        }  
    } else {
        res.status(400).send({
            status: "ko email"
        });
    } 
})

router.get('/validate', async (req, res) => {
    var result = await pool.query("UPDATE users SET validate=true where email = ? and token = ?;", [req.query.email, req.query.token])

    if (result.length === 0) {
        return res.status(401).send({
            status: "ko"
        })
    } else {
        return res.status(200).send({
            status: "ok"
        })
    } 
})

router.post('/get', (req, res) => {
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

router.get('/getUsers', async (req, res) => {
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

router.post('/edit', async (req, res) => {
    if (authenticateToken(req.body.token) == false) {
        res.status(401).send({
            status: "ko"
        })
    } else {
        try {
            decodedToken = jwt.decode(req.body.token)
            var userid = decodedToken.userid

            const result = pool.query("UPDATE users SET name = ?, surnames = ?, password = ? WHERE id_user = ?;", [req.body.name, req.body.surnames, [userid]])

            if (result == 0) {
                return res.status(400).json({
                    status: "ko"
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

router.post('/delete', (req, res) => {
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
                    status: "ko"
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

module.exports = router;