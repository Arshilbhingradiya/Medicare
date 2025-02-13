const express = require("express");
const router= express.Router();
const userinfo =require("../controllers/userinfo-controller"); 

router.post("/userinfo",userinfo);

module.exports = router;