const express = require('express')
const colors = require("colors")
const router = express.Router()
const pool = require('../helpers/database')
const spawn = require('child_process').spawn

const d = new Date()
const today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
const tomorrow = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() + 1)
const past = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() - 7)

router.get('/getTowns', async function(req, res) {
    console.log('GET /town/getTowns')
    try {
        var result = await pool.query("SELECT id_town, name FROM towns;")

        if (result.length === 0) {
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

router.get('/getTopTowns', async (req, res) => {
    console.log('GET /town/getTopTowns')
    try {
        var result = await pool.query("SELECT * FROM searches GROUP BY id_town ORDER BY COUNT(*) DESC LIMIT 10;")

        if (result.length == 0) {
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

router.post('/like/:id', async (req, res) => {
    console.log('POST /town/like')
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

router.get('/getLikedTowns', async (req, res) => {
    console.log('GET /town/getLikedTowns')
    try {
        var result = await pool.query("SELECT id_town, name, image_url, likes FROM towns ORDER BY towns.likes DESC LIMIT 10;")

        if (result.length === 0) {
            res.status(200).send(result)
        } else {
            res.status(200).send(result)
        }
    } catch {
        return res.status(500).send({
            status: "No data"
        })
    }
})

router.get('/colors', async (req, res) => {
    var i = 1
    console.log(('caca' + i).red)
})

router.get('/getTown/:id', async (req, res) => {
    console.log('GET /town/getTown/', req.params.id)
    var resultSearch = await pool.query("SELECT id_town FROM searches WHERE searches.id_town = ? AND searches.date >= ?;", [req.params.id, past])

    if (resultSearch.length === 0) {
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
                town['image_url'] = resultTown[0].image_url
                town['aacc'] = resultTown[0].aacc
                town['density'] = resultTown[0].density
                town['population'] = resultTown[0].population
                town['emptied'] = resultTown[0].emptied

                if (responses[0] !== 0) {
                    for (let i = 0; i < responses[0].length; i++) {
                        try {
                            var townid = req.params.id
                            var name = responses[0][i].name
                            var location = responses[0][i].location
                            var image_url = responses[0][i].image_url
                            var sentiment = responses[0][i].sentiment
        
                            await pool.query("INSERT INTO restaurants (id_town,name,location,image_url,sentiment,date) VALUES (?,?,?,?,?,?);", [townid, name, location, image_url, sentiment, today])
                            console.log(('INSERTED RESTAURANT ' + i).green)
                        } catch {
                            console.log(('NOT INSERTED RESTAURANT ' + i).red)
                        }                       
                    }

                    town['restaurants'] = responses[0]
                } else {
                    town['restaurants'] = "No data"
                }
                
                if (responses[1] !== 0){
                    for (let i = 0; i < responses[1].length; i++) {
                        try {
                            var townid = req.params.id
                            var work = responses[1][i].work
                            var title = responses[1][i].title
                            var description = responses[1][i].description
        
                            await pool.query("INSERT INTO jobs (id_town,work,title,description,date) VALUES (?,?,?,?,?);", [townid, work, title, description, today])
                            console.log(('INSERTED JOB ' + i).green)
                        } catch {
                            console.log(('NOT INSERTED JOB ' + i).red)
                        } 
                    }

                    town['jobs'] = responses[1]
                } else {
                    town['jobs'] = "No data"
                }
                
                if (responses[2] !== 0){
                    for (let i = 0; i < responses[2].length; i++) {
                        try {
                            var townid = req.params.id
                            var title = responses[2][i].title
                            var content = responses[2][i].content

                            await pool.query("INSERT INTO news (id_town,date,content,title) VALUES (?,?,?,?);", [townid, today, content, title])
                            console.log(('INSERTED NEW ' + i).green)
                        } catch {
                            console.log(('NOT INSERTED NEW ' + i).red)
                        } 
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
            town['image'] = resultTown[0].image_url
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

module.exports = router;