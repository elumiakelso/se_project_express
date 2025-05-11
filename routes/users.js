// const { get } = require("mongoose");

const router = require("express").Router();
const { getCurrentUser, updateCurrentUser } = require("../controllers/users");

// router.get("/", getUsers);
// router.get("/:userId", getUser);
// router.post("/", createUser);
router.get("/me", getCurrentUser);
router.patch("/me", updateCurrentUser);
// router.post("/signin", login);

module.exports = router;
