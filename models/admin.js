const express = require('express')
const colors = require("colors")

const router = express.Router()
const pool = require('../database/database')
const middleware = require('../controllers/middleware')
const service = require('../services')

require('dotenv').config()

router.post('/login', middleware.validateSecretPassword, async (req, res) => {
    console.log('POST /admin/login')

    var query = await pool.query("SELECT id_user FROM users WHERE users.email = ? and users.password = ?;", [req.body.email, service.encryptPassword(req.body.password)])

    if (query.length === 0) {
        console.log('BAD RESPONSE'.red)
        return res.status(401).send({
            status: "ko"
        })
    } else {
        try{
            const accessToken = service.createToken(query[0].id_user)
            
            await pool.query("UPDATE users SET token = ? WHERE id_user = ?;", [accessToken, query[0].id_user])
            
            console.log('GOOD RESPONSE'.green)
            return res.status(200).send({
                status: "ok",
                token: accessToken
            });
        } catch {
            console.log('BAD RESPONSE'.red)
            return res.status(500).send({
                status: "ko"
            })
        }
    }
})

router.post('/register', middleware.verifyToken, middleware.existsEmail, async(req, res) => {
    console.log('POST /admin/register')

    try {
        const registerToken = service.createToken(req.body.email)
        
        await pool.query("INSERT INTO users (email,password,name,surnames,isAdmin,verificationToken) VALUES (?,?,?,?,1,?);", [req.body.email, service.encryptPassword(req.body.password), req.body.name, req.body.surnames, registerToken])

        console.log('GOOD RESPONSE'.green)
        return res.status(200).send({
            status: "ok"
        });
    } catch {
        console.log('BAD RESPONSE'.red)
        return res.status(500).send({
            status: "ko server"
        });
    }
})

router.post('/edit/:id', middleware.verifyToken, async (req, res) => {
    console.log('POST /admin/edit')

    try {
        const query = pool.query("UPDATE users SET name = ?, surnames = ?, email = ?, password = ? WHERE id_user = ?;", [req.body.name, req.body.surnames, req.body.email, service.encryptPassword(req.body.password), req.params.id])

        if (query.affectedRows === 0) {
            console.log('BAD RESPONSE'.red)
            return res.status(400).send({
                status: "ko"
            })
        } else {
            console.log('GOOD RESPONSE'.green)
            return res.status(200).send({
                status: "ok"
            })
        }
    } catch {
        console.log('BAD RESPONSE'.red)
        return res.status(500).send({
            status: "ko"
        })
    }
})

router.delete('/delete/:id', middleware.verifyToken, async (req, res) => {
    console.log('DELETE /admin/delete/', req.params.id)

    try {
        var query = await pool.query("UPDATE users SET isAdmin = '0' WHERE users.id_user = ?;", [req.params.id])

        if (query.affectedRows === 0) {
            console.log('BAD RESPONSE'.red)
            return res.status(500).send({
                status: "ko"
            })
        } else {
            console.log('GOOD RESPONSE'.green)
            return res.status(200).send({
                status: "ok"
            })
        }
    } catch {
        console.log('BAD RESPONSE'.red)
        return res.status(500).send({
            status: "ko"
        })
    }
})

router.get('/getAdmins', middleware.verifyToken, async (req, res) => {
    console.log('GET /admin/getAdmins')

    try {
        var result = await pool.query("SELECT id_user, name, surnames, email FROM users WHERE isAdmin = '1';")

        if (result.length === 0) {
            console.log('BAD RESPONSE'.red)
            return res.status(500).send({
                status: "ko"
            })
        } else {
            console.log('GOOD RESPONSE'.green)
            return res.status(200).send(result)
        }
    } catch {
        console.log('BAD RESPONSE'.red)
        return res.status(500).send({
            status: "ko"
        })
    }
})

module.exports = router;