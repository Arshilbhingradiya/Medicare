const mongoose=require("mongoose");


const userinfoSchema=new mongoose.Schema({
    name: {
        type: String,
        required: true
      },
      age: {
        type: Number,
        required: true
      },
      contactNumber: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      instagramFollowers: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      photo: {
        type: String,  // Will store the file path or URL
        required: true
      },
})







//define the collection name or model

const Userinfo = new mongoose.model("Userinfos",userinfoSchema);

module.exports = Userinfo;