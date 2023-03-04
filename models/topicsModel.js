const db = require("./../db/connection");

exports.getAllTopics = (next) => {
  return db
    .query(
      `
            SELECT * FROM topics;
        `
    )
    .then((results) => {
      const topics = results.rows;
      return topics;
    })
    .catch((error) => {
      return { error: "Unable to retrieve topics from the database" };
    });
};
