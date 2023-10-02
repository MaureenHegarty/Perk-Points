const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const db = require('../db')
const nodemailer = require('nodemailer');

router.get('/signup', (req, res) => {
    let message = 'Please sign up';
    let loggedIn = false;
    res.render('signup', { message: message, loggedIn: loggedIn });
})

router.post('/users', (req, res) => {
    console.log(req.body);
    const sql = `INSERT INTO users (name, email, password_digest) VALUES ($1, $2, $3) RETURNING name`;
    const values = [req.body.name,req.body.email, bcrypt.hashSync(req.body.password, 10)];

    db.query(sql, values, (err, dbRes) => {
        if (err) {
            console.log(err);
            return res.render('signup', { message: 'Error creating user.' });
        }
        const userName = dbRes.rows[0].name;
        console.log(`User ${userName} created.`);
        
        return res.redirect('/login')
    })
})

router.post('/forgot-password', (req, res) => {
    console.log(yay)
    const { email } = req.body;
    // Generate a random token
    const token = crypto.randomBytes(20).toString('hex');

    // Store the token in database associated with the user's email
    const sql = `UPDATE users SET reset_password_token = $1 WHERE email = $2`;
    const values = [token, email];

    db.query(sql, values, async (err, dbRes) => {
        if (err) {
            console.log(err);
            return res.render('forgot-password', { message: 'Error processing request.' });
        }

        // Set up Nodemailer
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Set up email data
        let mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\nhttp://perkpoints.com/reset-password?token=${token}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        // Send the email
        let info = await transporter.sendMail(mailOptions);

        return res.redirect('/login');
    });
});

router.get('/forgot-password', (req, res) => {
    let message = 'Please enter your email to reset your password';
    let loggedIn = false;
    res.render('forgot_password', { message: message, loggedIn: loggedIn });
}); 




module.exports = router