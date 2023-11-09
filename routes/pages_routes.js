const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  console.log(req.session.userId);
  db.query("SELECT * FROM coffees order by coffee_name;", (err, dbRes) => {
    let coffees = dbRes.rows;
    console.log(err);
    res.render("home", { coffees: coffees });
  });
});

router.get("/locations", (req, res) => {
  res.render("locations");
});
router.get("/boost", function (req, res) {
  res.render("boost");
});
router.get("/shop", function (req, res) {
  res.render("shop");
});
router.get("/enjoy", (req, res) => {
  //   console.log(req.session.userId);
  db.query("SELECT * FROM coffees order by coffee_name;", (err, dbRes) => {
    let coffees = dbRes.rows;
    console.log(err);
    res.render("enjoy", { coffees: coffees });
  });
});
router.get("/blog", function (req, res) {
  res.render("blog");
});
router.get("/christmas", function (req, res) {
  res.render("christmas");
});

module.exports = router;
