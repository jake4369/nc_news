const db = require("./../db/connection");

exports.getCommentsByArticleId = (articleId) => {
  return db
    .query(
      `
         SELECT * FROM comments
         WHERE article_id = $1
         ORDER BY comments.created_at DESC;
        `,
      [articleId]
    )
    .then((results) => {
      if (results.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "No review found",
        });
      }
      const comments = results.rows;
      return comments;
    });
};

exports.addCommentToArticle = (articleId, username, body) => {
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "Comment must have an author and body",
    });
  }
  return db
    .query(
      `
            INSERT INTO comments
                (article_id, author, body)
            VALUES
                ($1, $2, $3)
            RETURNING *;
        `,
      [articleId, username, body]
    )
    .then((result) => {
      const comment = result.rows[0];
      return comment;
    })
    .catch((error) => {
      if (
        error.code === "23503" &&
        error.constraint === "comments_author_fkey"
      ) {
        return Promise.reject({
          status: 400,
          msg: "Username is incorrect",
        });
      } else if (
        error.code === "23503" &&
        error.constraint === "comments_article_id_fkey"
      ) {
        return Promise.reject({
          status: 404,
          msg: "No review found",
        });
      } else {
        return Promise.reject(error);
      }
    });
};
