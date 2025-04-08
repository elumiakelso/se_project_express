const router = require("express").Router();

const { NOT_FOUND } = require("../utils/errors");

const userRouter = require("./users");
const clothingItemsRouter = require("./clothingItems");

router.use("/users", userRouter);
router.use("/items", clothingItemsRouter);
router.use((req, res) => {
  res.status(NOT_FOUND).send({message: "Requested resource not found"})
});

module.exports = router;
