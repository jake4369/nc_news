const commentsModel = require("./../models/commentsModel.js");

exports.getCommentsByArticleId = (req, res, next) => {
  const { articleId } = req.params;

  commentsModel
    .getCommentsByArticleId(articleId)
    .then((comments) => {
      res.status(200).json({ comments });
    })
    .catch((error) => next(error));
};

exports.addCommentToArticle = (req, res, next) => {
  const { articleId } = req.params;
  const { username, body } = req.body;

  commentsModel
    .addCommentToArticle(articleId, username, body)
    .then((comment) => {
      res.status(201).json({ comment });
    })
    .catch((error) => next(error));
};
