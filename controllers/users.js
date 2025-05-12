const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const { JWT_SECRET } = require('../utils/config');

const {
  SUCCESS,
  CREATED,
  BAD_REQUEST,
  UNAUTHORIZED,
  NOT_FOUND,
  CONFLICT,
  INTERNAL_SERVER_ERROR
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(SUCCESS).send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Internal server error" });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        const error = new Error("Email already in use");
        error.status = CONFLICT;
        return Promise.reject(error);
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
        return res.status(CONFLICT).send({ message: err.message });
      }
      if (err.code === 11000) {
        return res.status(CONFLICT).send({ message: "Email already exists" });
      }
      if (err.name === "ValidationError") {
        console.log("ValidationError:", err);
        return res.status(BAD_REQUEST).send({ message: "Invalid request data" });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: "An error has occurred on the server" });
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(SUCCESS).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Requested resource not found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid request data" });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: "An error has occurred on the server" });
    });
};

const updateCurrentUser = (req, res) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, avatar }, { new: true, runValidators: true })
  .then((user) => {
    if (!user) {
      return res.status(NOT_FOUND).send({ message: "Requested resource not found" });
    }
    return res.status(SUCCESS).send(user);
  })
  .catch((err) => {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({ message: "Invalid request data" });
    }
    if (err.name === "CastError") {
      return res.status(BAD_REQUEST).send({ message: "Invalid request data" });
    }
    return res.status(INTERNAL_SERVER_ERROR).send({ message: "An error has occurred on the server" });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!req.body.email || !req.body.password) {
    return res.status(BAD_REQUEST).send({ message: "Email and password are required" });
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
      res
        .status(UNAUTHORIZED)
        .send({ message: "Incorrect email or password" });
    });
};

module.exports = { getUsers, createUser, getCurrentUser, updateCurrentUser, login };
