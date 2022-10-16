const express = require("express");
const router = express.Router();
const {
  userLogin,
  userRegister,
  getAllUsers,
} = require("../controllers/users");

router.post("/register", userRegister);

router.post("/login", userLogin);

router.get("/getAllUsers/:userEmail", getAllUsers);

module.exports = router;
