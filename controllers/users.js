const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const { JWT_SECRET } = require('../utils/config');

const { BadRequestError } = require("../errors/BadRequestError");
const { UnauthorizedError } = require("../errors/UnauthorizedError");
const { NotFoundError } = require("../errors/NotFoundError");
const { ConflictError } = require("../errors/ConflictError");

const {
  SUCCESS,
  CREATED,
  CONFLICT
} = require("../utils/errors");

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return next(new ConflictError("Email already in use"));
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({
        name,
        avatar,
        email,
        password: hash,
      }))
    .then((user) => {
      const plainUser = user.toObject();
      delete plainUser.password;
      return res.status(CREATED).send(plainUser);
    })
    .catch((err) => {
      console.error(err);
      if (err.status === CONFLICT) {
        return next(new ConflictError("Email already exists"));
      }
      if (err.code === 11000) {
        return next(new ConflictError("Email already exists"));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid request data"));
      }
      return next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(SUCCESS).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Requested resource not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid request data"));
      }
      return next(err);
    });
};

const updateCurrentUser = (req, res, next) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, avatar }, { new: true, runValidators: true })
  .then((user) => {
    if (!user) {
      return next(new NotFoundError("Requested resource not found"));
    }
    return res.status(SUCCESS).send(user);
  })
  .catch((err) => {
    console.error(err);
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid request data"));
    }
    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid request data"));
    }
    return next(err);
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!req.body.email || !req.body.password) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        return next(new UnauthorizedError("Incorrect email or password"));
      }
      return next(err);
    });
};

module.exports = { createUser, getCurrentUser, updateCurrentUser, login };
