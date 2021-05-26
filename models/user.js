const express = require('express')
const router = express.Router()
const pool = require('../helpers/database')
const jwt = require('jsonwebtoken')
const sha = require('sha1')
const sendGridMail = require('@sendgrid/mail');

router.post('/login', async (req, res) => {
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

router.get('/validate', async (req, res) => {
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

router.post('/register', async(req, res) => {
    try {
        console.log(req.body);
        var payload = {
            userid: req.body.email,
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            iat: Date.now()
        }
        console.log(payload);
        
        const accessToken = jwt.sign(payload, '3ea3967ae8328f89eda5be264d5af88b83d490afc9218d02e5628e07bf89850e828eef80c4085c20e4a394f5a7792773347e7a6492b0e05e54f321a34b7ed20b')
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

            const result = pool.query("UPDATE users SET name = ?, surnames = ? WHERE id = ?;", [req.body.name, req.body.surnames, [userid]])

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

module.exports = router;