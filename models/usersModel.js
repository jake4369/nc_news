const db = require("./../db/connection");

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
