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

async function existsEmail(email) {
    var sql = await pool.query("SELECT email FROM users WHERE users.email = ?", [email])

    if(sql.length === 0) {
        return false
    } else {
        return true
    }
}

async function authenticateToken(token) {
    try {
        var decodedToken = service.decodeToken(token)
        var query = await pool.query("SELECT token FROM users WHERE users.id_user = ?", [decodedToken.sub])

        if (query.length === 0) {
            return false
        } else {
            if (query[0].token !== token) {
                return false
            } else {
                decodedDatabaseToken = service.decodeToken(query[0].token)

                if(moment().unix() > decodedDatabaseToken.exp) {
                    return false
                } else {
                    return true
                }
            }
        }
    } catch {
        return false
    }
}

module.exports = {
    existsTown,
    existsEmail,
    authenticateToken
}