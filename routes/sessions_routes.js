const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const db = require('../db')


router.get('/login', (req, res) => {
    let message = 'Please log in';
    let loggedIn = req.session.userId ? true : false;
    res.render('login',{ message: message, loggedIn: loggedIn });
})

router.post('/login', (req, res) => {

    sql = `
        SELECT * FROM users WHERE email = $1;

            `
    values = [req.body.email]

    db.query(sql, values, (err, dbRes) => {
        if (err) {
          console.log(err);
        }
    
        if (dbRes.rows.length === 0) {
            return res.render('login')
        }

                const userInputPassword = req.body.password 
        const hashedPasswordFromDb = dbRes.rows[0].password_digest

        bcrypt.compare(userInputPassword, hashedPasswordFromDb, (err, result) => {
           
            req.session.userId = dbRes.rows[0].id
            if (result) {
                return res.redirect('/')
            } else {
                return res.render('login')
            }
        })

})

})

router.delete('/logout', (req, res) => {
    req.session.userId = null
    res.redirect('/login')

})

module.exports = router