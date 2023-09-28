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
    const sql = `INSERT INTO coffees (user_id, coffee_name, image_url,) VALUES ($1, $2, $3)
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

    if(req.session.userId === coffee.user_id) {
        res.send.message('you must be logged in')
    }

    const sql = `DELETE FROM coffees WHERE id = ${req.params.id};`
    db.query(sql, (err, dbRes) => {
        if (err) {
            console.log(err);
            return;
        }
        res.redirect('/')
    })
})




router.get('/:id', (req, res) => {
    const sql = `SELECT * FROM coffees WHERE id = $1`
    const values = [req.params.id]

       
    db.query(sql, values, (err, dbRes) => {
        if (err) {
            console.log(err);
            return;
        }

        let coffee = dbRes.rows[0]
        res.render('show', { coffee })
        console.log([coffee])
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
        if (req.session.userId !== coffee.user_id) {
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