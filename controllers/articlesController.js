const articlesModel = require("./../models/articlesModel");

exports.getAllArticles = (req, res, next) => {
  const topic = req.query.topic || null;
  const sort_by = req.query.sort_by || "created_at";
  const order = req.query.order || "desc";
  articlesModel
    .getAllArticles(topic, sort_by, order)
    .then((articles) => {
      res.status(200).json({
        articles,
      });
    })
    .catch((error) => next(error));
};

exports.getArticle = (req, res, next) => {
  const { articleId } = req.params;

  articlesModel
    .getArticle(articleId)
    .then((article) => {
      res.status(200).json({ article });
    })
    .catch((error) => {
      next(error);
    });
};

exports.updateArticle = (req, res, next) => {
  const { articleId } = req.params;
  const { incVotes } = req.body;

  articlesModel
    .updateArticle(articleId, incVotes)
    .then((article) => {
      res.status(200).json({ article });
    })
    .catch((error) => next(error));
};
