const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
const bcrypt = require("bcrypt");

exports.userRegister = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email }).select("-password");
    if (user) {
      res.status(200).json({ message: "USER ALREADY REGISTERED" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedpassword = await bcrypt.hashSync(req.body.password, salt);
      let newUser = Users({
        name: req.body.name,
        email: req.body.email,
        password: hashedpassword,
      });
      await newUser.save();
      res.status(200).json({ message: "USER REGISTERED SUCCESSFULLY" });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ message: "USER REGISTERATION ERROR" });
  }
};

exports.userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).send("Inavlid Credentials");
    }

    const isMatch = await bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid Password");
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
      },
    };

    user.password = undefined;

    const token = jwt.sign(payload, "secret", {
      expiresIn: 7200,
    });
    res.cookie("token", token, { expiresIn: 7200 });
    return res.status(200).json({ token, user });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
};

// desc: get all users, except the current one
exports.getAllUsers = async (req, res, next) => {
  try {
    const { userEmail } = req.params;
    const users = await Users.find({}).select("-password -_id -__v");
    const filteredUsers = users.filter((u) => u.email !== userEmail);
    res.status(200).json({ message: "users_found", users: filteredUsers });
  } catch (err) {
    console.log(err);
  }
};
