const { hash } = require("bcryptjs");
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");

const home = async (req, res) => {
  try {
    res.status(200).send("welcome my website using router");
  } catch (error) {
    console.log(error);
  }
};
const register = async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      res.status(404).json({ msg: "email alredy exist" });
    }

    // hash the password
    const saltround = 10;
    const hash_password = await bcrypt.hash(password, saltround);
    // to next line usercreated in this line password: hash_password lakhvu for this method

    const userCreated = await User.create({
      username,
      email,
      phone,
      password: hash_password,
      role,
    });

    res.status(200).json({
      msg: "Registration successfully",
      token: await userCreated.generateToken(),
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    res.status(501).json("internal server error");
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const userExist = await User.findOne({ email, role });

    if (!userExist) {
      res.status(401).json({ msg: "Invalid credential" });
    }

    const ispasswordvalid = await bcrypt.compare(password, userExist.password);

    if (ispasswordvalid) {
      res.status(200).json({
        msg: "Login successfully",
        token: await userExist.generateToken(),
        userId: userExist._id.toString(),
      });
    } else {
      res.status(400).json({ msg: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json("internal server error");
  }
};

// to send user data  - user logic

const user = async (req, res) => {
  try {
    const userData = req.user;
    console.log("user no data ", userData);
    return res.status(200).json({ userData });
  } catch (error) {
    console.log("error from the user route");
  }
};
module.exports = { home, register, login, user };
