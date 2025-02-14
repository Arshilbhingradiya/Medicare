const Patient = require("../models/patient-model");

const patientprofile = async (req, res) => {
  try {
    const responce = req.body;
    const formcreated = await Patient.create(responce);

    res.status(200).json(req.body);
  } catch (error) {
    console.log(error);
  }
};

module.exports = patientprofile;
