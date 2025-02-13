const Service = require("../models/service-model");

const services = async (req, res) => {
  try {
    const response = req.body;
    const userCreated = await Service.create({
      name,
      age,
      followers,
      gender,
      bio,
      image_url,
    });

    if (!response) {
      return res.status(404).json({ message: "No services found" });
    }
    res.status(200).json({ msg: response });
  } catch (error) {
    console.log("service:", error);
  }
};

module.exports = services;
