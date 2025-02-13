const Contact=require("../models/contact-model");

const contactform = async (req,res)=>{
    try{
        const responce = req.body;
        const formcreated = await Contact.create(responce);
        
        res.status(200).json(req.body);
        // console.log("successfuly saved");
        //
    }catch(error){
        console.log(error);
    }
}

module.exports = contactform;