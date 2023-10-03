const express = require('express')
const router = express.Router()
const db = require('../db')
const ensureLoggedIn = require('../middlewares/ensure_logged_in')
const upload = require('../middlewares/upload')


router.get('/form', (req, res) => {
    res.render('form')
})


router.post('/upload', upload.single('uploadfile'), (req, res) => {
    console.log(req.file.path)
    let coffee_name = req.body.coffee_name;
    const sql = `INSERT INTO coffees (user_id, coffee_name, image_url) VALUES ($1, $2, $3)
    RETURNING *;
    `
    
    db.query(sql, [req.session.userId, coffee_name, req.file.path, location], (err, dbRes) => {
        if (err) {
            console.log(err);
        }
    res.send('yay')
})
})


router.get('/new', ensureLoggedIn, (req, res) => {
        res.render('new_form')
})

router.post('/', ensureLoggedIn, (req, res) => {
    let coffee_name = req.body.title;
    let imageUrl = req.body.image_url;
    let location = req.body.location;

    const sql = `INSERT INTO coffees (user_id, coffee_name, image_url, location) VALUES ($1, $2, $3, $4)
    RETURNING *;
    `
    
    db.query(sql, [req.session.userId, coffee_name, imageUrl, location], (err, dbRes) => {
        if (err) {
            console.log(err);
        }

        res.redirect('/')
    })
})

// should the delete button be hidden?
router.delete('/:id', ensureLoggedIn, (req, res) => {
    const sql = 'SELECT * FROM coffees WHERE id = $1';
    db.query(sql, [req.params.id], (err, dbRes) => {
        if (err) {
            console.log(err);
            return res.status(500).send('An error occurred');
        }

        const coffee = dbRes.rows[0];
        if(req.session.userId === coffee.user_id) {
            // User is authorized to delete the coffee
            const deleteSql = 'DELETE FROM coffees WHERE id = $1';
            db.query(deleteSql, [req.params.id], (deleteErr, deleteRes) => {
                if (deleteErr) {
                    console.log(deleteErr);
                    return res.status(500).send('An error occurred while deleting the coffee');
                }

                // Coffee has been deleted successfully
                res.redirect('/');
            });
        } else {
            res.send('You must be logged in as the member who posted this coffee in order to delete it.');
        }
    });
});



router.get('/coffees/account', ensureLoggedIn, (req, res) => {
    console.log([req.session.userId]);

    const sql = `SELECT * FROM users WHERE id = $1`
    const values = [req.session.userId]
    db.query(sql, values, (err, dbRes) => {
        if (err) {
            console.log(err);
            return;
        }

        let user = dbRes.rows[0]
        res.render('account', { userId: req.session.userId });
        console.log([user])
    })
})


router.get('/:id',ensureLoggedIn, (req, res) => {
    const sql = `SELECT * FROM coffees WHERE id = $1`
    const values = [req.params.id]

    db.query(sql, values, (err, dbRes) => {
        if (err) {
            console.log(err);
            return;
        }

        let coffee = dbRes.rows[0]

        // Query to get comments
        const commentSql = `
            SELECT comments.content, users.name 
            FROM comments
            JOIN users ON comments.user_id = users.id
            WHERE coffee_id = $1
        `;
        db.query(commentSql, values, (err, dbResComments) => {
            if (err) {
                console.log(err);
                return;
            }

            let comments = dbResComments.rows
            let loggedIn = req.session.userId ? true : false;
            res.render('show', { coffee, comments, loggedIn })
        })
    })
})


router.post('/comments', ensureLoggedIn, (req, res) => {
    const sql = `INSERT INTO comments (content, coffee_id, user_id) VALUES ($1, $2, $3) RETURNING *;`
    const values = [req.body.content, req.body.coffee_id, req.session.userId]

    db.query(sql, values, (err, dbRes) => {
        if (err) {
            console.log(err);
            return;
        }

        const sqlUser = `SELECT first_name, last_name FROM users WHERE id = $1;`
        db.query(sqlUser, [req.session.userId], (errUser, dbResUser) => {
            if (errUser) {
                console.log(errUser);
                return;
            }

            res.locals.user = dbResUser.rows[0];
            res.redirect(`/coffees/${req.body.coffee_id}`) 
        });
    })
})




router.get('/:id/edit', ensureLoggedIn, (req, res) => {

    let coffeeId = req.params.id
    let sql = `SELECT * FROM coffees WHERE id = $1;`

    db.query(sql, [coffeeId], (err, dbRes) => {
        if (err)  {
            console.log (err);
            res.status(500).send('Database query error');
            return;
        }

        let coffee = dbRes.rows[0]
        if (Number(req.session.userId) !== coffee.user_id) {
            res.status(403).send('You do not have permission to edit this post');
            return;
        }

        res.render('edit_form', { coffee })
    })
})

   
    


router.put('/:id', ensureLoggedIn, (req, res) => {
    const sql = `
    UPDATE coffees
    SET coffee_name = $1, image_url = $2
    WHERE id = $3;
  `

  const values = [req.body.coffee_name, req.body.image_url, req.params.id]


  db.query(sql, values, (err, dbRes) => {
    if (err) {
      console.log(err);
    }

    res.redirect(`/coffees/${req.params.id}`) 

})
})





module.exports = router