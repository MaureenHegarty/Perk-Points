require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db");
const nodemailer = require("nodemailer");
const upload = require("../middlewares/upload");
const QRCode = require("qrcode");
const { PassThrough } = require("stream");

function ensureLoggedIn(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
}

router.get("/signup", (req, res) => {
  let message = "Please sign up";
  let loggedIn = false;
  res.render("signup", { message: message, loggedIn: loggedIn });
});

router.get("/qr/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const qrStream = new PassThrough();
    await QRCode.toFileStream(qrStream, id, {
      type: "png",
      width: 200,
      errorCorrectionLevel: "H",
    });
    qrStream.pipe(res);
  } catch (err) {
    console.error("Failed to return content", err);
  }
});
// this is the cafe owners route interacting with users data
router.put("/addPoints/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const pointsToAdd = 5; // number of points to add
    const sql = `UPDATE users SET points = points + $1 WHERE id = $2 RETURNING *`;
    const values = [pointsToAdd, id];

    const dbRes = await db.query(sql, values);
    const user = dbRes.rows[0];

    res
      .status(200)
      .send({ message: "Points updated successfully", user: user });
  } catch (err) {
    console.error("Failed to update points", err);
    res.status(500).send("Failed to update points");
  }
});

// ============== Redeem points from users account ==============
router.put("/redeemPoints/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const pointsToRedeem = 50; // number of points to redeem

    // Fetch the user's current points from the database
    const userRes = await db.query("SELECT points FROM users WHERE id = $1", [
      id,
    ]);

    if (userRes.rows.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const currentPoints = userRes.rows[0].points;

    // Check if the user has enough points
    if (currentPoints < pointsToRedeem) {
      return res.status(400).send({ message: "Not enough points to redeem" });
    }

    // Redeem the points
    const updatedUserRes = await db.query(
      "UPDATE users SET points = points - $1 WHERE id = $2 RETURNING *",
      [pointsToRedeem, id]
    );
    const updatedUser = updatedUserRes.rows[0];

    res
      .status(200)
      .send({ message: "Points redeemed successfully", user: updatedUser });
  } catch (err) {
    console.error("Failed to redeem points", err);
    res.status(500).send("Failed to redeem points");
  }
});

router.post("/users", (req, res) => {
  console.log(req.body);
  const sql = `INSERT INTO users (first_name, last_name, email, password_digest, dob, address, phone, bio, isOwner) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
  const values = [
    req.body.first_name,
    req.body.last_name,
    req.body.email,
    bcrypt.hashSync(req.body.password, 10),
    req.body.dob,
    req.body.address,
    req.body.phone,
    req.body.bio,
    req.body.isOwner,
  ];

  db.query(sql, values, (err, dbRes) => {
    if (err) {
      console.log(err);
      return res.render("signup", { message: "Error creating user." });
    }
    return res.redirect("/login");
  });
});

router.get("/account", ensureLoggedIn, (req, res) => {
  console.log("GET /account route called");
  let userId = req.session.userId;
  let sql = `SELECT * FROM users WHERE id = $1;`;

  db.query(sql, [userId], (err, dbRes) => {
    if (err) {
      console.log("Database query error:", err);
      res.status(500).send("Database query error");
      return;
    }

    let user = dbRes.rows[0];
    console.log("User data:", user);
    res.render("account", { user });
  });
});

// PUT Route (to handle the form submission and update the user in the database):
router.put("/account/:id", ensureLoggedIn, (req, res) => {
  console.log("PUT /account/:id route called");
  console.log("Request body:", req.body);
  let userId = req.params.id;
  let sql = `UPDATE users SET first_name = $1, last_name = $2, email = $3, address = $4, phone = $5, dob = $6, bio = $7 WHERE id = $8 RETURNING *`;
  let values = [
    req.body.first_name,
    req.body.last_name,
    req.body.email,
    req.body.address,
    req.body.phone,
    req.body.dob,
    req.body.bio,
    userId,
  ];

  db.query(sql, values, (err, dbRes) => {
    if (err) {
      console.log("Database query error:", err);
      return res.render("account", { message: "Error updating user." });
    }
    let user = dbRes.rows[0];
    if (Number(req.session.userId) !== user.id) {
      res.status(403).send("You do not have permission to edit this account");
      return;
    }

    // Add flash message
    req.flash("info", "Your account has been updated");

    res.redirect(`/account`);
  });
});

// Define a route for the redeem function
router.post("/redeem", async (req, res) => {
  // Get the user ID from the request body
  let user = req.session.userId;

  // Query the database to get the points for the customer
  const result = await pool.query("SELECT points FROM users WHERE id = $1", [
    user,
  ]);

  // Check if the points are equal to or greater than 50
  if (result.rows[0].points >= 50) {
    // Update the points to zero in the database
    await pool.query("UPDATE users SET points = 0 WHERE id = $1", [userId]);

    // Send a success message to the user
    res.send("You have redeemed your points!");
  } else {
    // Send an error message to the user
    res.send("You do not have enough points to redeem!");
  }
});

// Define a function to redeem the points
function redeem() {
  // Get the user ID from the code
  const userId = qrCode.split("-")[1];

  // Send a request to the redeem route
  fetch("/redeem", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID: userId }),
  })
    .then((response) => response.text())
    .then((data) => {
      // Display the message from the server
      document.getElementById("message").innerHTML = data;
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = router;

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
