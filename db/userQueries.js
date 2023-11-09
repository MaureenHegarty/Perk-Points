const bcrypt = require("bcrypt");
const db = require("./index.js");

async function findUserByEmailAndPassword(email, password) {
  try {
    // Query the database for a user with the provided email
    const sql = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    const result = await db.query(sql, values);

    // If a user is found and the password is correct, return the user object
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(
        password,
        user.password_digest
      );

      if (passwordMatch) {
        return user;
      }
    }

    return null;
  } catch (err) {
    console.error("Failed to find user by email and password", err);
    return null;
  }
}

module.exports = findUserByEmailAndPassword;
