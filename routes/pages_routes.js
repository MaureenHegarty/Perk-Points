const express = require('express')
const router = express.Router()
const db = require('../db')



router.get('/', (req, res) => {
    console.log(req.session.userId)
    db.query('SELECT * FROM coffees order by coffee_name;', (err, dbRes) => {
        let coffees = dbRes.rows
        res.render('home', { coffees: coffees})
    })
})

router.get('/locations', (req, res) => {
    res.render('locations')
})

module.exports = router