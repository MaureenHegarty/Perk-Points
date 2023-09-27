const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const db = require('../db')

router.get('/signup', (req, res) => {
    let message = 'Please sign up';
    let loggedIn = false;
    res.render('signup', { message: message, loggedIn: loggedIn });
})

router.post('/users', (req, res) => {
    console.log(req.body);
    const sql = `INSERT INTO users (email, password_digest) VALUES ($1, $2)`;
    const values = [req.body.email, bcrypt.hashSync(req.body.password, 10)];

    db.query(sql, values, (err, dbRes) => {
        if (err) {
            console.log(err);
            return res.render('signup', { message: 'Error creating user.' });
        }

        
        return res.redirect('/login')
    })
})

module.exports = router