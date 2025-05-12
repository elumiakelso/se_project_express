const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { login, createUser } = require("./controllers/users");
const auth = require("./middlewares/auth");
const mainRouter = require("./routes/index");
const { getClothingItems } = require("./controllers/clothingItems");

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(console.error);

app.use(express.json());
app.use(cors());

// Public routes
app.post("/signin", login);
app.post("/signup", createUser);
app.get("/items", getClothingItems);

// Auth middleware
app.use(auth);

// Protected routes
app.use("/", mainRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
