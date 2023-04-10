const usersModel = require("./../models/usersModel");

exports.getAllUsers = (req, res, next) => {
  usersModel
    .getAllUsers()
    .then((users) => {
      res.status(200).json({ users });
    })
    .catch((error) => next(error));
};

exports.getUser = (req, res, next) => {
  const { username } = req.params;
  usersModel
    .getUser(username)
    .then((user) => {
      res.status(200).json({ user });
    })
    .catch((error) => next(error));
};
