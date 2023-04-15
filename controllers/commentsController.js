const commentsModel = require("./../models/commentsModel.js");

// Get comments
// exports.getCommentsByArticleId = (req, res, next) => {
//   const { articleId } = req.params;

//   commentsModel
//     .getCommentsByArticleId(articleId)
//     .then((comments) => {
//       res.status(200).json({ comments_total: comments.length, comments });
//     })
//     .catch((error) => next(error));
// };

exports.getCommentsByArticleId = (req, res, next) => {
  const { articleId } = req.params;
  const { page, limit } = req.query; // Extract page and limit from query parameters

  const offset = (page - 1) * limit; // Calculate the offset for pagination

  commentsModel
    .getCommentsByArticleId(articleId, offset, limit) // Pass offset and limit to the function
    .then((comments) => {
      res.status(200).json({ comments_total: comments.length, comments });
    })
    .catch((error) => next(error));
};

// Add comment
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

// Delete comment
exports.deleteComment = (req, res, next) => {
  const { commentId } = req.params;

  commentsModel
    .deleteComment(commentId)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => next(error));
};

// Update votes
exports.updateVotes = (req, res, next) => {
  const { commentId } = req.params;
  const { inc_votes } = req.body;

  commentsModel
    .updateVotes(inc_votes, commentId)
    .then((comment) => {
      res.status(200).json({ comment });
    })
    .catch((error) => next(error));
};
