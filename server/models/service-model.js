const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const serviceSchema = new Schema({
  name: { type: String, require: true },
  age: { type: String, require: true },
  followers: { type: String, require: true },
  gender: { type: String, require: true },
  bio: { type: String, require: true },
  image_url: { type: String, require: true },
});

const Service = new model("service", serviceSchema);
module.exports = Service;
