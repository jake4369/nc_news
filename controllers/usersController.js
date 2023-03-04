const usersModel = require("./../models/usersModel");

exports.getAllUsers = (req, res, next) => {
  usersModel
    .getAllUsers()
    .then((users) => {
      res.status(200).json({ users });
    })
    .catch((error) => next(error));
};
