const Doctor = require("../models/Doctor-model");

const doctorprofile = async (req, res) => {
  try {
    const responce = req.body;
    const formcreated = await Doctor.create(responce);

    res.status(200).json(req.body);
  } catch (error) {
    console.log(error);
  }
};
// const doctorverification = async (req, res) => {
//   try {
//     const responce = req.body;
//     const formcreated = await Verification.create(responce);

//     res.status(200).json(req.body);
//   } catch (error) {
//     console.log(error);
//   }
// };

module.exports = doctorprofile;
