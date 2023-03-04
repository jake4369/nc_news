const db = require("./../db/connection");

exports.getAllArticles = () => {
  return db
    .query(
      `
        SELECT articles.*, CAST(COUNT(comments.article_id) AS INT) AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC;
    `
    )
    .then((results) => {
      const articles = results.rows;
      return articles;
    })
    .catch((error) => {
      return { error: "Unable to retrieve articles from the database" };
    });
};

exports.getArticle = (articleId) => {
  return db
    .query(
      `
      SELECT * FROM articles
      WHERE article_id = $1;
    `,
      [articleId]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "No article found",
        });
      }
      const article = result.rows[0];
      return article;
    });
};

exports.updateArticle = (articleId, incVotes) => {
  return db
    .query(
      `
      UPDATE articles
      SET votes = votes + $2
      WHERE article_id = $1
      RETURNING *;
    `,
      [articleId, incVotes]
    )
    .then((results) => {
      if (results.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "No article found",
        });
      }

      const article = results.rows[0];
      return article;
    });
};
