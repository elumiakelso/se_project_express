const express = require("express");
const mongoose = require("mongoose");
// const userRouter = require("./routes/users");
// const routes = require("./routes");
const { login, createUser } = require("./controllers/users");
const auth = require("./middlewares/auth"); // Import the auth middleware
const mainRouter = require("./routes/index");
const { getClothingItems } = require("./controllers/clothingItems");
const cors = require("cors");

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

// Public routes (no authorization required)
app.post("/signin", login);
app.post("/signup", createUser);
app.get("/items", getClothingItems);

// Protect all other routes with the auth middleware
app.use(auth);

// app.use((req, res, next) => {
//   req.user = {
//     _id: '67f47d5238d7eb32b158f9ac'// paste the _id of the test user created in the previous step
//   };
//   next();
// });

// Protected routes
// app.use(routes);
app.use("/", mainRouter);
// app.use("/users", require("./routes/users"));

// app.use("/", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
