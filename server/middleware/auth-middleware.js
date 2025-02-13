const jwt= require("jsonwebtoken");
const { login } = require("../controllers/auth-controller");
const User = require("../models/user-model");

const authMiddleware = async (req,res,next)=>{
     // next is used in middleware beacause when if any error is present in middleware we not call next so code will not go in controller secrtion

     const token = req.header("Authorization");

     if(!token){
        return res.status(400).send({message:"token not provided"});
     }
     console.log("token form auth middleware", token);
     const jwtToken = token.replace("Bearer" , "").trim();

     try {
        const isverify = jwt.verify(jwtToken,process.env.JWT_SECRET);
     
        const userData= await User.findOne({email:isverify.email}).select({password:0,});
        console.log(userData);
        
        req.user = userData;
        req.token = token;
        req.userID = userData._id;
        next();
     } catch (error) {
        return res.status(401).json({msg:"invalid token unauthiorized"});
     }
     
   
}
module.exports = authMiddleware;