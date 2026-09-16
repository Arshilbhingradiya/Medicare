const { Schema, model, mongoose } = require("mongoose");

const patientSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    unique: true,
    sparse: true,
  },
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
  medicalHistory: {
    type: String,
  },
  avatar: {
    type: String,
  },
});

const Patient = new model("patientprofile", patientSchema);
module.exports = Patient;
