const { Schema, model, mongoose } = require("mongoose");

const patientSchema = new Schema({
  name: {
    type: "String",
    require: true,
  },
  age: {
    type: "String",
    require: true,
  },
  gender: {
    type: "String",
    require: true,
  },

  email: {
    type: "String",
    require: true,
  },

  phone: {
    type: "String",
    require: true,
  },
  address: {
    type: "String",
    require: true,
  },
});

const Patient = new model("patientprofile", patientSchema);
module.exports = Patient;
