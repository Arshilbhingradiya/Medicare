const jwt= require("jsonwebtoken");
const User = require("../models/user-model");

const authMiddleware = async (req,res,next)=>{
     // next is used in middleware beacause when if any error is present in middleware we not call next so code will not go in controller secrtion

     const token = req.header("Authorization");

     if(!token){
        return res.status(401).send({message:"Authentication required. Please log in."});
     }
     const jwtToken = token.replace("Bearer" , "").trim();

     try {
        const isverify = jwt.verify(jwtToken,process.env.JWT_SECRET);
     
            const userData = await User.findOne({
               $or: [
                  ...(isverify.userId ? [{ _id: isverify.userId }] : []),
                  ...(isverify.email ? [{ email: isverify.email }] : []),
               ],
            }).select({password:0});

            if (!userData) {
               return res.status(401).json({ msg: "User account not found. Please log in again." });
            }
        
        req.user = userData;
        req.token = token;
        req.userID = userData._id;
        next();
     } catch (error) {
      return res.status(401).json({msg:"Session expired. Please log in again."});
     }
     
   
}
module.exports = authMiddleware;