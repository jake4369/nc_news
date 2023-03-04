const topicsModel = require("./../models/topicsModel");

exports.getAllTopics = (req, res, next) => {
  topicsModel
    .getAllTopics()
    .then((topics) => {
      res.status(200).json({
        topics,
      });
    })
    .catch((error) => next(error));
};
