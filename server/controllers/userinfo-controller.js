
const Userinfo=require("../models/userinfo-model")

const userinfo= async (req,res)=>{
    try{
        const { name,
    age,
    contactNumber,
    email,
    instagramFollowers,
    description,
    photo } = req.body;
        const userCreated= await Userinfo.create({ name,
    age,
    contactNumber,
    email,
    instagramFollowers,
    description,
    photo});

        res.status(200).json({msg: "userinfo successfully"});


    }catch(error){
        res.status(501).json("internal server error");
    }
}
module.exports=userinfo;