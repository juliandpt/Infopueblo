const pool = require('../database/database')
const service = require('../services')
const moment = require('moment')
require('dotenv').config()

async function existsTown(town) {
    const d = new Date()
    const past = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() - 7)

    var sql = await pool.query("SELECT id_town FROM searches WHERE searches.id_town = ? AND searches.date >= ?;", [town, past])

    if(sql.length === 0) {
        return false
    } else {
        return true
    }
}

async function existsEmail(req, res, next) {
    var sql = await pool.query("SELECT email FROM users WHERE users.email = ?", [req.body.email])

    if(sql.length !== 0) {
        return res.status(500).send({
            status: "ko email"
        })
    }

    next()
}

async function existsEmailforgot(req, res, next) {
    var sql = await pool.query("SELECT email, name, verificationToken FROM users WHERE users.email = ?", [req.body.email])

    if(sql.length === 0) {
        return res.status(500).send({
            status: "ko email"
        })
    }

    req.name = sql[0].name
    req.token = sql[0].verificationToken
    next()
}

async function existsLike(req, res, next) {
    var sql = await pool.query("SELECT id_user FROM likes WHERE id_user = ? AND id_town = ?", [req.sub, req.params.id])

    if(sql.length !== 0) {
        return res.status(500).send({
            status: "ko user"
        })
    }

    next()
}

async function verifyToken(req, res, next) {
    if(!req.headers.authorization) {
        return res.status(401).send({
            status: "ko"
        })
    }

    const token = req.headers.authorization.split(' ')[1]

    if (token === 'null') {
        return res.status(401).send({
            status: "ko"
        })
    }

    const payload = service.decodeToken(token, process.env.SECRET_TOKEN)
    const query = await pool.query("SELECT token FROM users WHERE users.id_user = ?", [payload.sub])

    if (token !== query[0].token) {
        return res.status(401).send({
            status: "ko"
        })
    }

    const payloadDatabase = service.decodeToken(query[0].token, process.env.SECRET_TOKEN)

    if(moment().unix() > payloadDatabase.exp) {
        return res.status(401).send({
            status: "ko"
        })
    }
    
    req.sub = payload.sub
    next()
}

module.exports = {
    existsTown,
    existsEmail,
    existsLike,
    verifyToken,
    existsEmailforgot
}