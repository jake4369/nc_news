const express = require("express");
const app = express();

app.use(express.json());

const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./controllers/errorHandlingController");
const topicsController = require("./controllers/topicsController");
const articlesController = require("./controllers/articlesController");
const commentsController = require("./controllers/commentsController");
const usersController = require("./controllers/usersController");

// 3. GET /api/topics
app.get("/api/topics", topicsController.getAllTopics);

// 4. GET /api/articles
app.get("/api/articles", articlesController.getAllArticles);

// 5. GET /api/articles/:article_id
app.get("/api/articles/:articleId", articlesController.getArticle);

// 6. GET /api/articles/:article_id/comments
app.get(
  "/api/articles/:articleId/comments",
  commentsController.getCommentsByArticleId
);

// 7. POST /api/articles/:article_id/comments
app.post(
  "/api/articles/:articleId/comments",
  commentsController.addCommentToArticle
);

// 8. PATCH /api/articles/:article_id
app.patch("/api/articles/:articleId", articlesController.updateArticle);

// 9. GET /api/users
app.get("/api/users", usersController.getAllUsers);

// 12. DELETE /api/comments/:comment_id
app.delete("/api/comments/:commentId", commentsController.deleteComment);

app.all("*", (req, res) => {
  res.status(400).send({ message: "Path not found!" });
});

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);
module.exports = app;
