
require('dotenv').config()
// const pg = require('pg')
const bcrypt = require('bcrypt');
const db = require('./index.js');

const email = 'sv@gmail.co'
const password = 'pudding'
const sql = `
    INSERT INTO users (email, password_digest)
    VALUES ($1, $2)
    RETURNING *;
    
`



   

    
bcrypt
    .genSalt(10)
    .then(salt => {bcrypt.hash(password, salt)
    .then(hash => db.query(sql, [email, hash]))
    .then(result => console.log(`user create with id ${result.rows[0].id}`))
    })

