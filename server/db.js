const mongoose = require("mongoose");

// const URI="mongodb://127.0.0.1:27017/";

// mongoose.connect(URI);
const URI = process.env.MONGO_CONN;
const connectdb = async () => {
  try {
    await mongoose.connect(URI);
    console.log("mongodb succesfully connected");
  } catch (error) {
    console.log("mongodb error");
  }
};
// const { InfluDataService } = require("./models/influencer-model");
// // Import models
// const { Service } = require("./models/service-model");

// // Function to copy data from InfluData to Service
// const copyInfluDataToService = async () => {
//   try {
//     const influData = await InfluDataService.find(); // Fetch all documents from InfluData
//     await Service.insertMany(influData); // Insert into Service collection
//     console.log("Data copied successfully!");
//   } catch (err) {
//     console.error("Error copying data:", err);
//   }
// };
// };
// // Define Models
// const InfluencerData = mongoose.model(
//   "infludata",
//   new mongoose.Schema({}, { strict: false })
// );
// const Service = mongoose.model(
//   "service",
//   new mongoose.Schema({}, { strict: false })
// );

// // Copy Data from influencerdata to service
// const copyData = async () => {
//   try {
//     const data = await infludata.find(); // Fetch all documents from influencerdata
//     await Service.insertMany(data); // Insert them into the service collection
//     console.log("Data copied successfully!");
//   } catch (err) {
//     console.error("Error copying data:", err);
//   }
// };

// copyData();
module.exports = connectdb;
