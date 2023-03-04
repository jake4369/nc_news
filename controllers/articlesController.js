const articlesModel = require("./../models/articlesModel");

exports.getAllArticles = (req, res, next) => {
  articlesModel.getAllArticles().then((articles) => {
    res.status(200).json({
      articles,
    });
  });
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
