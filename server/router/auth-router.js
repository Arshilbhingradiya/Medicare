const express = require("express");
const router=express.Router();
const authController= require("../controllers/auth-controller");
const signupSchema = require("../validators/auth-validator");
const authMiddleware = require("../middleware/auth-middleware");
const validate = require("../middleware/validate-middleware");

// both are same 

// router.get('/home', authController.home);
// we can use both methid this and router.get vali pan

// router.route('/').get((req,res)=>{
//     res.status(200).send("welcome my website using router");
// });

router.route('/').get(authController.home);
router.route('/register').post(validate(signupSchema),authController.register);
router.route('/login').post(authController.login);
router.route("/user").get(authMiddleware ,authController.user);


module.exports = router;

