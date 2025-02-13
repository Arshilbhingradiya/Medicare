const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },

  role: {
    type: String,
    enum: ["Patient", "Doctor"],
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// ----------------------  hashing password -------------------
// userSchema.pre("save", async function(next) {
//     const user = this;

//     if(!user.isModified("password")){
//         next();
//     }
//     try {
//         const saltround=10;
//         const hash_password = await bcrypt.hash(password,saltround);
//         user.password = hash_password;
//     } catch (error) {
//         next(error);

//     }
// })
//  ----------------------  hashing password -------------------

// -----------------------  json web token ---------------------

userSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        email: this.email,
        isAdmin: this.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
  } catch (error) {
    console.error(error);
  }
};

//define the collection name or model

const User = new mongoose.model("Users", userSchema);

module.exports = User;
