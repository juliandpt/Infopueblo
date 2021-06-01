const express = require('express')
const spawn = require('child_process').spawn
const colors = require("colors")

const router = express.Router()
const pool = require('../database/database')
const middleware = require('../controllers/middleware')

const d = new Date()
const today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
const past = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() - 7)

router.get('/getTowns', async function(req, res) {
    console.log('GET /town/getTowns')

    try {
        var result = await pool.query("SELECT id_town, name FROM towns;")

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

router.get('/getTopWeekTowns', async (req, res) => {
    console.log('GET /town/getTopWeekTowns')

    try {
        var result = await pool.query("SELECT searches.id_town, name, image_url FROM searches, towns WHERE searches.id_town = towns.id_town AND searches.date >= ? GROUP BY id_town ORDER BY COUNT(*) DESC LIMIT 10;", [past])

        if (result.length === 0) {
            console.log('BAD RESPONSE'.red)
            res.status(500).send({
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

router.get('/getTopTowns', async (req, res) => {
    console.log('GET /town/getTopTowns')

    try {
        var result = await pool.query("SELECT searches.id_town, name, date FROM searches, towns WHERE searches.id_town = towns.id_town GROUP BY id_town ORDER BY COUNT(*) DESC")

        if (result.length === 0) {
            console.log('BAD RESPONSE: Database returned no records'.red)
            res.status(500).send({
                status: "ko"
            })
        } else {
            console.log('GOOD RESPONSE'.green)
            return res.status(200).send(result)
        }
    } catch(error) {
        console.log(`BAD RESPONSE: ${error.message}`.red)
        return res.status(500).send({
            status: "ko"
        })
    }
})

router.post('/like/:id', async (req, res) => {
    console.log('POST /town/like')

    var result = await pool.query("UPDATE towns SET likes = likes+1 WHERE towns.id_town = ?;", [req.params.id])

    if (result.affectedRows !== 0) {
        console.log('GOOD RESPONSE'.green)
        res.status(200).send({
            status: "ok"
        })
    } else  {
        console.log('BAD RESPONSE'.red)
        res.status(400).send({
            status: "ko"
        })
    }
})

router.get('/getLikedTowns', async (req, res) => {
    console.log('GET /town/getLikedTowns')

    try {
        var result = await pool.query("SELECT id_town, name, image_url, likes FROM towns ORDER BY towns.likes DESC LIMIT 10;")

        if (result.length === 0) {
            console.log('BAD RESPONSE'.red)
            return res.status(500).send({
                status: "ko"
            })
        } else {
            console.log('GOOD RESPONSE'.green)
            res.status(200).send(result)
        }
    } catch {
        console.log('BAD RESPONSE'.red)
        return res.status(500).send({
            status: "ko"
        })
    }
})

router.get('/getTown/:id', async (req, res) => {
    console.log('GET /town/getTown/', req.params.id)

    if (await middleware.existsTown(req.params.id) === false) {
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
                    town['restaurants'] = []
                }

                town['topRestaurants'] = await pool.query("SELECT name, location, image_url, sentiment FROM restaurants WHERE restaurants.id_town = ? ORDER BY restaurants.sentiment DESC LIMIT 6;", [req.params.id])

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
                    town['jobs'] = []
                }
                
                if (responses[2] !== 0){
                    for (let i = 0; i < responses[2].length; i++) {
                        try {
                            var townid = req.params.id
                            var title = responses[2][i].title
                            var content = responses[2][i].content
                            var emptied = ""

                            const child = spawn('python',  ['./MLModel/sorter.py', responses[2][i].content])
                            child.stdout.on('data', (data) => {
                                var jsonContent = JSON.parse(data);
                                emptied = jsonContent.predict
                            });
                            child.on("error", (error) => {
                                emptied = "0"
                                console.log(error)
                            })

                            await pool.query("INSERT INTO news (id_town,date,content,title,emptied) VALUES (?,?,?,?,?);", [townid, today, content, title, emptied])
                            pool.query("select poblation from towns where id_town = ?;", [townid])
                            console.log(('INSERTED NEW ' + i).green)
                        } catch {
                            console.log(('NOT INSERTED NEW ' + i).red)
                        } 
                    }
                }
                
                console.log('GOOD RESPONSE'.green)
                return res.status(200).send(town)
            } catch {
                console.log('BAD RESPONSE'.red)
                return res.status(500).send({
                    status: "ko"
                })
            }            
        } else {
            console.log('BAD RESPONSE'.red)
            return res.status(500).send({
                status: "ko"
            })
        }
    } else {
        await pool.query("INSERT INTO searches (id_town, date) VALUES (?,?);", [req.params.id, today])

        try {
            var resultTown = await pool.query("SELECT * FROM towns WHERE towns.id_town = ?;", [req.params.id])
            var resultRetsaurants = await pool.query("SELECT name, location, image_url, sentiment FROM restaurants WHERE id_town = ? AND date >= ?;", [req.params.id, past])
            var resultJobs = await pool.query("SELECT work, title, description FROM jobs WHERE id_town = ? AND date >= ?;", [req.params.id, past])

            town = {}
            town['name'] = resultTown[0].name
            town['region'] = resultTown[0].region
            town['province'] = resultTown[0].province
            town['image_url'] = resultTown[0].image_url
            town['aacc'] = resultTown[0].aacc
            town['density'] = resultTown[0].density
            town['population'] = resultTown[0].population
            town['emptied'] = resultTown[0].emptied

            if (resultRetsaurants.length === 0) {
                town['restaurants'] = []
            } else {
                town['restaurants'] = resultRetsaurants
            }
            
            town['topRestaurants'] = await pool.query("SELECT name, location, image_url, sentiment FROM restaurants WHERE id_town = ? AND date >= ? ORDER BY sentiment DESC LIMIT 6;", [req.params.id, past])
            
            if (resultRetsaurants.length === 0) {
                town['jobs'] = []
            } else {
                town['jobs'] = resultJobs
            }

            console.log('GOOD RESPONSE'.green)
            return res.status(200).send(town)
        } catch {
            console.log('BAD RESPONSE'.red)
            return res.status(404).send({
                status: "ko"
            })
        }
    }
})

module.exports = router;