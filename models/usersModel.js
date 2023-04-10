const db = require("./../db/connection");

// Get all users
exports.getAllUsers = () => {
  return db
    .query(
      `
            SELECT * FROM users;
      `
    )
    .then((results) => {
      const users = results.rows;
      return users;
    });
};

// Get user by username
exports.getUser = (username) => {
  return db
    .query(
      `
      SELECT * FROM users 
      WHERE username = $1;
    `,
      [username]
    )
    .then((results) => {
      if (results.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "No user found",
        });
      }
      const user = results.rows[0];
      return user;
    });
};
