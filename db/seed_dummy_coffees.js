const pg = require('pg')
const db = new pg.Pool({
    database: 'coffee_card'
})

let coffees = ["Long Black", "Latte", "Cappuccino", "Iced Coffee", "Flat White", "Americano"];
let user_id = 1
let selectedCoffees = []

const sql = `
    INSERT INTO coffees (user_id, coffee_name, image_url)
    VALUES ($1, $2, $3);
`

for (let i = 0; i < 4; i++) {
  let coffeeIndex = Math.floor(Math.random() * coffees.length);
  let coffee = coffees[coffeeIndex];
  
  let image = "https://media.istockphoto.com/id/505168330/photo/cup-of-cafe-latte-with-coffee-beans-and-cinnamon-sticks.jpg?s=612x612&w=0&k=20&c=h7v8kAfWOpRapv6hrDwmmB54DqrGQWxlhP_mTeqTQPA="; 

  db.query(sql, [user_id, coffee, image], (err, dbRes) => {
    if (err)  {
        console.log(err);
    } else {
        selectedCoffees.push(coffee);

        console.log(selectedCoffees);

        
    }
  });
}
