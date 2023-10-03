const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const db = require('../db')
const nodemailer = require('nodemailer');
const upload = require('../middlewares/upload')



function ensureLoggedIn(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}


router.get('/signup', (req, res) => {
    let message = 'Please sign up';
    let loggedIn = false;
    res.render('signup', { message: message, loggedIn: loggedIn });
})

router.post('/users', (req, res) => {
    console.log(req.body);
    const sql = `INSERT INTO users (first_name, last_name, email, password_digest, dob, address, phone, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    const values = [req.body.first_name, req.body.last_name, req.body.email, bcrypt.hashSync(req.body.password, 10), req.body.dob, req.body.address, req.body.phone, req.body.bio];

    db.query(sql, values, (err, dbRes) => {
        if (err) {
            console.log(err);
            return res.render('signup', { message: 'Error creating user.' });
        }

        return res.redirect('/login')
    })
})






// router.post('/forgot-password', (req, res) => {
//     console.log(yay)
//     const { email } = req.body;
//     // Generate a random token
//     const token = crypto.randomBytes(20).toString('hex');

//     // Store the token in database associated with the user's email
//     const sql = `UPDATE users SET reset_password_token = $1 WHERE email = $2`;
//     const values = [token, email];

//     db.query(sql, values, async (err, dbRes) => {
//         if (err) {
//             console.log(err);
//             return res.render('forgot-password', { message: 'Error processing request.' });
//         }

//         // Set up Nodemailer
//         let transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USERNAME,
//                 pass: process.env.EMAIL_PASSWORD
//             }
//         });

//         // Set up email data
//         let mailOptions = {
//             from: process.env.EMAIL_USERNAME,
//             to: email,
//             subject: 'Password Reset',
//             text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\nhttp://perkpoints.com/reset-password?token=${token}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
//         };

//         // Send the email
//         let info = await transporter.sendMail(mailOptions);

//         return res.redirect('/login');
//     });
// });

// router.get('/forgot-password', (req, res) => {
//     let message = 'Please enter your email to reset your password';
//     let loggedIn = false;
//     res.render('forgot_password', { message: message, loggedIn: loggedIn });
// }); 


// GET route to display 'account' form with prepopulated user data
router.get('/account', ensureLoggedIn, (req, res) => {
    console.log('GET /account route called');
    let userId = req.session.userId;
    let sql = `SELECT * FROM users WHERE id = $1;`;

    db.query(sql, [userId], (err, dbRes) => {
        if (err)  {
            console.log('Database query error:', err);
            res.status(500).send('Database query error');
            return;
        }

        let user = dbRes.rows[0];
        console.log('User data:', user);
        res.render('account', { user });
    });
});



// PUT Route (to handle the form submission and update the user in the database):
router.put('/account/:id', ensureLoggedIn, (req, res) => {
    console.log('PUT /account/:id route called');
    console.log('Request body:', req.body);
    let userId = req.params.id;
    let sql = `UPDATE users SET first_name = $1, last_name = $2, email = $3, address = $4, phone = $5, dob = $6, bio = $7 WHERE id = $8 RETURNING *`;
    let values = [req.body.first_name, req.body.last_name, req.body.email, req.body.address, req.body.phone, req.body.dob, req.body.bio, userId];

    db.query(sql, values, (err, dbRes) => {
        if (err) {
            console.log('Database query error:', err);
            return res.render('account', { message: 'Error updating user.' });
        }
        let user = dbRes.rows[0];
        if (Number(req.session.userId) !== user.id) {
            res.status(403).send('You do not have permission to edit this account');
            return;
        }

        // Add flash message
        req.flash('info', 'Your account has been updated');

        res.redirect(`/account`);
    });
});





module.exports = router