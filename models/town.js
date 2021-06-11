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

router.get('/getSearchedTowns', async function(req, res) {
    console.log('GET /town/getSearchedTowns')

    try {
        var result = await pool.query("SELECT date, count(*) as searches FROM searches WHERE searches.date >= ? GROUP BY date LIMIT 10;", [past])

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

router.get('/getTopLimitedTowns', async (req, res) => {
    console.log('GET /town/getTopTowns')

    try {
        var result = await pool.query("SELECT name, towns.id_town AS id_town FROM searches, towns WHERE searches.id_town = towns.id_town GROUP BY id_town ORDER BY COUNT(*) DESC LIMIT 10")

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

router.post('/like/:id', middleware.verifyToken, middleware.existsLike, async (req, res) => {
    console.log('POST /town/like')

    var result = await pool.query("INSERT INTO likes (id_town, id_user) VALUES (?, ?)", [req.params.id, req. sub])

    if (result.affectedRows !== 0) {
        console.log('GOOD RESPONSE'.green)
        res.status(200).send({
            status: "ok"
        })
    } else  {
        console.log('BAD RESPONSE'.red)
        res.status(500).send({
            status: "ko"
        })
    }
})

router.post('/dislike/:id', middleware.verifyToken, async (req, res) => {
    console.log('POST /town/dislike')

    var result = await pool.query("DELETE FROM likes WHERE id_town = ? AND id_user = ?", [req.params.id, req.sub])

    if (result.affectedRows !== 0) {
        console.log('GOOD RESPONSE'.green)
        res.status(200).send({
            status: "ok"
        })
    } else  {
        console.log('BAD RESPONSE'.red)
        res.status(500).send({
            status: "ko"
        })
    }
})

router.get('/getLikedTowns', async (req, res) => {
    console.log('GET /town/getLikedTowns')

    try {
        var result = await pool.query("SELECT likes.id_town, name, image_url FROM likes, towns WHERE likes.id_town = towns.id_town GROUP BY id_town ORDER BY COUNT(*) DESC;")

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

router.get('/getUserLikedTown/:id', middleware.verifyToken, async (req, res) => {
    console.log('GET /town/getUserLikedTown')

    try {
        var result = await pool.query("SELECT id_town FROM likes WHERE id_town = ? AND likes.id_user = ?;", [req.params.id, req.sub])

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

router.get('/getUserLikedTowns', middleware.verifyToken, async (req, res) => {
    console.log('GET /town/getUserLikedTowns')

    try {
        var result = await pool.query("SELECT likes.id_town, towns.name, towns.image_url FROM likes, towns WHERE likes.id_town = towns.id_town AND likes.id_user = ?;", [req.sub])

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

router.get('/getUserSearchedTowns', middleware.verifyToken, async (req, res) => {
    console.log('GET /town/getUserSearchedTowns')

    try {
        var result = await pool.query("SELECT DISTINCT searches.id_town, towns.name, towns.image_url FROM searches, towns WHERE searches.id_town = towns.id_town AND searches.id_user = ?;", [req.sub])

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

router.get('/getUserMostSearchedTowns', middleware.verifyToken, async (req, res) => {
    console.log('GET /town/getUserMostSearchedTowns')

    try {
        var result = await pool.query("SELECT COUNT( s.id_town ) AS total, t.* FROM searches as s inner join towns as t on s.id_town = t.id_town where id_user = ? GROUP BY s.id_town ORDER BY total DESC limit 10", [req.sub])

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

router.get('/getDailyChallenge', middleware.verifyToken, async (req, res) => {
    console.log('GET /town/getDailyChallenge')

    try {
        var result = await pool.query("select count(distinct id_town) as total from searches where date = ? and id_user = ? ", [today, req.sub])

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

router.get('/getTotalSearchedTowns', middleware.verifyToken, async (req, res) => {
    console.log('GET /town/getTotalSearchedTowns')

    try {
        var result = await pool.query("select count(distinct id_town) as total from searches where id_user = ? ", [req.sub])

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

router.get('/getTotalSearches', middleware.verifyToken, async (req, res) => {
    console.log('GET /town/getTotalSearches')

    try {
        var result = await pool.query("select count(distinct id_town) as total from searches")

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

router.get('/getUserMostRecentTowns', middleware.verifyToken, async (req, res) => {
    console.log('GET /town/getUserMostRecentTowns')

    try {
        var result = await pool.query("select s.id_search, t.* from searches as s inner join towns as t on s.id_town = t.id_town where id_user = ? order by id_search desc limit 10", [req.sub])

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

router.get('/getTown/:id', middleware.verifySearchToken, async (req, res) => {
    console.log('GET /town/getTown/', req.params.id)

    if (await middleware.existsTown(req.params.id) === false) {
        await pool.query("INSERT INTO searches (id_town, date, id_user) VALUES (?,?,?);", [req.params.id, today, req.sub])
        var resultTown = await pool.query("SELECT * FROM towns WHERE towns.id_town = ?;", [req.params.id])

        if (resultTown != 0) {
            try {
                console.log('CREATING PROMISES...'.yellow)
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
                console.log('CREATED PROMISES'.green)

                town = {}
                town['id_town'] = resultTown[0].id_town
                town['name'] = resultTown[0].name
                town['region'] = resultTown[0].region
                town['province'] = resultTown[0].province
                town['image_url'] = resultTown[0].image_url
                town['aacc'] = resultTown[0].aacc
                town['density'] = resultTown[0].density
                town['population'] = resultTown[0].population
                town['latitude'] = resultTown[0].latitude
                town['longitude'] = resultTown[0].longitude



                if (responses[0] !== 0) {
                    console.log('INSERTING RESTAURANTS...'.yellow)
                    for (let i = 0; i < responses[0].length; i++) {
                        try {
                            await pool.query("INSERT INTO restaurants (id_town,name,location,image_url,sentiment,date) VALUES (?,?,?,?,?,?);", [req.params.id, responses[0][i].name, responses[0][i].location, responses[0][i].image_url, responses[0][i].sentiment, today])
                            console.log(('INSERTED RESTAURANT ' + i).green)
                        } catch {
                            console.log(('NOT INSERTED RESTAURANT ' + i).red)
                        }                       
                    }

                    town['restaurants'] = responses[0]
                } else {
                    town['restaurants'] = []
                }

                town['topRestaurants'] = await pool.query("SELECT name, location, image_url, if (sentiment<-0.8,'pesimo',if(sentiment<-0.6, 'muy malo', if(sentiment<-0.2, 'malo', if (sentiment<0.2, 'medio', if (sentiment<0.6, 'bueno', if (sentiment<0.8, 'muy bueno', 'excelente')))))) AS sentiment FROM restaurants WHERE restaurants.id_town = ? ORDER BY restaurants.sentiment DESC LIMIT 6;", [req.params.id])

                if (responses[1] !== 0){
                    console.log('INSERTING JOBS...'.yellow)
                    for (let i = 0; i < responses[1].length; i++) {
                        try {
                            await pool.query("INSERT INTO jobs (id_town,work,title,description,date) VALUES (?,?,?,?,?);", [req.params.id, responses[1][i].work, responses[1][i].title, responses[1][i].description, today])
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
                    var classification = []
                    classification[0] = 0
                    classification[1] = 0
                    console.log('INSERTING NEWS...'.yellow)
        
                    for (let i = 0; i < responses[0].length; i++) {
                        try {
                            let promiseNews = new Promise((resolve, reject) => {
                                const child = spawn('python',  ['./MLModel/sorter.py', responses[2][i].content])
                                child.stdout.on('data', (data) => {
                                    var jsonContent = JSON.parse(data)
                                    classification[parseInt(jsonContent.predict)] += 1
                                    resolve(parseInt(jsonContent.predict))
                                });
                                child.on("error", (error) => {
                                    reject(error)
                                })
                            })
        
                            var emptied = await Promise.all([promiseNews])
        
                            await pool.query("INSERT INTO news (id_town,title,content,date,emptied) VALUES (?,?,?,?,?);", [req.params.id, responses[2][i].title, responses[2][i].content, today, emptied[0]])
                            console.log(('INSERTED NEW ' + i).green)
                        } catch {
                            console.log(('NOT INSERTED NEW ' + i).red)
                        } 
                    }
        
                    await pool.query("UPDATE towns SET emptied = ? WHERE id_town = ?", [classification[0] > classification[1], req.params.id])
    
                    town['emptied'] = classification[0] > classification[1]
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

        await pool.query("INSERT INTO searches (id_town, date, id_user) VALUES (?,?,?);", [req.params.id, today, req.sub])
        await pool.query("UPDATE restaurants SET date = ? WHERE id_town = ?", [today, req.params.id])
        await pool.query("UPDATE jobs SET date = ? WHERE id_town = ?", [today, req.params.id])

        try {
            var resultTown = await pool.query("SELECT * FROM towns WHERE towns.id_town = ?;", [req.params.id])
            var resultRetsaurants = await pool.query("SELECT name, location, image_url, sentiment FROM restaurants WHERE id_town = ? AND date >= ?;", [req.params.id, past])
            var resultJobs = await pool.query("SELECT work, title, description FROM jobs WHERE id_town = ? AND date >= ?;", [req.params.id, past])

            town = {}
            town['id_town'] = resultTown[0].id_town
            town['name'] = resultTown[0].name
            town['region'] = resultTown[0].region
            town['province'] = resultTown[0].province
            town['image_url'] = resultTown[0].image_url
            town['aacc'] = resultTown[0].aacc
            town['density'] = resultTown[0].density
            town['population'] = resultTown[0].population
            town['latitude'] = resultTown[0].latitude
            town['longitude'] = resultTown[0].longitude

            if (resultTown[0].emptied == 0) {
                town['emptied'] = "No"
            } else {
                town['emptied'] = "Sí"
            }

            if (resultRetsaurants.length === 0) {
                town['restaurants'] = []
            } else {
                town['restaurants'] = resultRetsaurants
            }
            
            town['topRestaurants'] = await pool.query("SELECT name, location, image_url, if (sentiment<-0.8,'pesimo',if(sentiment<-0.6, 'muy malo', if(sentiment<-0.2, 'malo', if (sentiment<0.2, 'medio', if (sentiment<0.6, 'bueno', if (sentiment<0.8, 'muy bueno', 'excelente')))))) AS sentiment FROM restaurants WHERE restaurants.id_town = ? ORDER BY restaurants.sentiment DESC LIMIT 6;", [req.params.id])
            
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