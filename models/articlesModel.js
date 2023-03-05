const db = require("./../db/connection");

exports.getAllArticles = (
  topic = null,
  sort_by = "created_at",
  order = "desc"
) => {
  const allowedColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];

  const allowedOrders = ["asc", "desc"];

  if (!allowedColumns.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid sort query",
    });
  }
  if (!allowedOrders.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid order query",
    });
  }

  const queryValues = [];
  let queryStr = `
  SELECT articles.*, CAST(COUNT(comments.article_id) AS INT) AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  `;

  if (topic) {
    queryStr += ` WHERE topic ILIKE $1`;
    queryValues.push(`%${topic}%`);
  }

  queryStr += `
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}
  `;

  return db
    .query(queryStr, queryValues)
    .then((results) => {
      const articles = results.rows;
      if (topic && articles.length === 0) {
        return [];
      } else {
        return articles;
      }
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
