require("dotenv").config();
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const requestLogger = require("./middlewares/request_logger.js");
const setCurrentUser = require("./middlewares/set_current_user");
const reqBodyMethodOverride = require("./middlewares/req_body_method_override");
const session = require("express-session");
const coffeesRoutes = require("./routes/coffees_routes");
const sessionsRoutes = require("./routes/sessions_routes");
const pagesRoutes = require("./routes/pages_routes");
const usersRoutes = require("./routes/users_routes");
const commentsRoutes = require("./routes/comments_routes");
const findUserByEmailAndPassword = require("./db/userQueries");
const flash = require("connect-flash");
const cloudinary = require("cloudinary").v2;

const port = process.env.PORT || 8080;

app.set("view engine", "ejs");

// ========= middlewares =========================
app.use(express.static("public"));
app.use("/node_modules", express.static("node_modules"));
app.use(express.static("/Users/maure/sei/coffee-card"));
app.use(express.urlencoded({ extended: true }));

app.use(reqBodyMethodOverride);
app.use(
  session({
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 3 },
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// ==== routes ======================================
app.use(setCurrentUser);
app.use(requestLogger);
app.use(expressLayouts);

app.use("/", pagesRoutes);
app.use("/", sessionsRoutes);
app.use("/", usersRoutes);
app.use("/coffees", coffeesRoutes);
app.use("/comments", commentsRoutes);

app.get("/owners", function (req, res) {
  res.render("owners");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
