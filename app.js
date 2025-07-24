const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

const { errors } = require('celebrate');
const { login, createUser } = require("./controllers/users");
const auth = require("./middlewares/auth");
const mainRouter = require("./routes/index");
const { getClothingItems } = require("./controllers/clothingItems");
const errorHandler = require("./middlewares/error-handler");
const { validateLogin, validateUserBody } = require("./middlewares/validation");
const { requestLogger, errorLogger, statusLogger } = require('./middlewares/logger');

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    statusLogger.info("Connected to DB");
  })
  .catch((err) => {
    statusLogger.error(`DB connection error: ${err}`);
  });

app.use(express.json());
app.use(cors());

// Enable request logger before routes
app.use(requestLogger);


// Public routes
app.post("/signin", validateLogin, login);
app.post("/signup", validateUserBody, createUser);
app.get("/items", getClothingItems);

// Server crash testing
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

// Auth middleware
app.use(auth);

// Protected routes
app.use("/", mainRouter);

// Enable error logger after routes, before error handlers
app.use(errorLogger);

// Celebrate error handler
app.use(errors());

// Centralized error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  statusLogger.info(`Server is running on port ${PORT}`);
});
