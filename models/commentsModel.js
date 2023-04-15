const db = require("./../db/connection");

// Get comments for each article
// exports.getCommentsByArticleId = (articleId) => {
//   return db
//     .query(
//       `
//          SELECT * FROM comments
//          WHERE article_id = $1
//          ORDER BY comments.created_at DESC;
//         `,
//       [articleId]
//     )
//     .then((results) => {
//       if (results.rowCount === 0) {
//         return Promise.reject({
//           status: 404,
//           msg: "No review found",
//         });
//       }
//       const comments = results.rows;
//       return comments;
//     });
// };

exports.getCommentsByArticleId = (articleId, offset, limit) => {
  // Update the function signature to include offset and limit
  return db
    .query(
      `
         SELECT * FROM comments
         WHERE article_id = $1
         ORDER BY comments.created_at DESC
         LIMIT $2 OFFSET $3;`, // Use LIMIT and OFFSET for pagination
      [articleId, limit, offset] // Pass articleId, limit, and offset as query parameters
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

// Add comment
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

// Delete comment
exports.deleteComment = (commentId) => {
  return db
    .query(
      `
      DELETE FROM comments
      WHERE comment_id = $1
      RETURNING *;
    `,
      [commentId]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment not found",
        });
      }
      const comment = result.rows[0];
      return comment;
    });
};

// Update votes
exports.updateVotes = (newVote, commentId) => {
  return db
    .query(
      `
      UPDATE comments
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;
    `,
      [newVote, commentId]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment not found",
        });
      }
      const comment = result.rows[0];
      return comment;
    });
};
