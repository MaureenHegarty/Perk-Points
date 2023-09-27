CREATE DATABASE coffee_card;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password_digest TEXT NOT NULL
);

CREATE TABLE coffees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    coffee_name TEXT NOT NULL,
    image_url TEXT,
    location TEXT
);

CREATE TABLE points (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date_collected TIMESTAMP NOT NULL
);

CREATE TABLE points_used (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    points_id INTEGER REFERENCES points(id),
    date_used TIMESTAMP NOT NULL
);


User routes:

GET /register: Display the registration form.
POST /register: Create a new user.
GET /login: Display the login form.
POST /login: Log in a user.
DELETE /logout: Log out a user.
Coffee Shop routes:

GET /coffee-shops/new: Display the form to create a new coffee shop.
POST /coffee-shops: Create a new coffee shop.
GET /coffee-shops/:id: Display a specific coffee shop.
Loyalty Card routes:

GET /loyalty-cards/new: Display the form to create a new loyalty card.
POST /loyalty-cards: Create a new loyalty card.
GET /loyalty-cards/:id: Display a specific loyalty card.
POST /loyalty-cards/:id/add-coffee: Add a coffee to a loyalty card.

possible .ejs files


register.ejs: The registration form.
login.ejs: The login form.
home.ejs: The home page, which could display a list of all coffee shops.
coffee-shop-show.ejs: A page to display a specific coffee shop and its associated loyalty cards.
loyalty-card-show.ejs: A page to display a specific loyalty card and its details.

