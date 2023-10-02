const express = require('express')
const router = express.Router()
const db = require('../db')

router.post('/', (req, res) => {
    // create a comment by inserting it into db

    const sql = `
    INSERT INTO comments
    (content, coffee_id, user_id)
    VALUES ($1, $2, $3);
    `
    const values = [
        req.body.content, 
        req.body.coffee_id,
        req.session.userId

    ]

// asynch function
        db.query(sql, values, function(err, dbRes){
            if (err) {
                console.log(err);
            }
            res.redirect(`/coffees/${req.body.coffee_id}`)
        })
})




module.exports = router